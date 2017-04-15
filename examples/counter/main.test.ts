import { main } from './main'
import { run, click } from '../../src/test_helpers'

describe('counter', () => {
  let app: HTMLDivElement
  it('should render div with count and inc & dec buttons', async() => {
    app = await run(main)
    expect(app.innerHTML).toBe('<div><div>0</div><button class="dec">-</button><button class="inc">+</button></div>')
  })

  it('should increment count after second .inc click', async() => {
    await click('.inc')
    expect(app.innerHTML).toBe('<div><div>1</div><button class="dec">-</button><button class="inc">+</button></div>')
  })

  it('should increment count after second .inc click', async() => {
    await click('.inc')
    expect(app.innerHTML).toBe('<div><div>2</div><button class="dec">-</button><button class="inc">+</button></div>')
  })

  it('should decriment count after .dec click', async() => {
    await click('.dec')
    expect(app.innerHTML).toBe('<div><div>1</div><button class="dec">-</button><button class="inc">+</button></div>')
  })
})
