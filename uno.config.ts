import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWebFonts,
  presetWind,
} from 'unocss'
import theme from './src/theme'

export default defineConfig({
  shortcuts: [
  ],
  theme,
  presets: [
    presetWind(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
})
