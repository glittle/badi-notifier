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
                // console.log(tags);
                if (tags && tags.when) {
                    console.log('got tags');
                    applyWhens(tags.when);
                }
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
        $('#addSun').click(addSunWhen);
        $('#addWhen').click(addTimeWhen);
        $('#whenList').on('click', '.removeWhen', removeWhen);

        if (settings.locationName) {
            showLocationInfo(settings.locationName);
        } else {
            showStep(1, false);
        }
    }

    function removeWhen(ev) {
        var btn = $(ev.target);
        var row = btn.closest('div');
        row.remove();

        saveAllWhens();
    }

    function addSunWhen() {
        var ddlType = $('#sunType');
        var ddlOffset = $('#sunOffset');
        var when = ddlType.val() + '@' + ddlOffset.val();
        var list = $('#whenList');

        // check for duplicates
        if (list.find(`div[data-when="${when}"]`).length) {
            return;
        }
        showWhen(when);
        saveAllWhens();
    }

    function addTimeWhen() {
        var input = $('#customWhen');
        var time = input.val();
        if (!time) {
            return;
        }

        var list = $('#whenList');

        // check for duplicates
        if (list.find(`div[data-when="${time}"]`).length) {
            return;
        }
        showWhen(time);
        saveAllWhens();
    }

    function showWhen(when) {
        var parts = when.split('@');
        var list = $('#whenList');
        var html;
        switch (parts.length) {
            case 1:
                html = `<div data-when="${when}"><span>${when} daily</span><button class="removeWhen">X</button></div>`
                break;

            case 2:
                var ddlType = $('#sunType');
                var ddlOffset = $('#sunOffset');

                var minutes = parts[1];
                var display = ddlOffset.find(`option[value="${minutes}"]`).text()
                    + ' '
                    + ddlType.find(`option[value="${parts[0]}"]`).text();

                html = `<div class="when_${parts[0]}" data-when="${when}"><span>${display}</span><button class="removeWhen">X</button></div>`

                break;
        }
        list.append(html);
        sortWhens();
    }
    function sortWhens() {
        var list = $('#whenList'),
            items = list.children('div');
        items.sort(function (a, b) {
            var an = a.getAttribute('data-when'),
                bn = b.getAttribute('data-when');

            if (an > bn) {
                return 1;
            }
            if (an < bn) {
                return -1;
            }
            return 0;
        });

        items.detach().appendTo(list);
    }

    function showTime() {
        $('.time').text('');

        if (!settings.locationLat || !settings.locationlng) {
            return;
        }

        callAjax('/getTime', {
            user: setttings.userId,
            lat: settings.locationLat,
            lng: settings.locationlng,
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

    function applyWhens(whens) {
        var list = whens.split(',');
        for (var i = 0; i < list.length; i++) {
            showWhen(list[i]);
        }
        sortWhens();
    }

    function saveAllWhens() {
        if (!settings.userId) {
            console.log('no userid... cannot test');
            return;
        }
        var whens = [];
        $('#whenList > div').each(function (i, el) {
            whens.push(el.getAttribute('data-when'));
        })

        var when = whens.join(',');

        // console.log(when);

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
                    var results = data.results;
                    var location = '';
                    // get longest locality
                    for (var r = 0; r < results.length; r++) {
                        var components = results[r].address_components;
                        for (var i = 0; i < components.length; i++) {
                            var component = components[i];
                            if ($.inArray('locality', component.types) != -1) { //$.inArray('political', component.types)!=-1 &&
                                if (component.short_name.length > location.length) {
                                    location = component.short_name;
                                    console.log(location);
                                }
                            }
                        }
                    }

                    OneSignal.sendTag("location", location);
                    OneSignal.sendTag("zoneName", moment.tz.guess());
                    showLocationInfo(location);
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