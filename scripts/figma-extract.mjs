#!/usr/bin/env node
// Fetch text-node positions/styles from a Figma file and write them to figma-text.json.
//
// Usage: npm run figma:extract
// Env vars (in .env at project root):
//   FIGMA_FILE_KEY    required — the key in your file URL
//   FIGMA_TOKEN       required — personal access token (read access to file)
//   FIGMA_FRAME_NAME  optional — if set, output is restricted to text inside this frame
//                                 and coords are made relative to it

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  const envPath = resolve(ROOT, '.env')
  if (!existsSync(envPath)) {
    console.error(`Missing ${envPath}. Copy .env.example to .env and fill in values.`)
    process.exit(1)
  }
  const text = readFileSync(envPath, 'utf8')
  const env = {}
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

function findNodeByName(node, name) {
  if (node.name === name && node.absoluteBoundingBox) return node
  if (node.children) {
    for (const child of node.children) {
      const hit = findNodeByName(child, name)
      if (hit) return hit
    }
  }
  return null
}

function collectTextNodes(node, ancestors = []) {
  const out = []
  if (node.type === 'TEXT') {
    out.push({
      id: node.id,
      name: node.name,
      text: node.characters ?? '',
      fontSize: node.style?.fontSize,
      fontFamily: node.style?.fontFamily,
      fontWeight: node.style?.fontWeight,
      letterSpacing: node.style?.letterSpacing,
      lineHeightPx: node.style?.lineHeightPx,
      textAlignHorizontal: node.style?.textAlignHorizontal,
      textAlignVertical: node.style?.textAlignVertical,
      fills: node.fills?.map((f) => ({
        type: f.type,
        color: f.color,
        opacity: f.opacity
      })),
      bbox: node.absoluteBoundingBox,
      parents: ancestors
    })
  }
  if (node.children) {
    for (const child of node.children) {
      out.push(...collectTextNodes(child, [...ancestors, node.name]))
    }
  }
  return out
}

// Panel-group container names. Any non-text leaf inside one of these is captured
// as an "asset placement" (e.g. positioned strawberry rectangles inside `stats`).
const PANEL_GROUPS = new Set(['timer', 'tasks', 'stats', 'settings'])

function collectImageNodes(node, ancestors = []) {
  const out = []
  const inPanelGroup = ancestors.some((a) => PANEL_GROUPS.has(a))
  const isLeaf = !node.children || node.children.length === 0
  // Only RECTANGLE leaves are real exported PNG assets (each PNG is placed as a
  // rectangle with an image fill). Figma's own helper shapes — container FRAMEs,
  // VECTORs (the modifier pill/arrow drawings), ELLIPSEs (toggle circles) — are
  // not assets and would otherwise pollute the json as stale nodes.
  if (inPanelGroup && isLeaf && node.type === 'RECTANGLE' && node.absoluteBoundingBox) {
    out.push({
      id: node.id,
      name: node.name,
      type: node.type,
      bbox: node.absoluteBoundingBox,
      parents: ancestors
    })
  }
  if (node.children) {
    for (const child of node.children) {
      out.push(...collectImageNodes(child, [...ancestors, node.name]))
    }
  }
  return out
}

// Drop duplicate placements of the same asset within the same panel (e.g. an old
// "strawberry-stat-display" left next to a redesigned one) — keep the last, which
// is the topmost in Figma's z-order and thus the current version.
function dedupeImageNodes(nodes) {
  const byKey = new Map()
  for (const n of nodes) byKey.set(`${n.name}|${n.parents.join('>')}`, n)
  return [...byKey.values()]
}

function relativize(textNodes, frame) {
  const ox = frame.absoluteBoundingBox.x
  const oy = frame.absoluteBoundingBox.y
  return textNodes.map((t) => ({
    ...t,
    bboxRelative: t.bbox && {
      x: t.bbox.x - ox,
      y: t.bbox.y - oy,
      width: t.bbox.width,
      height: t.bbox.height
    }
  }))
}

async function main() {
  const env = loadEnv()
  const { FIGMA_FILE_KEY, FIGMA_TOKEN, FIGMA_FRAME_NAME } = env
  if (!FIGMA_FILE_KEY) {
    console.error('FIGMA_FILE_KEY missing in .env')
    process.exit(1)
  }
  if (!FIGMA_TOKEN) {
    console.error('FIGMA_TOKEN missing in .env')
    process.exit(1)
  }

  console.log(`Fetching Figma file ${FIGMA_FILE_KEY}...`)
  const res = await fetch(`https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN }
  })
  if (!res.ok) {
    console.error(`Figma API error ${res.status}: ${await res.text()}`)
    process.exit(1)
  }
  const data = await res.json()
  console.log(`File: "${data.name}" (last modified ${data.lastModified})`)

  let originFrame = null
  let textNodes = collectTextNodes(data.document)
  let imageNodes = dedupeImageNodes(collectImageNodes(data.document))

  if (FIGMA_FRAME_NAME) {
    originFrame = findNodeByName(data.document, FIGMA_FRAME_NAME)
    if (!originFrame) {
      console.error(`Node "${FIGMA_FRAME_NAME}" not found in file.`)
      console.error('Top-level pages/nodes available:')
      for (const page of data.document.children ?? []) {
        console.error(`  - ${page.name}`)
        for (const child of page.children ?? []) {
          console.error(`      - ${child.name} (${child.type})`)
        }
      }
      process.exit(1)
    }
    console.log(
      `Origin node: "${originFrame.name}" (${originFrame.type}) — ${originFrame.absoluteBoundingBox.width}x${originFrame.absoluteBoundingBox.height} at (${originFrame.absoluteBoundingBox.x}, ${originFrame.absoluteBoundingBox.y})`
    )
    textNodes = relativize(textNodes, originFrame)
    imageNodes = relativize(imageNodes, originFrame)
  }

  console.log(`Found ${textNodes.length} text node(s), ${imageNodes.length} image/asset node(s).`)

  const output = {
    file: { key: FIGMA_FILE_KEY, name: data.name, lastModified: data.lastModified },
    originFrame: originFrame
      ? {
          id: originFrame.id,
          name: originFrame.name,
          width: originFrame.absoluteBoundingBox.width,
          height: originFrame.absoluteBoundingBox.height
        }
      : null,
    textNodes,
    imageNodes
  }

  const outPath = resolve(ROOT, 'src/renderer/src/figma-text.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`Wrote ${outPath}`)
}

await main()