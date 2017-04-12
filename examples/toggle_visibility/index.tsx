import xs, { Stream } from 'xstream'
import { run, Drivers, FantasyObservable } from '@cycle/run'

import { h, makeDOMDriver, DOMSource } from '../../src/cycle'

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
  const visible$ = DOM.selectEvents('.toggle', 'click')
    .fold(visible => !visible, false)

  const vtree = (
    <div>
      <button class='toggle'>toggle</button>
      <div if$={visible$}>content</div>
    </div>
  )

  return {
    DOM: xs.of(vtree),
  }
}

run(main, drivers)
