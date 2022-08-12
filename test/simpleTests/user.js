let User = require('../../endpoints/user/UserModel');
let server = require('../../httpServer');

let chai = require("chai");
let expect = chai.expect;
let chaiHttp = require("chai-http");

chai.use(chaiHttp);
chai.should();

var sessionService = require('../../endpoints/authentication/AuthenticationService');

describe('User Test', () => {

    /* 
    * Test the GET route (publicUsers)
    */
    describe('GET /publicUsers', function () {
        it("It should create user < admin > ", function(done){
            chai.request(server)
            .get("/publicUsers")
            .end((err, response) => {
                response.should.have.status(200);
                response.body.should.be.a('object');
                response.body.should.have.property('isAdministrator').eq(true);
                response.body.should.have.property('userName').eq("Default Administrator Account");
                response.body.should.have.property('userID').eq("admin");
                done();
            });
        })
    })

    /* 
    * Test the GET route
    */
    describe('GET /users', function () {

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

        it("It should GET all the users", function (done) {
            chai.request(server)
                .get("/users")
                .set({ Authorization: `Bearer ${tokenAdmin}` })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                    done();
                });
        })

        it("It should NOT GET all the users (401:Unauthorized)", function (done) {
            chai.request(server)
                .get("/users")
                .end((err, response) => {
                    response.should.have.status(401);
                    done();
                });
        })

        it("It should NOT GET all the users (500:Server Internal Error)", function (done) {
            chai.request(server)
                .get("/user")
                .set({ Authorization: `Bearer ${tokenAdmin}` })
                .end((err, response) => {
                    response.should.have.status(500);
                    done();
                });
        })
    })

    /*
    * Test the GET (by id) route
    */
    describe('GET /user/:userID', function () {
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

        it("It should GET user by userID", function (done) {
            const userID = "admin";
            chai.request(server)
                .get("/users/" + userID)
                .set({ Authorization: `Bearer ${tokenAdmin}` })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('userID');
                    response.body.should.have.property('userName');
                    response.body.should.have.property('userID').eq(userID);
                    done();
                });
        })

        it("It should NOT GET user by userID (401:Unauthorized)", function (done) {
            const userID = "admin";
            chai.request(server)
                .get("/users/" + userID)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq("Authentication Token wurde nicht bereitgestellt.");
                    done();
                });
        })

        it("It should NOT GET user by userID (404:Not Found)", function (done) {
            const userID = "noname";
            chai.request(server)
                .get("/users/" + userID)
                .set({ Authorization: `Bearer ${tokenAdmin}` })
                .end((err, response) => {
                    response.should.have.status(404);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq("User mit ID " + userID + " ist nicht gefunden");
                    done();
                });
        })
    })

    /*
    * Test the POST route
    */
    describe('POST /user', function () {
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

        it("It should POST new user", function (done) {
            const newUser = {
                userID: "manfred",
                userName: "Manfred Mustermann",
                password: "asdf"
            };
            chai.request(server)
                .post("/users")
                .set({ Authorization: `Bearer ${tokenAdmin}` })
                .send(newUser)
                .end((err, response) => {
                    response.should.have.status(201);
                    response.body.should.be.a('object');
                    response.body.should.have.property('userID').eq("manfred");
                    response.body.should.have.property('userName').eq("Manfred Mustermann");
                    response.body.should.have.property('isAdministrator').eq(false);
                    done();
                });
        })

        it("It should NOT POST user (401:Unauthorized)", function (done) {
            const newUser = {
                userID: "manfred",
                userName: "Manfred Mustermann",
                password: "asdf"
            };
            chai.request(server)
                .post("/users")
                .send(newUser)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq("Authentication Token wurde nicht bereitgestellt.");
                    done();
                });
        })

        it("It should POST new user, that already exists (400:Bad Request)", function (done) {
            const newUser = {
                userID: "admin",
                userName: "Default Administrator Account",
                password: "123",
                isAdministator: true
            };
            chai.request(server)
                .post("/users")
                .set({ Authorization: `Bearer ${tokenAdmin}` })
                .send(newUser)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq("User mit ID < " + newUser.userID + " > existiert schon");
                    done();
                });
        })
    })

    /*
    * Test the PUT route
    */
    describe('PUT /user/:userID', function () {
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

        it("It should PUT changes for existed user", function (done) {
            const userID = "manfred";
            const changes = {
                userName: "Manfred Müller",
            };
            chai.request(server)
                .put("/users/" + userID)
                .set({ Authorization: `Bearer ${tokenAdmin}` })
                .send(changes)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('userID').eq("manfred");
                    response.body.should.have.property('userName').eq("Manfred Müller");
                    response.body.should.have.property('isAdministrator').eq(false);
                    done();
                });
        })

        it("It should PUT changes for existed user (401:Unauthorized)", function (done) {
            const userID = "manfred";
            const changes = {
                userName: "Manfred Müller",
            };
            chai.request(server)
                .put("/users/" + userID)
                .send(changes)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq("Authentication Token wurde nicht bereitgestellt.");
                    done();
                });
        })

        it("It should PUT changes for NOT existed user (400:Bad Request)", function (done) {
            const userID = "manfred2";
            const changes = {
                userName: "Manfred Müller",
            };
            chai.request(server)
                .put("/users/" + userID)
                .set({ Authorization: `Bearer ${tokenAdmin}` })
                .send(changes)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq("User mit ID " + userID + " ist nicht gefunden");
                    done();
                });
        })
    })

   /*
   * Test the DELETE route
   */
    describe('DELETE /user/:userID', function () {
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

        it("It should DELETE user", function (done) {
            const userID = "manfred";
            chai.request(server)
                .delete("/users/" + userID)
                .set({ Authorization: `Bearer ${tokenAdmin}` })
                .end((err, response) => {
                    response.should.have.status(204);
                    done();
                });
        })

        it("It should DELETE user (401:Unauthorized)", function (done) {
            const userID = "manfred";
            chai.request(server)
                .delete("/users/" + userID)
                .end((err, response) => {
                    response.should.have.status(401);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq("Authentication Token wurde nicht bereitgestellt.");
                    done();
                });
        })

        it("It should DELETE NOT existed user (404:Not Found)", function (done) {
            const userID = "manfred2";
            chai.request(server)
                .delete("/users/" + userID)
                .set({ Authorization: `Bearer ${tokenAdmin}` })
                .end((err, response) => {
                    response.should.have.status(404);
                    response.body.should.be.a('object');
                    response.body.should.have.property('Fehler').eq("User mit ID " + userID + " ist nicht gefunden");
                    done();
                });
        })
    })
}); 