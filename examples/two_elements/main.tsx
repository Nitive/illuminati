import { h, select } from '../../src/'

export function main() {
  const oneVisible$ = select('.one').events('click').fold(visible => !visible, true)
  const twoVisible$ = select('.two').events('click').fold(visible => !visible, true)

  return (
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
}
