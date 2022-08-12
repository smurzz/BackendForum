var mongoose = require('mongoose');
const config = require('config');
var logger = require('../config/winston');

let _db;

const connectionString = config.get('db.connectionString');

function initDB(callback) {
    if(_db){
        if(callback){
            return callback(null, _db);
        } else {
            return _db;
        }
    } else {
        mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }); /* , useCreateIndex: true */
        _db = mongoose.connection;

        _db.on('error', console.error.bind(console, 'connection error:'));
        _db.once('open', function(){
            logger.debug("Connected to database " + connectionString + " in DB.js: " + _db);
            callback(null, _db);
        });
    }
}

module.exports = {
    initDB
}