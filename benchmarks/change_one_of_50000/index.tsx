import xs, { Stream } from 'xstream'
import { run, Drivers, FantasyObservable } from '@cycle/run'
import * as L from 'lodash'

import { h, makeDOMDriver, DOMSource } from '../../src/cycle'
import { cx } from '../../src/helpers'

export interface Sources {
  DOM: DOMSource,
}

export interface Sinks {
  DOM: Stream<JSX.Element>,
  [key: string]: FantasyObservable,
}


const drivers: Drivers<Sources, Sinks> = {
  DOM: makeDOMDriver('#app'),
}

function main({ DOM }: Sources): Sinks {
  const selected$: Stream<string> = DOM.selectEvents('.item', 'click').map(event => event.target.id)

  const list = L.range(50000)
    .map(index => {
      const class$ = selected$
        .map(id => id === String(index) ? 'selected' : '')
        .map(className => cx('item', className))
        .startWith('item')
      return <li class$={class$} id={String(index)}>select me</li>
    })

  const vtree = (
    <ul>
      {list}
    </ul>
  )
  return {
    DOM: xs.of(vtree),
  }
}

run(main, drivers)
