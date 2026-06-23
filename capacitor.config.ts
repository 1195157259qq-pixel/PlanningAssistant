import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.planning.assistant',
  appName: '计划助手',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
