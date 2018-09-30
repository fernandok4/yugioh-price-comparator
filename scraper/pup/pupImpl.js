const pup = require('puppeteer')
const CARDS_DATABASE = "https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&keyword=&stype=1&ctype=&starfr=&starto=&pscalefr=&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&othercon=1&rp=100&page="

async function run() {
    const browser = await pup.launch()
    const page = await browser.newPage()
    await page.goto(CARDS_DATABASE)
    await getAllCards(page)
    await quit(browser)
}

async function quit(browser) {
    await browser.close()
}

async function getAllCards(page) {
    for (let i = 1; i < 200; i++) {
        try {
            await page.goto(CARDS_DATABASE + String(i))
            const cardNames = await page.evaluate(() => [...document.querySelectorAll('.box_card_name')].map(elem => elem.innerText))
            if (cardNames == null) {
                break;
            }
        } catch (e) {
            i--
        }
    }
}

run()