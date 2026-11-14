import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// The Starry Night (Van Gogh, 1889, public domain): the painting behind the chat, and the
// app's colours taken from it. Night navy and moonlight cream, moon-gold accent.
const { theme, problems } = makeColors({
  label: 'Starry Night',
  roles: { accent: '#e3b23c', danger: '#c2492f', success: '#3e7a4a', warning: '#d9772b', pro: '#6c63b8' },
  // Day: the pale swirls of the sky, with night-navy ink.
  light: {
    gray: {
      anchors: {
        'surface-0': '#dfe6e6',
        'surface-1': '#e7ecea',
        'surface-2': '#eef2ee',
        'text-primary': '#0f1d3d',
        'text-secondary': '#2b3d5e',
        'text-muted': '#4a5a75',
      },
    },
  },
  // Night: the deep blue of the sky, with moonlight-cream text.
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0b1631',
        'surface-1': '#0f1c3a',
        'surface-2': '#132242',
        'surface-3': '#17284a',
        'text-primary': '#f4efd8',
        'text-secondary': '#cdd8dc',
        'text-muted': '#9fb2c4',
      },
    },
  },
})
export { problems }

// A scene, not an image ground: Desktop draws scenes full-window under its frosted panels,
// and this build of it refuses an image ground and strips images out of a scene.
const SCENE = 'starry-night'
const LOOK: ThemeSetArgs = { colors: theme, backdrop: { scene: SCENE, glass: { blur: 12, opacity: 0.6 } } }

export const register: Register = on => {
  let svg = ''

  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) $.ui.toast(unpainted)

    // The painting repainted as ~7,500 vector brushstrokes (no <image>), under Svg's 131,072-char cap.
    // Its root is xMaxYMin slice: the moon stays in view, a wide window loses the village.
    svg = await $.fs.read(`${$.plugin.root}/assets/starry-night.svg`)

    const set = await $.theme.set(LOOK)
    if (!set.isDrawn) $.ui.status(`Starry Night: ${set.reason}`)

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.plugin !== SCENE || e.props.scene !== SCENE || !svg) return next(e)
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)

    const { Svg } = $.ui.resolve(e)
    return <Svg source={svg} alt="The Starry Night by Vincent van Gogh, repainted in brushstrokes" />
  })
}
