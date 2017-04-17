import { h, select } from '../../src/'

export function main() {
  const visible$ = select('.toggle').events('click')
    .fold(visible => !visible, false)

  return (
    <div>
      <button class='toggle'>toggle</button>
      <div if$={visible$}>content</div>
    </div>
  )
}
