import xs, { Stream } from 'xstream'
import * as L from 'lodash'

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

  const range = L.range(15)
  const keys$ = xs.periodic(5000)
    .startWith(0)
    .map(() => range.filter(() => Math.random() > .5))

  interface Item {
    color: Stream<string>,
    count: number,
    index: number,
  }

  interface State {
    items: Item[],
  }

  const initialState: State = {
    items: Array(15)
      .fill(undefined)
      .map((_, index) => {
        return {
          color: xs.periodic(1000).map(() => L.sample(['yellowgreen', 'tomato', 'azure', 'gray'])),
          count: 0,
          index,
        }
      }),
  }
  const state$ = xs.periodic(1000)
    .fold((state, x) => {
      return {
        ...state,
        count: x,
      }
    }, initialState)

  const items = range
    .map(key => {
      const data$ = state$.map(state => state.items.find(item => item.index === key)!)
      return (
        <div>
          array element with key: {key},
          color: {data$.map(data => data.color).flatten()},
          count: {data$.map(data => data.count)},
        </div>
      )
    })

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
        <collection keys$={keys$}>{L.zipObject(range, items)}</collection>
      </div>
    </div>
  )

  return {
    DOM: xs.of(vtree),
  }
}
