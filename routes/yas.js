#!/usr/bin/env node
const path = require('path');
const express = require('express');
const youtube = require('../bin/youtube');
var router = express.Router();


router.get('/', (req, res) => {
    const file = path.resolve(__dirname, 'index.html');
    res.sendFile(file)
});

router.get('/:videoId', (req, res) => {
    const videoId = req.params.videoId;

    try {
        youtube.stream(videoId, null, 'mp3').pipe(res)
    } catch (e) {
        console.error(e);
        res.sendStatus(500, e)
    }
});

router.get('/flac/:videoId', (req, res) => {
    const videoId = req.params.videoId;

    try {
        youtube.stream(videoId, null, 'flac').pipe(res)
    } catch (e) {
        console.error(e);
        res.sendStatus(500, e)
    }
});

router.get('/search/:query/:page?', (req, res) => {
    const {query, page} = req.params;
    youtube.search({query, page}, (err, data) => {
        if (err) {
            console.log(err);
            res.sendStatus(500, err);
            return
        }

        res.json(data)
    })
})

router.get('/get/:id', (req, res) => {
    const id = req.params.id;

    youtube.get(id, (err, data) => {
        if (err) {
            console.log(err);
            res.sendStatus(500, err)
            return
        }

        res.json(data)
    })
})

router.use((req, res) => {
    res.sendStatus(404)
});

module.exports = router;