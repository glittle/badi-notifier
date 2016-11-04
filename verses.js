const moment = require('moment-timezone');
const fs = require('fs');

var maxAnswerLength = 99999;

var verses = {};

function getVerse() {
    if (!verses) {
        console.log('verses not loaded');
        return {verse: 'not loaded...'};
    }

    var hour;
    var timeOfDay;
    var key;
    var answers = [];

    var profile = {};//TEMP

    if (profile.tzInfo) {
        var zoneName = profile.tzInfo.zoneName;
        var nowTz = moment.tz(zoneName);
        key = nowTz.format('M.D');
        hour = nowTz.hour();
        timeOfDay = 'for this ' + (hour < 12 ? 'morning' : (hour < 18 ? 'afternoon' : 'evening'));
    } else {
        // don't know user's time
        var now = moment();
        hour = now.hour(); // server time
        key = now.format('M.D');
        timeOfDay = 'for today';
    }
    var isAm = hour < 12;
    var dayVerses = verses[key];
    if (dayVerses) {
        var verseInfo = dayVerses[isAm ? 'am' : 'pm'];
        if (verseInfo) {
            var v = {
                prefix: `A selection from "Reciting the Verses of God" ${timeOfDay}:`,
                suffix: `(Bahá'u'lláh, ${verseInfo.r})`,
                verse: verseInfo.q
            };
            return v;
        }
    }
    return {verse: '???'};
}

function loadVersesAsync(cb) {
    fs.readFile(__dirname + '/Badi/verses.json', 'utf8', (err, data) => {
        if (err) {
            console.log('Verses failed to load...');
            console.log(err);
        } else {
            console.log('\nverses loaded');
            verses = JSON.parse(data);
            if (cb) {
                cb();
            }
        }
    });
}



loadVersesAsync();


module.exports = {
    getVerse: getVerse,
    verse: 'hello'
}