import { Stream } from 'xstream'
import { run, Drivers, FantasyObservable } from '@cycle/run'

import { makeDOMDriver, DOMSource } from '../../src/cycle'
import { main } from './main'

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

run(main, drivers)
