const express = require('express');
const router = express.Router();
const language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();
const {Builder, By, until} = require('selenium-webdriver');
var Scraper = require('images-scraper')
    , nlp = new Scraper.Google();

router.post('/NLPImageFromText', (req, response) => {
    let text = req.body.text;
    console.log('GET analyzeEntities for: ', text);

    return client.analyzeEntities({
        document: {
            content: text,
            type: 'PLAIN_TEXT'
        }
    }).then(results => {
            if (results && results[0].entities && results[0].entities.length > 0) {
                let mapFn = e => {
                    return {name: e.name, salience: e.salience}
                };

                let three = results[0].entities.slice(0, 3);

                let nlp_result = {
                    all_entities: results[0].entities.map(mapFn),
                    three_main_entities: three.map(mapFn),
                    keyword: three.map(mapFn).map(e => e.name).join(' ')
                };


                nlp.list({
                    keyword: nlp_result.keyword,
                    num: 4,
                    detail: true,
                    nightmare: {
                        show: false
                    }
                }).then(function (res) {
                    if (res.length > 0) {
                        try {
                            if (res[0].hasOwnProperty('url')) nlp_result.image1 = res[0].url;
                            if (res[1].hasOwnProperty('url')) nlp_result.image2 = res[1].url;
                            if (res[2].hasOwnProperty('url')) nlp_result.image3 = res[2].url;
                            if (res[3].hasOwnProperty('url')) nlp_result.image4 = res[3].url;
                        } catch (e) {
                            console.log(e);
                        }
                        response.json(nlp_result);
                    }
                }).catch(function (err) {
                    console.log(err);
                });


            }
        }
    ).catch(err => {
        console.error('ERROR:', err);
    });


});





router.get('/google/NLPImageFromText', (req, response) => {


});

module.exports = router;
