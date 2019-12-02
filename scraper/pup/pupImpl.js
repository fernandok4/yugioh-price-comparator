const pup = require('puppeteer')
const dao = require('../dao/pupDAO')
const soloPup = require('./pupSoloImpl')
const duelPup = require('./pupDuelImpl')
const CARDS_DATABASE = "https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&keyword=&stype=1&ctype=&starfr=&starto=&pscalefr=&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&othercon=1&rp=100&page="
const CARDS_IMAGES = "https://db.ygoprodeck.com/card/?search="
const SOLO_PRICES = "https://www.solosagrado.com.br/busca?pg=15&categoria=&view=&qtdview=0&pagina=1&ord=1&pesq="
const DUEL_SHOP_PRICES = "https://www.duelshop.com.br/procurar?controller=search&orderby=position&orderway=desc&search_query="
var qtdWebSites = 0
var maxQtdPages = 3

async function run() {
    const browser = await pup.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreHTTPSErrors: true})
    const page = await browser.newPage()
    console.log("lendo as cartas da página. ", process.env.READ_CARDS)
    if(process.env.READ_CARDS == '1'){
        let listCards = await getAllCards(page)
    }
    console.log("pegando as cartas do banco.")
    let cards = await dao.getAllCards()
    console.log("lendo os preços e pegando a imagem das cartas.")
    getPrices(browser, cards)
    setInterval(verifyEnd, 20000)
}

function verifyEnd(browser){
    if(maxQtdPages == qtdWebSites){
        quit(browser)
    }
}

async function getPrices(browser, listCards){
    if(process.env.READ_PRICES == '1'){
        getSoloPrices(browser, listCards)
        getDuelShopPrices(browser, listCards)
    } else {
        qtdWebSites += 2
    }
    if(process.env.READ_IMAGE_CARDS == '1'){
        getImageCards(listCards, browser)
    } else {
        qtdWebSites++
    }
}

async function quit(browser) {
    await browser.close()
}

async function getImageCards(listCards, browser){
    const page = await browser.newPage()
    for(let i = 0; i < listCards.length; i++){
        try{
            console.log(CARDS_IMAGES + String(listCards[i].nm_card))
            await page.goto(CARDS_IMAGES + String(listCards[i].nm_card).replace(/ /g, "%20"))
            await sleep(5000)
            const cardImageUrl = await page.evaluate(() => document.querySelectorAll('body > div.w3-row-padding.w3-padding-64.w3-container > div.w3-content-card > div.w3-third.w3-center > div > span > a > img')[0].src)
            listCards[i].url_image = cardImageUrl
            let path = process.env.SYSTEM_IMAGE_PATH
            let imageName = `${listCards[i].id_card}.jpg`
            download(cardImageUrl, `${path}/${imageName}`, function(){
                console.log('done');
            });
        } catch (e){
            console.log("Erro na leitura das imagens " + listCards[i].id_card)
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
    dao.clearCards()
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

async function getSoloPrices(browser, listCards){
    const page = await browser.newPage()
    for(let i = 0; i < listCards.length; i++){
        try {
            let url = SOLO_PRICES + listCards[i].nm_card.replace(/ /g, "%20")
            await page.goto(url)
            console.log(url)
            const price = await page.evaluate(() => document.querySelector('#ambiente_compra > div.wide_layout.relative > div.page_content_offset > div > div > section > section > div:nth-child(1) > figure > figcaption > div > p.scheme_color.f_size_large > span.bold').innerText)
            const formated_price = price.match(/\d+,\d\d/g)[0].replace(',', '.')
            dao.insertPriceCard(listCards[i].id_card, 1, formated_price, url)
        } catch (e){
            console.log("alguma coisa deu errada na leitura dos preços da solosagrado")
        }
    }
    qtdWebSites++
}

async function getDuelShopPrices(browser, listCards){
    const page = await browser.newPage()
    for(let i = 0; i < listCards.length; i++){
        try {
            let url = DUEL_SHOP_PRICES + listCards[i].nm_card.replace(/ /g, "%20") + "&submit_search="
            console.log(url)
            await page.goto(url)
            const price = await page.evaluate(() => document.querySelector('#center_column > ul > li:nth-child(1) > div > div.right-block > div.content_price > span').innerText)
            const formated_price = price.match(/\d+,\d\d/g)[0].replace(',', '.')
            dao.insertPriceCard(listCards[i].id_card, 2, formated_price, url)
        } catch (e){
            console.log("alguma coisa deu errada na leitura dos preços da duelshop")
        }
    }
    qtdWebSites++
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