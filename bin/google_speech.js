const request = require('request');
const http = require('http');
const WebSocket = require('ws');
const speech = require('@google-cloud/speech');
const Ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const through2 = require('through2');

class GoogleSpeech {

    constructor() {
        this.port = 3001;
        this.ws = new WebSocket.Server({port: this.port});

        console.info('GoogleSpeech Server - listening', this.port);

        this.ws.on('connection', (ws) => {
            console.log('connected: ', 3001);
            this.ws = ws;
            ws.on('message', (message) => {
                // PARSE URL
                try {
                    console.log(message);
                    let obj = JSON.parse(message);
                    if (obj.url) {
                        this.streamingRecognize(obj.url);
                    }
                } catch (e) {
                    console.error(e);
                }
            });
        });
    }

    streamingRecognize(id) {
        // Creates a client
        const client = new speech.SpeechClient();

        const encoding = 'LINEAR16';
        const sampleRateHertz = 44100;
        const languageCode = 'pt-BR';

        const requestS = {
            config: {
                encoding: encoding,
                sampleRateHertz: sampleRateHertz,
                languageCode: languageCode,
            },
            interimResults: true, // If you want interim results, set this to true
        };

        // Stream the audio to the Google Cloud Speech API
        const recognizeStream = client
            .streamingRecognize(requestS)
            .on('error', error => {
                this.ws.send(JSON.stringify(error))
            })
            .on('data', data => {
                try {
                    // console.log(data.results[0].alternatives[0]);
                    this.ws.send(JSON.stringify(data));
                } catch (e) {

                }
            });

        const video = ytdl(id);
        const ffmpeg = new Ffmpeg(video);
        const stream = through2({objectMode: true});

        try {
            ffmpeg.format('wav').audioCodec('pcm_s16le').withAudioChannels(1).audioFrequency(sampleRateHertz).audioFilters('atempo=0.5')
                .pipe(stream);
        } catch (e) {
            console.error(e);
        }

        stream.pipe(recognizeStream);

        // return http.get(url, (resp) => {
        //     resp.on('data', async (chunk) => {
        //         await sleep(30);
        //         recognizeStream.write(chunk);
        //     })
        // });
        // [END speech_streaming_recognize]
    }
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

module.exports = new GoogleSpeech();