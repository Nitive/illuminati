import xs from 'xstream'

import { h } from './dom'
import { Sources, Sinks } from './index'

export function App(sources: Sources): Sinks {
  const incClick$ = sources.DOM.selectEvents('.inc', 'click')
  const visibilityClick$ = sources.DOM.selectEvents('.visibility', 'click')

  const count$ = incClick$
    .fold(count => count + 1, 0)
    .map(String)

  const visible$ = visibilityClick$
    .fold(state => !state, false)

  const vtree = (
    <div>
      <button class='visibility'>
        {visible$.map(state => state ? 'hide' : 'show')}
      </button>
      <div visible$={visible$}>
        <button class='inc'>+</button>
        Clicked times: {count$}
      </div>
    </div>
  )

  return {
    DOM: xs.of(vtree),
  }
}
