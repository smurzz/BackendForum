let User = require('../../endpoints/user/UserModel');
let server = require('../../httpServer');

let chai = require("chai");
let expect = chai.expect;
let chaiHttp = require("chai-http");

chai.use(chaiHttp);
chai.should();

var sessionService = require('../../endpoints/authentication/AuthenticationService');
const { ObjectId } = require('mongodb');

describe('ForumThread Test', () => {
    var idObject = ObjectId("507f191e810c19729de860ea");
    var idValue = "507f191e810c19729de860ea";

    /* 
    * Test the GET route
    */
    describe('GET /forumThreads', function () {

        it("It should GET all the ForumThreads", function (done) {
            chai.request(server)
                .get("/forumThreads")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                    done();
                });
        })

        it("It should NOT GET all the forumThreads (500:Server Internal Error)", function (done) {
            chai.request(server)
                .get("/forumThread")
                .end((err, response) => {
                    response.should.have.status(500);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq('Oops! Etwas ist schief gegangen..')
                    done();
                });
        })
    })

    /*
    * Test the POST route
    */
    describe('POST /forumThreads', function () {
        var admin = new User({ "userID": "admin", "password": "123", "isAdministator": true });
        var tokenAdmin;
       
        before(function (done) {
            sessionService.createSessionToken(admin, function (err, token, user) {
                expect(token).should.to.be.not.null;
                tokenAdmin = token;
                expect(user).should.to.be.not.null;
                if (user) {
                    user.userID.should.to.equal('admin');
                }
                done();
            });
        })

        it("It should POST new forumThread", function (done) {
            const newForum = {
                _id: idObject,
                name: "Mein erstes Forum",
                description: "Das ist ein erstes Forum, das ich im Rahmen der Tests angelegt habe."

            };
            chai.request(server)
                .post("/forumThreads")
                .set({ Authorization: `Bearer ${tokenAdmin}` })
                .send(newForum)
                .end((err, response) => {
                    response.should.have.status(201);
                    response.body.should.be.a('object');
                    response.body.should.have.property('name').eq("Mein erstes Forum");
                    response.body.should.have.property('description').eq("Das ist ein erstes Forum, das ich im Rahmen der Tests angelegt habe.");
                    done();
                });
        })

        it("It should NOT POST new forumThread (401:Unauthorized)", function (done) {
            const newForum = {
                name: "Mein erstes Forum",
                description: "Das ist ein erstes Forum, das ich im Rahmen der Tests angelegt habe."

            };
            chai.request(server)
                .post("/forumThreads")
                .send(newForum)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq("Authentication Token wurde nicht bereitgestellt.");
                    done();
                });
        })
    })

    /*
    * Test the GET (by id) route
    */
    describe('GET /forumThreads:_id', function () {

        it("It should GET forumThread by _id", function (done) {
            
            chai.request(server)
                .get("/forumThreads/" + idValue)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('name');
                    response.body.should.have.property('description');
                    response.body.should.have.property('_id').eq(idValue);
                    done();
                });
        })

        it("It should NOT GET forumThread by _id (404:Not Found)", function (done) {
            const forumID = "noid";
            chai.request(server)
                .get("/forumThreads/" + forumID)
                .end((err, response) => {
                    response.should.have.status(404);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq("Kein Forum mit Forum-ID < " + forumID + " > ist gefunden.");
                    done();
                });
        })
    })

    /*
    * Test the GET (myForumThreads) route
    */
    describe('GET /forumThreads/myForumThreads', function () {

        var admin = new User({ "userID": "admin", "password": "123", "isAdministator": true });
        var tokenAdmin;
       
        before(function (done) {
            sessionService.createSessionToken(admin, function (err, token, user) {
                expect(token).should.to.be.not.null;
                tokenAdmin = token;
                expect(user).should.to.be.not.null;
                if (user) {
                    user.userID.should.to.equal('admin');
                }
                done();
            });
        })

        it("It should GET my forumThread", function (done) {
            
            chai.request(server)
                .get("/forumThreads/myForumThreads")
                .set({ Authorization: `Bearer ${tokenAdmin}` })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                    done();
                });
        })

        it("It should NOT GET forumThread by _id (401:Unauthorized)", function (done) {
            chai.request(server)
                .get("/forumThreads/myForumThreads")
                .end((err, response) => {
                    response.should.have.status(401);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq("Authentication Token wurde nicht bereitgestellt.");
                    done();
                });
        })
    })

    /*
    * Test the GET (forumMessages) route
    */
    describe('GET /forumThreads/forumMessages', function () {

        it("It should GET messages by forumThreadID", function (done) {
            
            chai.request(server)
                .get("/forumThreads/" + idValue + "/forumMessages")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                    done();
                });
        })

        it("It should NOT GET messages by _id (404:Not Found)", function (done) {
            const forumID = "noid";
            chai.request(server)
                .get("/forumThreads/" + forumID + "/forumMessages")
                .end((err, response) => {
                    response.should.have.status(404);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq(`Kein Forum mit Forum-ID < ${forumID} > ist gefunden.`);
                    done();
                });
        })
    })

    /*
    * Test the PUT route
    */
    describe('PUT /forumThreads/:_id', function(){
        var admin = new User ({"userID": "admin", "password": "123", "isAdministator": true});
        var tokenAdmin;

        before(function(done) {
            sessionService.createSessionToken(admin, function(err, token, user){
                expect(token).should.to.be.not.null;
                tokenAdmin = token;
                expect(user).should.to.be.not.null;
                if(user){
                    user.userID.should.to.equal('admin');
                }
                done();
            });
        })

        it("It should PUT changes for existed forumThread", function(done){
            const changes = {
                description: "Das ist ein erstes Forum, das ich im Rahmen der Tests angelegt habe. (BEARBEITET)"
            };
            chai.request(server)
            .put("/forumThreads/" + idValue)
            .set({Authorization: `Bearer ${tokenAdmin}`})
            .send(changes)
            .end((err, response) => {
                response.should.have.status(200);
                response.body.should.be.a('object');
                response.body.should.have.property('_id').eq(idValue);
                response.body.should.have.property('description').eq("Das ist ein erstes Forum, das ich im Rahmen der Tests angelegt habe.");
                done();
            });
        })

        it("It should PUT changes for existed forumThread (401:Unauthorized)", function(done){
            const changes = {
                description: "Das ist ein erstes Forum, das ich im Rahmen der Tests angelegt habe. (BEARBEITET)"
            };
            chai.request(server)
            .put("/forumThreads/" + idValue)
            .send(changes)
            .end((err, response) => {
                response.should.have.status(401);
                response.body.should.be.a('object');
                response.body.should.have.property('Fehler').eq("Authentication Token wurde nicht bereitgestellt.");
                done();
            });
        })

        it("It should PUT changes for forumThread (400:Bad Request)", function(done){
            const changes = {};
            chai.request(server)
            .put("/forumThreads/" + idValue)
            .set({Authorization: `Bearer ${tokenAdmin}`})
            .send(changes)
            .end((err, response) => {
                response.should.have.status(400);
                response.body.should.be.a('object');
                response.body.should.have.property('Fehler').eq("Keine Änderungen sind angegeben.");
                done();  
            });
        })

        it("It should PUT changes for NOT existed forumThread (404:Not Found)", function(done){
            const forumID = "noid";
            const changes = {
                description: "Das ist ein erstes Forum, das ich im Rahmen der Tests angelegt habe. (BEARBEITET)"
            };
            chai.request(server)
            .put("/forumThreads/" + forumID)
            .set({Authorization: `Bearer ${tokenAdmin}`})
            .send(changes)
            .end((err, response) => {
                response.should.have.status(404);
                response.body.should.be.a('object');
                response.body.should.have.property('Fehler').eq("Kein Forum mit Forum-ID < " + forumID + " > ist gefunden.");
                done();  
            });
        })
    })

     /*
    * Test the DELETE route
    */
     describe('DELETE /forumThreads/:_id', function(){
        var admin = new User ({"userID": "admin", "password": "123", "isAdministator": true});
        var tokenAdmin;

        before(function(done) {
            sessionService.createSessionToken(admin, function(err, token, user){
                expect(token).should.to.be.not.null;
                tokenAdmin = token;
                expect(user).should.to.be.not.null;
                if(user){
                    user.userID.should.to.equal('admin');
                }
                done();
            });
        })

        it("It should DELETE forumThread", function(done){
            chai.request(server)
            .delete("/forumThreads/" + idValue)
            .set({Authorization: `Bearer ${tokenAdmin}`})
            .end((err, response) => {
                response.should.have.status(204);
                done();
            });
        })

        it("It should DELETE forumThread (401:Unauthorized)", function(done){
            chai.request(server)
            .delete("/forumThreads/" + idValue)
            .end((err, response) => {
                response.should.have.status(401);
                response.body.should.be.a('object');
                response.body.should.have.property('Fehler').eq("Authentication Token wurde nicht bereitgestellt.");
                done();
            });
        })

        it("It should DELETE NOT existed user (404:Not Found)", function(done){
            chai.request(server)
            .delete("/forumThreads/" + idValue)
            .set({Authorization: `Bearer ${tokenAdmin}`})
            .end((err, response) => {
                response.should.have.status(404);
                response.body.should.be.a('object');
                response.body.should.have.property('Fehler').eq("Kein Forum mit Forum-ID < " + idValue + " > ist gefunden.");
                done();  
            });
        })
    })
}); 