import { main } from './main'
import { run, click } from '../../src/test_helpers'

describe('toggle_visibility', () => {
  let app: HTMLDivElement

  beforeAll(async() => {
    app = await run(main())
  })

  it('should render button but not render content', async() => {
    expect(app.innerHTML).toBe('<div><button class="toggle">toggle</button></div>')
  })

  it('should show content after first click', async() => {
    await click('.toggle')
    expect(app.innerHTML).toBe('<div><button class="toggle">toggle</button><div>content</div></div>')

  })

  it('should hide content after second click', async() => {
    await click('.toggle')
    expect(app.innerHTML).toBe('<div><button class="toggle">toggle</button></div>')
  })
})
