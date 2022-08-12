var express = require('express');

var router = express.Router();

var logger = require('../../config/winston');
var forumService = require("../forumThread/ForumThreadService");
var authenticationUtils = require("../utils/AuthenticationUtils");

// find all forums
router.get('/', function(req, res, next){
    logger.debug("In Forums route.");
    forumService.findForums(req.query, function(err, result){
        if(err){
            res.status(404).json({ "Fehler": err });
        } else {
            res.send(result);
        }
    })
})

// find my forums
router.get('/myForumThreads', authenticationUtils.isAuthenticated, function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    
    forumService.findMyForums(req.user.userID, function (err, result) {
        logger.debug("In Forums route.");
        if (err) {
            res.status(404).json({ "Fehler": err });
        } else {
            res.send(result);
        }
    });
})

// find forum by ID
router.get('/:_id', function(req, res, next){
    const { _id } = req.params;
    forumService.findForumByID(_id, function(err, forum){
        if(err){
            res.status(404).json({ "Fehler": err });
        } else {
            res.status(200).send(forum);
        }
    });
})

// find messages from forum by ID
router.get('/:_id/forumMessages', function (req, res, next) {
    const { _id } = req.params;
    forumService.findForumMessages(_id, function (err, result) {
        if (err) {
            res.status(404).json({ "Fehler": err });
        } else {
            res.status(200).send(result);
        }
    });
})

// create new forum
router.post('/', authenticationUtils.isAuthenticated, function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    
    forumService.createForum(req.body, req.user.userID, function(err, forum){
        if(err){
            res.status(400).json( {"Fehler": err} );
        } else {
            logger.debug("Ein neues Forum wurde erstellt.");
            res.status(201).send(forum);
        }
    });
})

// update forum
router.put('/:_id', authenticationUtils.isAuthenticated, authenticationUtils.tokenForumAuth, function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    
    const { _id } = req.params;
    forumService.updateForumByID(_id, req.body, function (err, forum) {
        if(forum){
            res.status(200).send(forum);
        } else {
            res.status(400).json({ "Fehler": err });
        }
    });
})

// delete forum
router.delete('/:_id', authenticationUtils.isAuthenticated, authenticationUtils.tokenForumAuth, function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    
    const { _id } = req.params;
    forumService.removeForum(_id, function(err, forum){
        if(forum){
            res.status(204).send(forum);
        } else {
            res.status(404).send({ "Fehler": err });
        }
    });
})


module.exports = router;