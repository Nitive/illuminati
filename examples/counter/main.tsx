import xs from 'xstream'
import { h, select } from '../../src/'

export function main() {
  const count$ = xs
    .merge(
      select('.inc').events('click').mapTo(+1),
      select('.dec').events('click').mapTo(-1),
    )
    .fold((count, x) => count + x, 0)

  return (
    <div>
      <div>{count$}</div>
      <button class='dec'>-</button>
      <button class='inc'>+</button>
    </div>
  )
}
