let puppeteer = require('puppeteer')
const APP = 'localhost:8000/index.html'

let browser, page

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
    args: ['--no-sandbox']
  })
  page = await browser.newPage()
})
afterAll(() => {
  browser.close()
})

test('Init', async () => {
  await page.goto(APP)
})
