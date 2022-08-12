const ForumThread = require("./ForumThreadModel");
var logger = require("../../config/winston");

var userService = require("../user/UserService");
var forumMessagesService = require("../forumMessage/ForumMessageService");

// find forums
function findForums(queryParameters, callback) {
    ForumThread.find(queryParameters, function (err, forums) {
        if (err) {
            logger.error("Fehler bei Forums-Suche: " + err);
            return callback(err, null);
        } else {
            logger.debug("Die Suche ist gut gelungen.");
            return callback(null, forums);
        }
    })
}

// find my forums
function findMyForums(myID, callback) {
    if (myID) {
        var query = ForumThread.find({ ownerID: myID });
        query.exec(function (err, forums) {
            if (err) {
                logger.error("Fehler bei Forums-Suche: " + err);
                return callback(err, null);
            } else {
                logger.debug("Die Suche ist gut gelungen.");
                return callback(null, forums);
            }
        })
    } else {
        logger.error("Kein owerID ist angegeben.");
        callback("Kein owerID ist angegeben.", null);
    }
}

// find messages from a forum by ID
function findForumMessages(forumID, callback) {
    if (forumID) {
        ForumThread.findOne( { _id: forumID }, function (err, forum) {
            if (forum) {
                forumMessagesService.findMessages({ forumThreadID: forumID }, function (err, messages) {
                    if (err) {
                        logger.error(`Keine Nachrichten mit Forum-ID < ${forumID} > sind gefunden.`);
                        callback(`Keine Nachrichten mit Forum-ID < ${forumID} > sind gefunden.`, null);
                    } else {
                        logger.debug("Nachrichten sind gefunden.");
                        callback(null, messages);
                    }
                })
            } else {
                logger.error(`Kein Forum mit Forum-ID < ${forumID} > ist gefunden.`);
                callback(`Kein Forum mit Forum-ID < ${forumID} > ist gefunden.`, null);
            }
        });
    } else {
        console.error("Keine Forum-ID ist angegeben.");
        callback("Keine Forum-ID ist angegeben.", null);
    }
}

// find forum by ID
function findForumByID(forumID, callback) {
    if (forumID) {
        ForumThread.findById({ _id: forumID }, function (err, forum) {
            if (forum) {
                logger.debug("Forum ist gefunden.");
                callback(null, forum);
            } else {
                logger.error(`Kein Forum mit Forum-ID < ${forumID} > ist gefunden.`);
                callback(`Kein Forum mit Forum-ID < ${forumID} > ist gefunden.`, null);
            }
        });
    } else {
        logger.error("Keine Forum-ID ist angegeben.");
        callback("Keine Forum-ID ist angegeben.", null);
    }
}

// create new forum
function createForum(params, userID, callback) {
    if (userID) {
        userService.findUserByID(userID, function (err, user) {
            if (err) {
                logger.error("Erstellen eines neuen Forum ist gescheitert: " + err);
                callback(err, null);
            } else {
                var newForum = new ForumThread(params);
                newForum.ownerID = userID;
                newForum.save(function (err) {
                    if (err) {
                        logger.error("Forum konnte nicht gespeichert werden: " + err);
                        callback("Forum konnte nicht gespeichert werden", null);
                    } else {
                        logger.debug("Forum wurde gespeichert.");
                        callback(null, newForum);
                    }
                });
            }
        });
    } else {
        logger.error("User ID ist nicht angegeben.");
        callback("User ID ist nicht angegeben.", null);
    }
}

// update forum
function updateForumByID(forumID, params, callback) {
    if (params && Object.keys(params).length !== 0) {
        ForumThread.findOneAndUpdate({ _id: forumID }, params, function (err, forum) {
            if (err) {
                logger.error("Die Änderungen konnten nicht vorgenommen werden.");
                callback("Die Änderungen konnten nicht vorgenommen werden.", null);
            } else {
                logger.debug("Die Änderungen wurden erforlgreich gespeichert.");
                callback(null, forum);
            }
        });
    } else {
        logger.error("Keine Änderungen sind angegeben.");
        callback("Keine Änderungen sind angegeben.", null);
    }
}

// delete forum
function removeForum(forumID, callback) {
    ForumThread.findByIdAndDelete({ _id: forumID }, function (err, forum) {
        if (forum) {
            logger.debug("Forum wurde gelöschet.");
            callback(null, forum);
        } else {
            logger.error(err);
            callback(err, null);
        }
    });
}

module.exports = {
    findForums,
    findMyForums,
    findForumByID,
    findForumMessages,
    createForum,
    updateForumByID,
    removeForum
}