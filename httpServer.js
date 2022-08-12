// Exports
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const cors = require('cors');

const logger = require('./config/winston');
const database = require('./database/db');

const key = fs.readFileSync('./certificates/key.pem');
const cert = fs.readFileSync('./certificates/cert.pem');

const testRoutes = require('./endpoints/test/TestRoute');
const pUsersRoutes = require('./endpoints/user/PublicUsersRoute');
const usersRoutes = require('./endpoints/user/UserRoute');
const authenticationRoutes = require('./endpoints/authentication/AuthenticationRoute');
const forumThreadRoutes = require('./endpoints/forumThread/ForumThreadRoute');
const forumMessageRoutes = require('./endpoints/forumMessage/ForumMessageRoute');

const app = express();

const server = https.createServer({ key: key, cert: cert }, app);

app.use("*", cors())

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Expose-Headers', 'Authorization');
    next();
});

app.use(bodyParser.json());

// Adding the routes 
app.use('/', testRoutes);
app.use('/publicUsers', pUsersRoutes);
app.use('/users', usersRoutes);
app.use('/authenticate', authenticationRoutes);
app.use('/forumThreads', forumThreadRoutes);
app.use('/forumMessages', forumMessageRoutes);

database.initDB(function (err, db) {
    if (db) {
        logger.debug("Anbindung von Datenbank ist erfolgreich.");
    } else {
        logger.error("Anbindung von Datenbank ist gescheitert.");
    }
});

// Error Handler
app.use(function (req, res, next) {
    res.status(500).send({ "Fehler": 'Oops! Etwas ist schief gegangen..' });
});
app.use(function (req, res, next) {
    res.send(404).send({ "Fehler": 'Entschuldigung, wir konnten leider die Seite nicht finden.' });
});
// Listening
server.listen(443, () => { logger.debug("App listening at http://localhost:443") });

module.exports = server;

// const port = 8080;
// app.listen(port, function(){
//     logger.debug(`Message: App listening at http://localhost:${port}`);
// });