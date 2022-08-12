var express = require('express');

var router = express.Router();
var jsonParser = express.json();

var logger = require('../../config/winston');
var userService = require("./UserService");
var authenticationUtils = require("../utils/AuthenticationUtils");


// Find users
router.get('/', authenticationUtils.isAuthenticated, function (req, res, next) {
   
    if (req.user && req.user.isAdministrator === true) {
        logger.debug("In Users route.");
        userService.getUsers(req.query, function (err, result) {
            if (err) {
                res.status(404).json({ "Fehler": err });
            } else {
                const users = result.map(user => {
                    const { id, userID, userName, isAdministrator, ...partialObject } = user;
                    return { userID, userName, isAdministrator };
                });
                logger.debug("Result: " + users);
                res.send(users);
            }
        });
    } else {
        logger.error("Verboten für nicht autorisierte Users.");
        res.status(401).json( {"Fehler" : "User ist nicht autorisiert!"} );
    }
});

// Find user by id
router.get('/:userID', authenticationUtils.isAuthenticated, function (req, res, next) {
    
    if (req.user && req.user.isAdministrator === true) {
        var searedUserID = req.params.userID;
        logger.debug("In Users route.");
        userService.findUserByID(searedUserID, function (err, user) {
            if (err) {
                res.status(404).json({ "Fehler": err });
            } else {
                logger.debug("User wurde gefunden: " + user);
                const { id, userID, userName, isAdministrator, ...partialObject } = user;
                const newUser =  { userID, userName, isAdministrator };               
                res.status(200).send(newUser);
            }
        });
    } else {
        logger.error("Verboten für nicht autorisierte Users.");
        res.status(401).json( {"Fehler" : "User ist nicht autorisiert!"} );
    }
})

// Create new user
router.post('/', authenticationUtils.isAuthenticated, function (req, res, next) {
   
    if (req.user && req.user.isAdministrator === true) {
        logger.debug("In Users route.");
        userService.createUser(req.body, function (err, user) {
            if (err) {
                res.status(400).json({ "Fehler": err });
            } else {
                logger.debug("User wurde erfolgreich angelegt und gespeichert!");
                const { id, userID, userName, isAdministrator, ...partialObject } = user;
                const newUser =  { userID, userName, isAdministrator };               
                res.status(201).send(newUser);
            }
        });
    } else {
        logger.error("Verboten für nicht autorisierte Users.");
        res.status(401).json( {"Fehler" : "User ist nicht autorisiert!"} );
    }
})

// Update user 
router.put('/:userID', authenticationUtils.isAuthenticated, jsonParser, function (req, res, next) {
   
    if (req.user && req.user.isAdministrator === true) {
        logger.debug("In Users route.");
        userService.updateUserByID(req.params.userID, req.body, function (err, user) {
            if (err) {
                res.status(400).json({ "Fehler": err });
            } else {
                logger.debug("Die Änderungen wurden erfolgreich durchgeführt.");
                const { id, userID, userName, isAdministrator, ...partialObject } = user;
                const newUser =  { userID, userName, isAdministrator };               
                res.status(200).send(newUser);
            }
        });
    } else {
        logger.error("Verboten für nicht autorisierte Users.");
        res.status(401).json( {"Fehler" : "User ist nicht autorisiert!"} );
    }
})

// Delete user
router.delete('/:userID', authenticationUtils.isAuthenticated, function (req, res, next) {
     
    if (req.user && req.user.isAdministrator === true) {
        logger.debug("In Users route.");
        const { userID } = req.params;
        userService.removeUserByID(userID, function (err, user) {
            if (user) {
                const { id, userID, userName, isAdministrator, ...partialObject } = user;
                const newUser =  { userID, userName, isAdministrator };               
                res.status(204).send(newUser);
            } else {
                res.status(404).send({ "Fehler": err });
            }
        });
    } else {
        logger.error("Verboten für nicht autorisierte Users.");
        res.status(401).json( {"Fehler" : "User für die Operation ist nicht autorisiert!"} );
    }
})

module.exports = router;