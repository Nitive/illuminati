import xs from 'xstream'

import { div, button } from './dom'
import { Sources, Sinks } from './index'

export function App(sources: Sources): Sinks {
  const incClick$ = sources.DOM.selectEvents('.inc', 'click')
  const visibilityClick$ = sources.DOM.selectEvents('.visibility', 'click')

  const count$ = incClick$
    .mapTo(1)
    .fold((acc, x) => acc + x, 0)

  const visible$ = visibilityClick$
    .fold(state => !state, false)

  const state = {
    showed: true,
    count: 0,
  }

  const vtree = div('', {}, [
    button('.visibility', {}, state.showed ? 'hide' : 'show'),
    div('', { visible$ }, [
      button('.inc', {}, ['+']),
      `Clicked times: `,
      String(state.count),
    ]),
  ])

  return {
    DOM: xs.of(vtree),
  }
}
