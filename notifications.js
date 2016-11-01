var appId = '2b535ce7-1ca1-4950-813f-2d89c9f281c2';
var https = require('https');

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

function setWhen(body) {
    console.log(body);
    if (!body.user) {
        return false;
    }
    // user:c3d2d533-1dab-4e68-ad7a-57e7a41a8403
    // what:whenSunset
    // on:false
    // when:
    var message = {
        app_id: appId,
        url: 'https://wondrous-badi.herokuapp.com/',
        include_player_ids: [body.user],
        headings: {},
        contents: {}
    };


    switch (body.what) {
        case 'whenSunset':
            break;
        case 'whenSunrise':
            break;
        case 'whenCustom':
            if (body.checked === 'true') {
                if (body.when) {
                    message.send_after = new Date();
                    message.delayed_option = 'timezone';
                    message.delivery_time_of_day = body.when + 'AM';
                    message.contents.en = 'Test at ' + body.when;
                    sendNotification(message);
                    return true;
                }
            }
            break;
        default:
    }
    return false;
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



module.exports = {
    sendTest: sendTest,
    setWhen: setWhen
}