import type { ThemeSetArgs } from 'claude-code'
import { expect, test } from 'claude-code/testing'

import { problems } from './hooks/register.tsx'

const BACKDROP = {
  plugin: 'starry-night',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'starry-night', plugin: 'starry-night', glass: { blur: 12, opacity: 0.6 } },
} as const

test('Desktop paints the palette', () => {
  expect(problems.filter(line => line.startsWith("Desktop won't paint"))).toEqual([])
})

test('the painting is the scene behind the chat, with its colours', async ($, on) => {
  const sets: ThemeSetArgs[] = []
  on('fs.read', () => ({ value: '<svg viewBox="0 0 1000 785"><path d="M1 1l9 3"/></svg>' }))
  on('theme.set', (_, e) => {
    sets.push(e)
    return { value: { isDrawn: true, requestId: 'backdrop' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  expect(sets.length).toBe(1)
  expect(sets[0]?.backdrop).toEqual({ scene: 'starry-night', glass: { blur: 12, opacity: 0.6 } })
  expect(sets[0]?.colors?.label).toBe('Starry Night')

  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })
    const svg = await ui.find({ type: 'Svg' })
    expect(svg?.props.source).toBe('<svg viewBox="0 0 1000 785"><path d="M1 1l9 3"/></svg>')
    await ui.unmount()
  }

  const other = await $.ui.mount({
    ...BACKDROP,
    surface: 'desktop',
    props: { ...BACKDROP.props, plugin: 'someone-else' },
  })
  expect(await other.find({ type: 'Svg' })).toBeUndefined()
  await other.unmount()
})
