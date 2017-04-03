// tslint:disable:no-multi-spaces
const toHTML = require('snabbdom-to-html')
import { VNode } from '@cycle/dom'
import { mockTimeSource } from '@cycle/time'
import { mockDOMSource } from '@cycle/dom'

import { App } from './app'

describe('Buttons', () => {
  it('should show inscription only after all buttons clicked', done => {
    const Time = mockTimeSource()

    const one$      = Time.diagram('--x-----|')
    const two$      = Time.diagram('------x-|')
    const three$    = Time.diagram('----x---|')
    const expected$ = Time.diagram('a-----b-|', { a: false, b: true })

    const DOM = mockDOMSource({
      '.one': { click: one$ },
      '.two': { click: two$ },
      '.three': { click: three$ },
    })

    function check(vtree: VNode): boolean {
      return toHTML(vtree).includes('All buttons was pressed')
    }

    const actual$ = App({ DOM }).DOM.map(check)

    Time.assertEqual(actual$, expected$)
    Time.run(done)
  })
})
