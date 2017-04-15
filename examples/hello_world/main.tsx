import xs from 'xstream'

import { h } from '../../src/cycle'
import { Sinks } from './'

export function main(): Sinks {
  const vtree = <h1>Hello, World!</h1>

  return {
    DOM: xs.of(vtree),
  }
}
