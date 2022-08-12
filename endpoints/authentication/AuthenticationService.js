var jwt = require("jsonwebtoken");
const { JsonWebTokenError } = require('jsonwebtoken');
var config = require("config");
var User = require('../user/UserModel');
var userService = require("../user/UserService");
var logger = require('../../config/winston');

// create token 
function createSessionToken(user, callback){
    logger.debug("AuthenticationServive: Token erstellen.");

    if (!user) {
        logger.error("Kein User für Authentication Token ist angegeben.");
        callback("Kein User für Authentication Token ist angegeben.", null, null);
        return;
    } else {
        userService.authorize(user, function (err, user) {
            if (err) {
                logger.error("Authentication ist gescheitert.");
                callback("Authentication ist gescheitert.", null, null);
                return;
            } else {
                var issuedAt = new Date().getTime();
                var expirationTime = config.get('session.timeout');
                var expiresAt = issuedAt + (expirationTime * 1000);
                var privateKey = config.get('session.tokenKey');

                let token = jwt.sign(
                    { 
                        "userID": user.userID, 
                        "userName": user.userName, 
                        "isAdministrator": user.isAdministrator 
                    }, 
                    privateKey, 
                    { 
                        expiresIn: expiresAt, 
                        algorithm: 'HS256' 
                    });

                logger.debug("Token wurde erstellt: " + token);
                callback(null, token, user);
            }
        });
    }
};

// create a user by email (signup)
function signup(props, callback) {
    User.findOne( { $or:[{ userID: props.userID }, {email: props.email }] }, function (err, user) {
        if (user) {
            logger.debug(user);
            logger.error(`User mit email < ${props.email} > oder userID < ${props.userID} > existiert schon.`);
            callback(`User mit email < ${props.email} > oder userID < ${props.userID} > existiert schon.`, null);
         } else {
            var issuedAt = new Date().getTime();
            var expirationTime = config.get('session.timeout');
            var expiresAt = issuedAt + (expirationTime * 1000);
            var privateKey = config.get('session.tokenKey');

            let token = jwt.sign(
                {
                    "userID": props.userID,
                    "userName": props.userName,
                    "email": props.email,
                    "password": props.password,
                    "isAdministrator": props.isAdministrator
                },
                privateKey,
                {
                    expiresIn: expiresAt,
                    algorithm: 'HS256'
                });
            logger.debug(`Token für anzumeldenten User wurde erfolgreich erstellt.`);
            callback(null, token);
        }
    });
}

// activate user-account
function activateAccount(token, callback){
    logger.debug("Authentification: Anlegen neuen User aus Token: " + token);

    if (token == null) {
        logger.error("Authentication Token wurde nicht bereitgestellt.");
        return res.status(401).json({ "Fehler": "Authentication Token wurde nicht bereitgestellt." });
    } else {
        var privateKey = config.get('session.tokenKey');
        var payload;
        try {
            payload = jwt.verify(token, privateKey);

            userService.createUser(payload, function(err, user){
                if(user){
                    logger.debug(`User mit email ${user.email} wurde angelegt.`);
                    return callback(null, user);
                } else {
                    logger.error(err);
                    return callback(err, null);
                }
            });
        } catch (error) {
            if (error instanceof JsonWebTokenError) {
                logger.error(error);
                return res.status(401).json({ "Error": "JsonWebTokenError: " + error.message });
            }
            logger.error("Fehler bei der Verifizierung.");
            return res.status(400).json({ "Fehler": "Verifizierung von Token ist gescheitert." });
        }
    }
}
module.exports = {
    createSessionToken,
    signup,
    activateAccount
}
