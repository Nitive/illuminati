import { h, cx, select } from '../../src/'

export function main() {
  const buttonClick$ = select('.pressme').events('click')

  const containerClass$ = buttonClick$
    .fold(state => !state, false)
    .map(state => cx('container', state && 'highlighted'))

  return (
    <div class$={containerClass$}>
      <button class='pressme'>Press Me</button>
    </div>
  )
}
