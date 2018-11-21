let mysql = require('mysql')
let json = require('../../config.json')

let con = mysql.createConnection(json)

function clearCards(){
    let sql = "DELETE FROM cards"
    con.query(sql)
}

function insertCards(cards){
    let sql = "INSERT INTO cards (nm_card, nm_attribute) VALUES (?, ?)"
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
    let sql = "UPDATE cards SET ds_url_card = ? WHERE nm_card = ?"
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

module.exports = {
    insertCards: insertCards,
    clearCards: clearCards,
    insertImageCards: insertImageCards
}