const pup = require('puppeteer')
const dao = require('../dao/pupDAO')
const soloPup = require('./pupSoloImpl')
const duelPup = require('./pupDuelImpl')
const CARDS_DATABASE = "https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&keyword=&stype=1&ctype=&starfr=&starto=&pscalefr=&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&othercon=1&rp=100&page="
var qtdWebSites = 0;

async function run() {
    const browser = await pup.launch()
    const page = await browser.newPage()
    await page.goto(CARDS_DATABASE)
    // await getAllCards(page)
    getPrices(browser)
}

function getPrices(browser){
    getSoloPrices(browser)
    getDuelShopPrices(browser)
}

async function quit(browser) {
    await browser.close()
}

async function getAllCards(page) {
    let listCards = []
    dao.clearCards()
    for (let i = 1; i < 200; i++) {
        try {
            await page.goto(CARDS_DATABASE + String(i))
            const cardNames = await page.evaluate(() => [...document.querySelectorAll('.box_card_name')].map(elem => elem.innerText))
            const cardAttributes = await page.evaluate(() => [...document.querySelectorAll('.box_card_attribute span')].map(elem => elem.innerText))
            if (cardNames == null) {
                break;
            }
            for(let i = 0; i < cardNames.length; i++){
                let obj = {
                    name: cardNames[i],
                    attribute: cardAttributes[i]
                }
                listCards.push(obj)
            }
        } catch (e) {
            i--
        }
    }
    dao.insertCards(listCards)
}

async function getSoloPrices(browser){
    try {
        const page = await browser.newPage()
        console.log('uHUlll')    
        qtdWebSites++
        if(qtdWebSites == 2){
            await quit(browser)
        }
    } catch (e){
        console.log("alguma cosia deu errada")
    }
}

async function getDuelShopPrices(browser){
    try {
        const page = await browser.newPage()
        console.log('uHUlll')    
        qtdWebSites++
        if(qtdWebSites == 2){
            await quit(browser)
        }
    } catch (e){
        console.log("alguma cosia deu errada")
    }
}

run()