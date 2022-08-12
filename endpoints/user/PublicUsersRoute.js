const express = require('express');

const router = express.Router();
var jsonParser = express.json();

var logger = require('../../config/winston');
var userService = require("./UserService");

// Find all users
router.get('/', function(req, res, next){
    logger.debug("In Users route.");
    userService.getUsers(req.query, function(err, result){
        logger.debug("Result: " + result);
        if (err) {
            res.status(404).json({ "Error": err });
        } else {
            res.status(200).send(result);
        }
    })
})

// Find user by id
router.get('/:userID', function(req, res, next){
    var searedUserID = req.params.userID;
    logger.debug("In Users route");
    userService.findUserByID(searedUserID, function(err, user){
        if (err) {
            res.status(404).json({ "Fehler": err });
        } else {
            logger.debug("User wurde gefunden: " + user);
            res.status(200).send(user);
        }
    })
})

// Create new user
router.post('/', function(req, res, next){
    userService.createUser(req.body, function(err, user){
        if (err) {
            res.status(400).json({ "Fehler": err });
        } else {
            logger.debug("User wurde erfolgreich angelegt und gespeichert!");
            res.status(201).send(user);
        }
    })
})

// Update user 
router.put('/:userID', jsonParser, function(req, res, next){
    userService.updateUserByID(req.params.userID, req.body, function(err, user){
        if (err) {
            res.status(400).json({ "Fehler": err });
        } else {
            logger.debug("Die Änderungen wurden erfolgreich durchgeführt.")
            res.status(200).send(user);
        } 
    })
})

// Delete user
router.delete('/:userID', function(req, res, next){
    const { userID } = req.params;
    userService.removeUserByID(userID, function(err, user){
        if(user){
            logger.debug("User wurde gelöscht.")
            res.status(204).send(user);
        } else if(err){
            res.status(500).send( {"Fehler": err} );
        } else {
            res.status(404).send( {"Fehler": "User wurde nicht gefunden."} );
        }
    })
})

module.exports = router;