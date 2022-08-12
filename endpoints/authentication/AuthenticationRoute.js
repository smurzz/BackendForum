var express = require('express');
var router = express.Router();
var logger = require('../../config/winston');
var authenticationService = require("./AuthenticationService");

const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.PASSWORD
    }
});

// Token erstellen und im Header zurückgeben
router.get('/', function (req, res, next) {

    logger.debug('Authentication Token erstellen.');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');

    if (req.headers.authorization && req.headers.authorization.indexOf('Basic') !== -1) {
        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [userID, password] = credentials.split(':');

        const user = { userID, password };
        authenticationService.createSessionToken(user, function (err, token, user) {
            if (token) {
                res.header("Authorization", "Bearer " + token);

                if (user) {
                    logger.debug("Token wurde erfolgreich erstellt.");
                    res.status(200).json({ "Erfolg": "Token wurde erfolgreich erstellt." });
                } else {
                    logger.debug("User ist Null, allerdings wurde Token erfolgreich erstellt. Fehler: " + err);
                    res.status(200).json({ "Erfolg": "User ist Null, allerdings wurde Token erfolgreich erstellt." });
                }

            } else {
                logger.error("Kein Token wurde erstellt. Fehler: " + err);
                res.status(401).json({ "Fehler": "Kein Token wurde erstellt." });
            }
        });
    } else {
        logger.error("Autorization Header fehlt.");
        res.status(401).json({ "Fehler": "Autorization Header fehlt." });
    }
});

// Create new user per email (registration)
router.post('/signup', function (req, res, next) {
    authenticationService.signup(req.body, function(err, token){
        if(token){
            var linkActivation = "https://localhost/authenticate/activateAccount/" + token;
            let mailOptions = {
                from: 'YourForum norepy@yourForum.com', 
                to: req.body.email, 
                subject: "Account Activation Link", 
                html: `<h5>Thank you for signing up! Please click on given link to activate your account:"</h5>     
                <p><a href=${linkActivation}> ${linkActivation} </a></p>`
            };

            transporter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    logger.error('error sending email', err);
                } else {
                    logger.debug('email sent successfully');
                    res.status(200).send({Success: 'email sent successfully'});
                }
            });
        } else {
            logger.error(err);
            res.status(401).json({ "Fehler": err });
        }
    });
})

// activate user-account
router.get('/activateAccount/:token', function(req, res, next){
    var token = req.params.token;
        logger.debug("In Users route.");
        authenticationService.activateAccount(token, function (err, user) {
            if (err) {
                res.status(400).json({ "Fehler": err });
            } else {
                logger.debug("User wurde gefunden: " + user);
                const { id, userID, userName, email, isAdministrator, ...partialObject } = user;
                const newUser =  { userID, userName, email, isAdministrator };               
                res.status(201).send({'Erfolg': 'Account wurde erforgreich aktiviert! Jetzt kannst du dich anmelden!'});
            }
        });
})

module.exports = router;