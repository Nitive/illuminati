import xs from 'xstream'

import { h } from './dom'
import { Sources, Sinks } from './index'

type Falsy = false | 0 | '' | null | undefined
function joinClasses(...classes: Array<string | Falsy>) {
  return classes.filter(Boolean).join(' ')
}

export function App(sources: Sources): Sinks {
  const incClick$ = sources.DOM.selectEvents('.inc', 'click')
  const visibilityClick$ = sources.DOM.selectEvents('.visibility', 'click')

  const count$ = incClick$
    .fold(count => count + 1, 0)
    .map(String)

  const visible$ = visibilityClick$
    .fold(state => !state, false)

  const buttonText$ = visible$.map(state => state ? 'hide' : 'show')
  const highlighted$ = xs.periodic(1000).fold(highlighted => !highlighted, true)
  const buttonClass$ = highlighted$.map(highlighted => joinClasses('inc', highlighted && 'highlighted'))

  const arrOfComponents = [
    <div>div</div>,
    'string',
    <br />,
    'stream: ',
    count$,
  ]

  const streamOfArray$ = xs.periodic(1000)
    .map(() => Math.random() * 15)
    .map(Math.round)
    .map(len => Array(len).fill(0).map((_, i) => <div key={i}>array element</div>))

  const vtree = (
    <div>
      <div>
        <button class='visibility' type='button'>
          {buttonText$}
        </button>
        <div if$={visible$}>
          <button class$={buttonClass$}>+</button>
          Clicked times: {count$}
          {arrOfComponents}
        </div>
      </div>
      <div>
        {streamOfArray$}
      </div>
    </div>
  )

  return {
    DOM: xs.of(vtree),
  }
}
