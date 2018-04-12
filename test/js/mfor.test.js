import puppeteer from 'puppeteer'
import Mou from '../../src/mou.js'

const APP = 'localhost:8000/mfor.html'
let browser, page

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
    args: ['--no-sandbox']
  })
  page = await browser.newPage()
  await page.goto(APP)
})

afterAll(() => {
  browser.close()
})

describe('"m-for"指令测试', () => {

  test('子节点个数应该与colors列表长度相同', async () => {

    page.on('console', msg => console.log(msg))

    await page.exposeFunction("Mou", options => new Mou(options))
    await page.evaluate(() => {

      let colors = ['black', 'red']
      window.Mou({
	data: { colors }
      }).then((mou) => {
	console.log(mou)
      })
      // mou.mount(document.getElementById('app'))
    })
    
    /*
    await page.evaluate((x, y) => {

      let colors = ['black', 'red', 'white']
      console.log('mou', x, y)
      y()
      let mou = new Mou({
	data: {
	  colors
	}
      })

      let app = document.getElementById('app')
      mou.mount(app)

    }, 1, Mou)
    console.log('aaa', typeof Mou)
    */
  })
})

