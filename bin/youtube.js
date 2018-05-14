const fs = require('fs');
const ytdl = require('ytdl-core');
const YtNode = require('youtube-node');
const through2 = require('through2');
const Ffmpeg = require('fluent-ffmpeg');
const credentials = require('../credentials');

const apiKey = process.env.GOOGLE_API_KEY;
const ytNode = new YtNode();
ytNode.setKey(apiKey);

class YouTube {
    constructor () {
        this.pageSize = 10
    }

    stream (id, res, format='mp3') {
        const video = ytdl(id);
        const ffmpeg = new Ffmpeg(video);
        const stream = through2();

        try {
            ffmpeg
                .format(format).withAudioChannels(1).audioFrequency(16000)
                .pipe(stream);

            return stream
        } catch (e) {
            throw e
        }
    }

    download ({id, file = './youtube-audio.mp3'}, callback) {
        const url = `//youtube.com/watch?v=${id}`
        const fileWriter = fs.createWriteStream(file)

        try {
            ytdl(url).pipe(fileWriter)
        } catch (e) {
            throw e
        }

        fileWriter.on('finish', () => {
            fileWriter.end()

            if (typeof callback === 'function') {
                callback(null, {id, file})
            }
        })

        fileWriter.on('error', (error) => {
            fileWriter.end()

            if (typeof callback === 'function') {
                callback(error, null)
            }
        })
    }

    search ({query, page}, callback) {
        if (page) {
            ytNode.addParam('pageToken', page)
        }

        ytNode.search(query, this.pageSize, callback)
    }

    get (id, callback) {
        ytNode.getById(id, callback)
    }
}

module.exports = new YouTube();