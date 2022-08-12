process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let server = require('../httpServer');
const db = require('../database/db')

describe.skip('Execute Application Tests', function () {
    require('./simpleTests/applicationTest')
})
/* describe.skip('Login Tests', function () {
    require('./mocaTests/loginTest')
})
*/
describe('User Service Tests', function () {
    require('./simpleTests/user')
})
describe('ForumThread Service Tests', function () {
    require('./simpleTests/forumThread')
}) 
describe('ForumMessage Service Tests', function () {
    require('./simpleTests/forumMessage')
}) 
after(() => {
    console.log("Shut down application");
}) 
