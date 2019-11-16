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
    // let listCards = await getAllCards(page)
    console.log("teste")
    let cards = await dao.getAllCards()
    getPrices(browser, cards)
    console.log("teste2")
    setInterval(verifyEnd, 20000)
}

function verifyEnd(browser){
    if(maxQtdPages == qtdWebSites){
        quit(browser)
    }
}

async function getPrices(browser, listCards){
    getSoloPrices(browser)
    getDuelShopPrices(browser)
    getImageCards(listCards, browser)
}

async function quit(browser) {
    await browser.close()
}

async function getImageCards(listCards, browser){
    const page = await browser.newPage()
    for(let i = 0; i < listCards.length; i++){
        try{
            console.log(CARDS_IMAGES + String(listCards[i].nm_card))
            await page.goto(CARDS_IMAGES + String(listCards[i].nm_card))
            await sleep(5000)
            const cardImageUrl = await page.evaluate(() => document.querySelectorAll('#card-list > div > figure > a > img')[0].src)
            listCards[i].url_image = cardImageUrl
            let path = process.env.SYSTEM_IMAGE_PATH
            download(cardImageUrl, `${path}/${listCards[i].nm_card}.jpg`, function(){
                console.log('done');
            });
        } catch (e){
            console.log(e)
        }
    }
    dao.insertImageCards(listCards)
    qtdWebSites++
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getAllCards(page) {
    let listCards = []
    // dao.clearCards()
    for (let i = 1; i < 200; i++) {
        listCards = []
        try {
            await page.goto(CARDS_DATABASE + String(i))
            console.log(i)
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
            dao.insertCards(listCards)
        } catch (e) {
            i--
        }
    }
    return listCards
}

async function getSoloPrices(browser){
    try {
        const page = await browser.newPage()
        console.log('uHUlll')    
        qtdWebSites++
    } catch (e){
        console.log("alguma cosia deu errada")
    }
}

async function getDuelShopPrices(browser){
    try {
        const page = await browser.newPage()
        console.log('uHUlll')    
        qtdWebSites++
    } catch (e){
        console.log("alguma cosia deu errada")
    }
}

var fs = require('fs'), request = require('request');

function download(uri, filename, callback){
    request.head(uri, function(err, res, body){
        if(err){
            console.log(err)
        }
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

run()