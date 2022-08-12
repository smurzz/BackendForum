var chai  = require('chai');
let expect = chai.expect;

let chaiHttp = require("chai-http");
let server = require('../../httpServer');
chai.use(chaiHttp);

chai.should();

describe('Application Test', function(){
    it('It should run the app', function(done) {
        server.on( function(){
            done();
        } )
    });
})