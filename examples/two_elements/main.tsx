import xs from 'xstream'

import { h } from '../../src/cycle'
import { Sources, Sinks } from './'

export function main({ DOM }: Sources): Sinks {
  const oneVisible$ = DOM.selectEvents('.one', 'click').fold(visible => !visible, true)
  const twoVisible$ = DOM.selectEvents('.two', 'click').fold(visible => !visible, true)

  const vtree = (
    <div>
      <p>
        Currently this example works incorrectly — element adds to end of list but should add to its place in vtree.
        Toggle one two times to reproduce
        <br />
        <a href='https://github.com/Nitive/illuminati/issues/4'>Related issue</a>
      </p>

      <button class='one'>toggle one</button>
      <button class='two'>toggle two</button>
      <div class='content'>
        <div if$={oneVisible$}>1. one</div>
        <div if$={twoVisible$}>2. two</div>
      </div>
    </div>
  )

  return {
    DOM: xs.of(vtree),
  }
}
