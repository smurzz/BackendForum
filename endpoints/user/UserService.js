const User = require("./UserModel");
var logger = require('../../config/winston');

// create a new user
function createUser(newUser, callback) {
    logger.debug("UserService: Anlegen neues Users.");
    // validate entities (userID is required, also as userName and password should be 'string' and userName has to be entered as text)
    if (!newUser) {
        logger.error("Json body fehlt.");
        return callback("JSON-Body fehlt.", null);
    } else {
        if (!newUser.userID || typeof newUser.userID !== 'string') {
            return callback(`Eingabetyp von < userID > ist falsch oder ist nicht angegeben`, null);
        } else if (newUser.userName && typeof newUser.userName !== 'string' && !newUser.userName.match(/^[a-zA-ZäöüÄÖÜß ]{2,30}$/)) {
            return callback(`Eingabetyp von < userName > ist falsch oder enthält ungültige Zeichen`, null);
        } else if (newUser.password && typeof newUser.password !== 'string') {
            return callback(`Eingabetyp von < password > ist falsch`, null);
        } else if (newUser.isAdministrator && typeof newUser.isAdministrator !== 'boolean') {
            return callback(`Eingabetyp von < isAdministrator > ist falsch`, null);
        } else {
            // check if user is already exists
            User.findOne({ userID: newUser.userID }, function (err, user) {
                if (user) {
                    logger.error(`Fehler: User mit ID < ${newUser.userID} > existiert schon: ` + user);
                    return callback(`User mit ID < ${newUser.userID} > existiert schon`, null)
                } else if (err) {
                    logger.error(err);
                    return callback(err, null)
                } else {
                    var createdUser = new User(newUser);
                    createdUser.save(function (err) {
                        if (err) {
                            logger.error("Der Account konnte nicht angelegt werden: " + err);
                            callback("Das Konto konnte nicht angelegt werden", null);
                        } else {
                            callback(null, createdUser);
                        }
                    });
                }
            });
        }
    }
}

// find all users
function getUsers(queryParameters, callback) {
    User.find(queryParameters, function (err, users) {
        if (err) {
            logger.error("Fehler bei der Users-Suche: " + err);
            return callback(err, null);
        } else {
            if (users.length === 0) {
                logger.debug('Es gibt keinen Administrator. Er wird erstellt..');
                var adminUser = new User();
                adminUser.userID = "admin";
                adminUser.password = "123";
                adminUser.userName = "Default Administrator Account";
                adminUser.isAdministrator = true;

                adminUser.save(function (err) {
                    if (err) {
                        logger.error("Administrator wurde nicht erstellt: " + err);
                        callback("Administrator wurde nicht erstellt.", null);
                    } else {
                        logger.debug("Administrator wurde erstellt und gespeichert.");
                        callback(null, adminUser);
                    }
                });
            } else {
                logger.debug("Die Suche ist gut gelungen.");
                callback(null, users);
            }
        }
    })
}

// find a user by ID
function findUserByID(searchUserID, callback) {

    logger.debug("UserService: finden User by ID: " + searchUserID);

    if (!searchUserID) {
        callback({ "Fehler": "UserID fehlt." });
        return;
    } else {
        var query = User.findOne({ userID: searchUserID });
        query.exec(function (err, user) {
            if (user) {
                logger.debug("UserID ist gefunden: " + user);
                callback(null, user);
            } else {
                logger.error(`User mit ID ${searchUserID} ist nicht gefunden`);
                return callback(`User mit ID ${searchUserID} ist nicht gefunden`, null);
            }
        })
    }
}

// update user by ID
function updateUserByID(userID, upgrades, callback) {
    if (!userID) {
        logger.error("Keine User-ID angegeben");
        return callback("Keine User-ID angegeben", null);
    } else {
        // check for availability and validity of upgrades    
        if ((Object.keys(upgrades).length !== 0)) {

            for (var change in upgrades) {
                logger.debug("Prüfen von Verfügbarkeit und Gültigkeit der angegebenen Upgrades fing an.. ");

                var valiId = (change === 'userID' && typeof upgrades[change] === 'string');
                var validName = (change === 'userName' && typeof upgrades[change] === 'string' && upgrades[change].match(/^[a-zA-ZäöüÄÖÜß ]{2,30}$/));
                var validPassword = (change === 'password' && typeof upgrades[change] === 'string');
                var validIsAdministrator = (change === 'isAdministrator' && typeof upgrades[change] === 'boolean');

                if (!valiId && !validName && !validIsAdministrator && !validPassword) {
                    logger.error(`Entität < ${change} > hat die Validirung oder Gültigkeit fehlgeschlagen.`);
                    return callback(`Entität < ${change} > hat die Validirung oder Gültigkeit fehlgeschlagen.`, null);
                }
            }
        } else {
            logger.error("Keine Änderung wurde angegeben.");
            return callback("Keine Änderung wurde angegeben.", null);
        }
        // seach for user by ID
        findUserByID(userID, function (err, user) {
            if (err) {
                logger.error(err);
                return callback(err, null);
            } else {
                // assignment new values for available entities
                Object.keys(upgrades).forEach(change => {
                    if (change === 'userID') { user.userID = upgrades[change] }
                    if (change === 'userName') { user.userName = upgrades[change] }
                    if (change === 'password') { user.password = upgrades[change] }
                    if (change === 'isAdministrator') { user.isAdministrator = upgrades[change] }
                });
                // save all changes
                user.save(function (err, user) {
                    if (err) {
                        logger.error(err);
                        callback(err, null);
                    } else {
                        logger.debug("Die Veränderungen wurden erfolgreich gespeichert." + user);
                        callback(null, user);
                    }
                });
            }
        });
    }
}

// delete user by ID
function removeUserByID(delUserID, callback) {
    if (delUserID) {
        const query = User.findOneAndDelete({ userID: delUserID });
        query.exec(function (err, user) {
            if (user) {
                logger.debug("User wurde gelöscht.");
                callback(null, user);
            } else {
                logger.error(`User mit ID ${delUserID} ist nicht gefunden`);
                callback(`User mit ID ${delUserID} ist nicht gefunden`, null);
            }
        });
    } else {
        logger.error("User-ID wurde nicht angegeben.");
        callback("User-ID wurde nicht angegeben.", null);
    }
}

function authorize(props, callback) {
    const query = User.findOne({ userID: props.userID });
    query.exec(function (err, user) {
        if (user) {
            user.comparePassword(props.password, function (err, isMatch) {
                if (err) {
                    logger.error("Password oder User ID ist ungültig.");
                    callback(err, null);
                } else {
                    if (isMatch) {
                        logger.debug("Password ist korrekt!");
                        callback(null, user);
                    } else {
                        logger.error("Password ist falsch.");
                        callback("Autorisation ist gescheitert: Password ist falsch.", null);
                    }
                }
            });
        } else {
            logger.error(`User mit userID < ${props.userID} > ist nicht gefunden`);
            callback(`User mit userID < ${props.userID} > ist nicht gefunden`, null);
        }
    });
}

module.exports = {
    getUsers,
    findUserByID,
    createUser,
    updateUserByID,
    removeUserByID,
    authorize
}