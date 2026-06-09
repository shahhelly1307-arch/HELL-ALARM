#!/usr/bin/env python3
# Pure-stdlib PNG alpha-bbox reader.
# Usage: python3 scripts/alpha-bbox.py <png> [<png> ...]
# Reports the visible (non-transparent) bounding box for each PNG.

import struct
import sys
import zlib
from pathlib import Path

PNG_SIG = b"\x89PNG\r\n\x1a\n"


def read_png(path: Path):
    data = path.read_bytes()
    if data[:8] != PNG_SIG:
        raise ValueError(f"{path}: not a PNG")
    pos = 8
    ihdr = None
    idat = bytearray()
    while pos < len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        ctype = data[pos + 4 : pos + 8].decode("ascii")
        cdata = data[pos + 8 : pos + 8 + length]
        if ctype == "IHDR":
            ihdr = struct.unpack(">IIBBBBB", cdata)
        elif ctype == "IDAT":
            idat.extend(cdata)
        elif ctype == "IEND":
            break
        pos += 8 + length + 4
    if ihdr is None:
        raise ValueError(f"{path}: missing IHDR")
    width, height, bit_depth, color_type, _compression, _filter, interlace = ihdr
    if interlace != 0:
        raise NotImplementedError(f"{path}: interlaced PNGs not supported")
    if bit_depth != 8:
        raise NotImplementedError(f"{path}: only 8-bit PNGs supported (got {bit_depth})")
    # color type: 0=gray, 2=RGB, 3=indexed, 4=gray+alpha, 6=RGBA
    if color_type == 6:
        bpp = 4
        alpha_offset = 3
    elif color_type == 4:
        bpp = 2
        alpha_offset = 1
    else:
        raise NotImplementedError(
            f"{path}: color type {color_type} (need RGBA=6 or gray+alpha=4)"
        )
    raw = zlib.decompress(bytes(idat))
    stride = width * bpp
    return width, height, bpp, alpha_offset, stride, raw


def paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa = abs(p - a)
    pb = abs(p - b)
    pc = abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def unfilter(raw: bytes, width: int, height: int, bpp: int, stride: int) -> bytes:
    out = bytearray(stride * height)
    pos = 0
    prev_row = bytes(stride)
    for y in range(height):
        ftype = raw[pos]
        pos += 1
        row = bytearray(raw[pos : pos + stride])
        pos += stride
        if ftype == 0:
            pass
        elif ftype == 1:  # Sub
            for x in range(bpp, stride):
                row[x] = (row[x] + row[x - bpp]) & 0xFF
        elif ftype == 2:  # Up
            for x in range(stride):
                row[x] = (row[x] + prev_row[x]) & 0xFF
        elif ftype == 3:  # Average
            for x in range(stride):
                a = row[x - bpp] if x >= bpp else 0
                b = prev_row[x]
                row[x] = (row[x] + (a + b) // 2) & 0xFF
        elif ftype == 4:  # Paeth
            for x in range(stride):
                a = row[x - bpp] if x >= bpp else 0
                b = prev_row[x]
                c = prev_row[x - bpp] if x >= bpp else 0
                row[x] = (row[x] + paeth(a, b, c)) & 0xFF
        else:
            raise ValueError(f"unknown filter type {ftype} on row {y}")
        out[y * stride : (y + 1) * stride] = row
        prev_row = bytes(row)
    return bytes(out)


def alpha_bbox(path: Path):
    width, height, bpp, alpha_offset, stride, raw = read_png(path)
    pixels = unfilter(raw, width, height, bpp, stride)
    min_x = width
    min_y = height
    max_x = -1
    max_y = -1
    for y in range(height):
        row_base = y * stride
        for x in range(width):
            alpha = pixels[row_base + x * bpp + alpha_offset]
            if alpha > 0:
                if x < min_x:
                    min_x = x
                if x > max_x:
                    max_x = x
                if y < min_y:
                    min_y = y
                if y > max_y:
                    max_y = y
    if max_x < 0:
        return width, height, None
    return width, height, (min_x, min_y, max_x + 1, max_y + 1)


def main():
    for arg in sys.argv[1:]:
        p = Path(arg)
        width, height, bbox = alpha_bbox(p)
        print(f"{p}")
        print(f"  full size       : {width} x {height}")
        if bbox is None:
            print("  fully transparent")
        else:
            l, t, r, b = bbox
            print(f"  visible bbox    : x={l} y={t}  ->  x={r} y={b}")
            print(f"  visible size    : {r - l} x {b - t}")
        print()


if __name__ == "__main__":
    main()