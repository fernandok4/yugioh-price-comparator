const pup = require('puppeteer')
const dao = require('../dao/pupDAO')
const soloPup = require('./pupSoloImpl')
const duelPup = require('./pupDuelImpl')
const CARDS_DATABASE = "https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&keyword=&stype=1&ctype=&starfr=&starto=&pscalefr=&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&othercon=1&rp=100&page="
const CARDS_IMAGES = "https://db.ygoprodeck.com/search/?card="
var qtdWebSites = 0
var maxQtdPages = 3

async function run() {
    const browser = await pup.launch()
    const page = await browser.newPage()
    await page.goto(CARDS_DATABASE)
    let listCards = await getAllCards(page)
    getPrices(browser, listCards)
}

function getPrices(browser, listCards){
    getSoloPrices(browser)
    getDuelShopPrices(browser)
    getImageCards(listCards, browser)
}

async function quit(browser) {
    await browser.close()
}

async function getImageCards(listCards, browser){
    for(let i = 0; i < listCards.length; i++){
        try{
            const page = await browser.newPage()
            await page.goto(CARDS_IMAGES + String(listCards[i].name))
            setTimeout(async () => {
                const cardImageUrl = await page.evaluate(() => document.querySelectorAll('#card-list > div > figure > a > div > img.lazy')[0].src)
                listCards[i].url_image = cardImageUrl
                download(cardImageUrl.replace('/', '').replace(' ', '-'), `../images/${listCards[i].name}.jpg`, function(){
                    console.log('done');
                });
            }, 3000)
        } catch (e){
            i--
        }
    }
    dao.insertImageCards(listCards)
    qtdWebSites++
    if(qtdWebSites == maxQtdPages){
        await quit(browser)
    }
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
                    attribute: cardAttributes[i],
                }
                listCards.push(obj)
            }
        } catch (e) {
            i--
        }
    }
    dao.insertCards(listCards)
    return listCards
}

async function getSoloPrices(browser){
    try {
        const page = await browser.newPage()
        console.log('uHUlll')    
        qtdWebSites++
        if(qtdWebSites == maxQtdPages){
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
        if(qtdWebSites == maxQtdPages){
            await quit(browser)
        }
    } catch (e){
        console.log("alguma cosia deu errada")
    }
}

var fs = require('fs'), request = require('request');

function download(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

run()