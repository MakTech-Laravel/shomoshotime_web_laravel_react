import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const studyPdfQuery = '?study-pdf-inline'

/**
 * Inlines study PDF binaries as data URLs in the JS bundle.
 * No HTTP request to *.pdf — Internet Download Manager cannot intercept.
 */
function inlineStudyPdfBin(): Plugin {
  return {
    name: 'inline-study-pdf-bin',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!source.includes('study-pdfs') || !source.endsWith('.bin')) {
        return null
      }

      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true })
      if (!resolved) return null;

      return `${resolved.id}${studyPdfQuery}`
    },
    async load(id) {
      if (!id.endsWith(studyPdfQuery)) return null

      const filePath = id.slice(0, -studyPdfQuery.length)
      const buffer = await fs.readFile(filePath)
      const dataUrl = `data:application/octet-stream;base64,${buffer.toString('base64')}`
      return `export default ${JSON.stringify(dataUrl)}`
    },
  }
}

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1200,
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    inlineStudyPdfBin(),
  ],
  resolve: {
    dedupe: ['pdfjs-dist'],
    alias: {
      '@': path.resolve(rootDir, './src'),
      'pdfjs-dist': path.resolve(rootDir, 'node_modules/pdfjs-dist'),
    },
  },
})
