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
    .fold(state => !state, true)

  const buttonText$ = visible$.map(state => state ? 'hide' : 'show')

  const vtree = (
    <div>
      <button class='visibility'>
        {buttonText$}
      </button>
      <div if$={visible$}>
        <button class='inc'>+</button>
        Clicked times: {count$}
      </div>
    </div>
  )

  return {
    DOM: xs.of(vtree),
  }
}
