var Notify = function () {
    var settings = {
        locationLat: localStorage.lat,
        locationlng: localStorage.lng,
        locationName: localStorage.locationName,
        userId: null,
        tags: null
    };

    function prepare() {
        OneSignal.push(function () {
            OneSignal.getTags(function (tags) {
                settings.tags = tags;
                console.log('got tags');
                console.log(tags);
                applyWhen(tags);
            });
            OneSignal.getUserId(function (userId, a, b) {
                settings.userId = userId;
                showStep(2, userId != null);
                console.log(userId); // leave in console, for help desk support
            });
        });

        OneSignal.push(function () {
            /* These examples are all valid */
            var isPushSupported = OneSignal.isPushNotificationsSupported();
            if (isPushSupported) {
                $('.supported').show();
            } else {
                $('.notSupported').show();
            }
        });



        $('#btnGetLocation, #btnGetLocation2').click(btnGetLocation);
        $('#btnEnableNotification').click(btnEnableNotification);
        $('.testNow').click(btnTestNow);
        $('.when').on('change', 'input[type=checkbox]', setWhen)
        $('.when').on('change', 'input[type=time]', function (ev) {
            var cb = $(ev.target).closest('div').find('input[type=checkbox]');
            if (cb.prop('checked')) {
                cb.trigger('change');
            }
        })

        if (settings.locationName) {
            showLocationInfo(settings.locationName);
        } else {
            showStep(1, false);
        }
    }

    function showTime() {
        $('.time').text('');

        if (!settings.locationLat || !settings.locationlng) {
            return;
        }

        callAjax('/getTime', {
            lat: settings.locationLat,
            lng: settings.locationlng,
            //tz: new Date().getTimezoneOffset()
            zoneName: moment.tz.guess()
        }, function (times) {
            var html = [];
            for (var i = 0; i < times.length; i++) {
                var time = times[i];
                html.push(`<div><strong>${time.t}</strong> <span>${time.v}</span></div>`);
            }
            $('.time').html(html.join(''));
        })
    }

    function applyWhen(tags) {
        var when = tags.when;
        $('input#sunset').prop('checked', when.search('sunset') !== -1);
        $('input#sunrise').prop('checked', when.search('sunrise') !== -1);
        $('input#custom').prop('checked', when.search(':') !== -1);
        var parts = when.split(',');
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part.search(':') !== -1) {
                $('input#customWhen').val(part);
                //only one for now
                break;
            }
        }
    }


    function setWhen(ev) {
        if (!settings.userId) {
            console.log('no userid... cannot test');
            return;
        }
        $('.whenResult').hide();
        // var when = $('#when').serialize();
        var parts = [];
        if ($('input#sunset').prop('checked')) {
            parts.push('sunset');
        }
        if ($('input#sunrise').prop('checked')) {
            parts.push('sunrise');
        }

        if ($('input#custom').prop('checked')) {
            var time = $('input#customWhen').val();
            if (time) {
                parts.push(time);
            }
        }
        var when = parts.join(',');
        callAjax('/setWhen', {
            user: settings.userId,
            when: when
        },
            function (info) {
                if (info.saved) {
                    // save it locally... if okay, send as Tag for permanent storage
                    console.log('send when: ' + info.when);
                    OneSignal.sendTag("when", info.when);
                }
                $('.whenResult_true').toggle(info.saved);
                $('.whenResult_false').toggle(!info.saved);
            });

    }

    function btnTestNow(ev) {
        if (!settings.userId) {
            console.log('no userid... cannot test');
            return;
        }
        var btn = $(ev.target);
        callAjax('/test', { user: settings.userId }, function (info) {
            console.log(info);
        });
    }

    function callAjax(url, data, cbSuccess, cbFailure) {
        $.ajax({
            url: url,
            dataType: 'json',
            method: 'post',
            data: data,
            cache: false,
            success: function (data, status, xhr) {
                cbSuccess(data);
            },
            error: function (xhr, status, error) {
                if (xhr.responseText) {
                    var info = JSON.parse(xhr.responseText);
                    console.log(info.error.message);
                    console.log(info.error.stack);
                }
            }
        });
    }

    function btnGetLocation() {
        try {
            navigator.geolocation.getCurrentPosition(function (loc) {
                localStorage.lat = settings.locationLat = loc.coords.latitude;
                localStorage.lng = settings.locationlng = loc.coords.longitude;
                OneSignal.sendTag("latitude", settings.locationLat);
                OneSignal.sendTag("longitude", settings.locationlng);
                getLocationName();
            })
        } catch (e) {
            console.log(e);
        }
    }

    function showLocationInfo(name) {
        localStorage.locationName = settings.locationName = name;
        $('.locationEcho').text(name);
        showStep(1, true);
        console.log('showed location name');
        showTime();
    }

    function getLocationName() {
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + settings.locationLat + ',' + settings.locationlng
        $.ajax({
            url: url,
            dataType: 'json',
            cache: true,
            success: function (data) {
                if (data.status === 'OK') {
                    var components = data.results[0].address_components;
                    for (var i = 0; i < components.length; i++) {
                        var component = components[i];
                        //console.log(component);
                        if ($.inArray('political', component.types) != -1) { //$.inArray('political', component.types)!=-1 && 
                            var location = component.short_name;
                            OneSignal.sendTag("location", location);
                            OneSignal.sendTag("zoneName", moment.tz.guess());
                            showLocationInfo(location);

                            break;
                        }
                    }
                }
            }
        });
    }

    function btnEnableNotification() {
        OneSignal.push(function () {
            OneSignal.registerForPushNotifications();
        });

    }

    function showStep(num, show) {
        $(`.step${num}_`).hide();
        $(`.step${num}_false`).toggle(!show);
        $(`.step${num}_true`).toggle(show);
        if (num !== 3) {
            showStep(3, settings.userId != null && settings.locationName != undefined);
        }
    }

    return {
        prepare: prepare,
        settings: settings
    }
}

var notify = Notify();
$(function () {
    notify.prepare();
})