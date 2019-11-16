const pg = require( 'pg' );
let json = require('../../config.json')

class Database {
    constructor( config ) {
        this.connection = pg.Pool(json);
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, results ) => {
                if ( err )
                    return reject( err );
                resolve( results.rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}

module.exports = {
    Database
}