import xs from 'xstream'

import { div, button } from './dom'
import { Sources, Sinks } from './index'

export function App(sources: Sources): Sinks {
  const incClick$ = sources.DOM.selectEvents('.inc', 'click')
  const visibilityClick$ = sources.DOM.selectEvents('.visibility', 'click')

  const count$ = incClick$
    .fold(count => count + 1, 0)
    .map(String)

  const visible$ = visibilityClick$
    .fold(state => !state, false)

  const vtree = div('', {}, [
    button('.visibility', {}, visible$.map(state => state ? 'hide' : 'show')),
    div('', { visible$ }, [
      button('.inc', {}, '+'),
      `Clicked times: `,
      count$,
    ]),
  ])

  return {
    DOM: xs.of(vtree),
  }
}
