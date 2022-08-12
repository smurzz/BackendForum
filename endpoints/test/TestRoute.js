const express = require('express')
const router = express.Router();

router.get('/', function (request, response) {
    response.send('Hallo! Das ist die Übung 1. von Sofya Murzakova.')
})

module.exports = router;