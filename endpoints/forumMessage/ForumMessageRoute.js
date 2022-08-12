var express = require('express');

var router = express.Router();

var logger = require('../../config/winston');
var messageService = require("../forumMessage/ForumMessageService");
var authenticationUtils = require("../utils/AuthenticationUtils");

// find messages
router.get('/', function(req, res, next){
    logger.debug("In Messages route.");
    messageService.findMessages(req.query, function(err, result){
        if(err){
            res.status(404).json({ "Error": err });
        } else {
            res.send(result);
        }
    })
})

// find message
router.get('/:_id', function(req, res, next){
    logger.debug("In Messages route.");
    const { _id } = req.params;
    messageService.findMessageByID(_id, function(err, message){
        if(err){
            res.status(404).json({ "Error": err });
        } else {
            res.send(message);
        }
    })
})

// create message
router.post('/', authenticationUtils.isAuthenticated, function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    
    messageService.createMessage(req.body, req.user.userID, function(err, message){
        if(err){
            res.status(400).json( {"Error": err} );
        } else {
            logger.debug("Eine neue Nachricht wurde erstellt.");
            res.status(201).send(message);
        }
    });
})

// update message
router.put('/:_id', authenticationUtils.isAuthenticated, authenticationUtils.tokenMessageAuth, function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    
    const { _id } = req.params;
    messageService.updateMessageByID(_id, req.body, function (err, message) {
        if(message){
            res.status(200).send(message);
        } else {
            res.status(500).json({ "Error": err });
        }
    });
})

// delete message
router.delete('/:_id', authenticationUtils.isAuthenticated, authenticationUtils.tokenMessageAuth, function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    
    const { _id } = req.params;
    messageService.removeMessage(_id, function(err, message){
        if(message){
            res.status(204).send(message);
        } else {
            res.status(404).send({ "Fehler": err });
        }
    });
})

module.exports = router;