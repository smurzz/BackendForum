let User = require('../../endpoints/user/UserModel');
let server = require('../../httpServer');

let chai = require("chai");
let expect = chai.expect;
let chaiHttp = require("chai-http");

chai.use(chaiHttp);
chai.should();

var sessionService = require('../../endpoints/authentication/AuthenticationService');

describe('ForumMessage Test', () => {

    /* 
    * Test the GET route
    */
    describe('GET /forumMessages', function () {

        it("It should GET all the forumMessages", function (done) {
            chai.request(server)
                .get("/forumMessages")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                    done();
                });
        })

        it("It should NOT GET all the forumMessages (500:Server Internal Error)", function (done) {
            chai.request(server)
                .get("/forumMessage")
                .end((err, response) => {
                    response.should.have.status(500);
                    done();
                });
        })
    })

    /*
    * Clear User-Database after
    */
    after('Remove all objects of User', function (done) {
        User.deleteMany({}, function (err, response) {
            done();
        })
    })
})