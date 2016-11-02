var appId = '2b535ce7-1ca1-4950-813f-2d89c9f281c2';
var https = require('https');
var request = require('request');
var parse = require('csv-parse');
var zlib = require('zlib');
const badiCalc = require('./Badi/badiCalc');
const sunCalc = require('./Badi/sunCalc');

var _rawUserList = [];
var _users = {}; //keyed by id

function sendTest(user, msg) {

    var message = {
        app_id: appId,
        contents: {
            "en": msg || 'Test message!'
        },
        url: 'https://wondrous-badi.herokuapp.com/notify',
        include_player_ids: [user]
    };
    sendNotification(message);
}

function getTime(body) {
    var lat = +body.lat;
    var lng = +body.lng;
    var zone = body.zoneName;

    var profile = {
        coord: {
            lat: lat,
            lng: lng
        },
        tzInfo: {
            zoneName: zone
        }
    }
    var answers = [];

    badiCalc.addSunTimes(profile, answers);

    return answers;
}
function setWhen(body) {
    // console.log(body);
    if (!body.user) {
        return false;
    }

    var user = _users[body.user];
    if (!user) {
        user = _users[body.user] = {
            id: body.user,
            tags: {
                when: body.when
            }
        }
    } else {
        user.tags.when = body.when;
    }

    setupScheduleForUser(user);

    return {
        saved: true,
        when: body.when
    }
    // user:c3d2d533-1dab-4e68-ad7a-57e7a41a8403
    // what:whenSunset
    // on:false
    // when:
    // var message = {
    //     app_id: appId,
    //     url: 'https://wondrous-badi.herokuapp.com/',
    //     include_player_ids: [body.user],
    //     headings: {},
    //     contents: {}
    // };


    // switch (body.what) {
    //     case 'whenSunset':
    //         break;
    //     case 'whenSunrise':
    //         break;
    //     case 'whenCustom':
    //         if (body.checked === 'true') {
    //             if (body.when) {
    //                 message.send_after = new Date();
    //                 message.delayed_option = 'timezone';
    //                 message.delivery_time_of_day = body.when;
    //                 message.contents.en = 'Test at ' + body.when;
    //                 sendNotification(message);
    //                 return true;
    //             }
    //         }
    //         break;
    //     default:
    // }
    // return false;
}

function setupScheduleForUser(user) {
    console.log('setup for...');
    console.log(user);
}

function sendNotification(data) {
    var headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic NjBiYWE4ZWMtMjIzMi00ODk0LTk4YzItMWNmOGMzYWU3NTM0"
    };

    var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
    };

    var req = https.request(options, function (res) {
        res.on('data', function (data) {
            console.log("Response:");
            var result = JSON.parse(data.toString());
            console.log(result);
        });
    });

    req.on('error', function (e) {
        console.log("ERROR:");
        console.log(e);
    });

    console.log('sending:');
    console.log(data);

    req.write(JSON.stringify(data));
    req.end();
};

function addKnownUsers() {
    var headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic NjBiYWE4ZWMtMjIzMi00ODk0LTk4YzItMWNmOGMzYWU3NTM0"
    };

    var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/players/csv_export",
        method: "POST",
        headers: headers
    };

    var message = {
        app_id: appId
        //extra_fields: ['location']
    };

    var req = https.request(options, function (res) {
        res.on('data', function (data) {
            var result = JSON.parse(data);
            var fileUrl = result.csv_file_url;
            if (fileUrl) {
                // never ready instantly... give some time for the file to be prepared
                setTimeout(function () {
                    loadRemoteCsvFile(fileUrl);
                }, 1000);
            } else {
                console.log('Getting info re CSV file:');
                console.log(data);
            }
        });
    }).on('error', function (e) {
        console.log("ERROR:");
        console.log(e);
    });

    console.log('Getting CSV of current users');
    req.write(JSON.stringify(message));
    req.end();
}

var _remoteCsvLoadAttempts = 0;

function loadRemoteCsvFile(url) {
    _remoteCsvLoadAttempts++;
    console.log(`Loading remote CSV, attempt ${_remoteCsvLoadAttempts}...`);

    request({
        method: 'GET',
        uri: url,
        encoding: null,
        gzip: true
    }, function (error, response, body) {
        if (response.statusCode == 403) {
            if (_remoteCsvLoadAttempts < 60) {
                setTimeout(function () {
                    loadRemoteCsvFile(url);
                }, 1000);
            } else {
                console.log(`Gave up getting CSV after ${_remoteCsvLoadAttempts} attempts.`);
            }
            return;
        }
        if (!error && response.statusCode == 200) {
            zlib.gunzip(body, function (error2, body2) {
                if (error2) {
                    console.log(error2);
                } else {
                    _remoteCsvLoadAttempts = 0;
                    processCsv(body2);
                }
            });
        } else {
            console.log(response.statusCode);
            console.log(error);
        }
    })
}

function processCsv(csvFile) {
    console.log('Processing CSV...')
    parse(csvFile, { columns: true }, function (err, users) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(users.length + ' users defined');
        _rawUserList = users;
        setupSchedulesForAllUsers();
    });
}

function setupSchedulesForAllUsers() {
    var withTags = 0;
    for (var i = 0, m = _rawUserList.length; i < m; i++) {
        var user = _rawUserList[i];
        if (user.tags) {
            _users[user.id] = {
                id: user.id,
                tags: convertTags(user.tags),
                language: user.language
            };
            withTags++;
        }
    }
    console.log(withTags + ' users with tags');
    for (var id in _users) {
        if (_users.hasOwnProperty(id)) {
            var user = _users[id];
            setupScheduleForUser(_users[id]);
        }
    }
}

function convertTags(rawTagString) {
    return JSON.parse(`{${rawTagString.replace(/=>/g, ':')}}`);
}

function getWhenFor(id){
    var user = _users[id];
    if(user){
        var when = user.tags.when;
        return when;
    }
    return null;
}


addKnownUsers()

module.exports = {
    sendTest: sendTest,
    setWhen: setWhen,
    getTime: getTime,
    getWhenFor: getWhenFor
}