import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.hellalarm.app',
  appName: 'HELL-ALARM',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}

export default config
