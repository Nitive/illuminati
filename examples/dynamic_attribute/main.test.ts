import { main } from './main'
import { run, click } from '../../src/test_helpers'

describe('dynamic_attribute', () => {
  let app: HTMLDivElement

  it('should render Press Me button', async() => {
    app = await run(main)
    expect(app.innerHTML).toBe('<div class="container"><button class="pressme">Press Me</button></div>')
  })

  it('should add class `highlighted` after first button click', async() => {
    await click('.pressme')
    expect(app.innerHTML).toBe('<div class="container highlighted"><button class="pressme">Press Me</button></div>')
  })

  it('should remove class `highlighted` after second button click', async() => {
    await click('.pressme')
    expect(app.innerHTML).toBe('<div class="container"><button class="pressme">Press Me</button></div>')
  })
})
