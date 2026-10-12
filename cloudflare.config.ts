import { defineConfig } from 'cf/config'

export default defineConfig((ctx) => {
  const name = 'material-demo'

  return {
    worker: {
      name,
      compatibilityDate: '2026-09-22',
      compatibilityFlags: ['global_fetch_strictly_public'],
      previewUrls: true,
      placement: {
        mode: 'smart',
      },
      observability: {
        enabled: true,
        headSamplingRate: 1,
        traces: {
          enabled: true,
        },
        issues: {
          enabled: true,
        },
      },
    },
  }
})
