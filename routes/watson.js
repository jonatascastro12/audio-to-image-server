const watson = require('watson-developer-cloud');
const express = require('express');
const credentials = require('../credentials');
const router = express.Router();

// speech to text token endpoint
const sttAuthService = new watson.AuthorizationV1(
    {
        username: process.env.WATSON_USERNAME, // or hard-code credentials here
        password: process.env.WATSON_PASSWORD
    },
    // vcapServices.getCredentials('speech_to_text') // pulls credentials from environment in bluemix, otherwise returns {}
);
router.get('/api/speech-to-text/token', function (req, res) {
    sttAuthService.getToken(
        {
            url: watson.SpeechToTextV1.URL
        },
        function (err, token) {
            if (err) {
                console.log('Error retrieving token: ', err);
                res.status(500).send('Error retrieving token');
                return;
            }
            res.send({token: token});
        }
    );
});


module.exports = router;
