let pg = require('pg')
let json = require('../../config.json')
let database = require('./database')
let conn = new database.Database(json)

let con = pg.Pool(json)

function clearCards(){
    let sql = "DELETE FROM cards"
    con.query(sql)
}

function insertCards(cards){
    let sql = "INSERT INTO cards (nm_card, nm_attribute) VALUES ($1, $2)"
    cards.forEach(card => {
        con.query(sql, [card.name, card.attribute], (err, rows, fields) => {
            if(err){
                console.log(err)
            } else {
                console.log('deu certo')
            }
        })
    })       
}

function insertImageCards(cards){
    let sql = "UPDATE cards SET ds_url_card = $1 WHERE nm_card = $2"
    cards.forEach(card => {
        con.query(sql, [card.url_image, card.name], (err, rows, fields) => {
            if(err){
                console.log(err)
            } else {
                console.log('deu certo')
            }
        })
    })
}

async function getAllCards(){
    let cards = []
    await conn.query("SELECT nm_card FROM cards").then((rows) => {
        for(row of rows){
            cards.push({nm_card: row.nm_card})
        }
    })
    return cards
}

module.exports = {
    insertCards: insertCards,
    clearCards: clearCards,
    insertImageCards: insertImageCards,
    getAllCards: getAllCards
}