var Notify = function () {
    var settings = {
        locationLat: null,
        locationLong: null,
        userId: null
    };

    function prepare() {
        // OneSignal.isPushNotificationsEnabled(function (isEnabled) {
        //     // showStep(2, isEnabled);
        //     // if (isEnabled)
        //     //     console.log("Push notifications are enabled!");
        //     // else
        //     //     console.log("Push notifications are not enabled yet.");
        // });

        OneSignal.push(function () {
            /* These examples are all valid */
            OneSignal.getUserId(function (userId) {
                showStep(2, userId != null);
                settings.userId = userId;
                // (Output) OneSignal User ID: 270a35cd-4dda-4b3f-b04e-41d7463a2316    
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



        $('#btnGetLocation').click(btnGetLocation);
        $('#btnEnableNotification').click(btnEnableNotification);
        $('.testNow').click(btnTestNow);
        $('.when').on('change', 'input[type=checkbox]', setWhen)

        if (localStorage.locationName) {
            showLocationName(localStorage.locationName);
        } else {
            showStep(1, false);
        }
    }

    function setWhen(ev) {
        if (!settings.userId) {
            console.log('no userid... cannot test');
            return;
        }
        var input = $(ev.target);
        var li = input.closest('li');
        var what = li.attr('id');
        callAjax('/setWhen', {
            user: settings.userId,
            what: what,
            checked: input.prop('checked'),
            when: what === 'whenCustom' ? li.find('input[type=time]').val() : null
        },
            function (info) {
                console.log(info);
            });

    }

    function btnTestNow(ev) {
        if (!settings.userId) {
            console.log('no userid... cannot test');
            return;
        }
        var btn = $(ev.target);
        var what = btn.closest('li').attr('id');
        callAjax('/test', { user: settings.userId, what: what }, function (info) {
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
                localStorage.long = settings.locationLong = loc.coords.longitude;
                getLocationName();
            })
        } catch (e) {
            console.log(e);
        }
    }

    function showLocationName(name) {
        localStorage.locationName = name;
        $('.locationEcho').text(name);
        showStep(1, true);
    }

    function getLocationName() {
        var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + settings.locationLat + ',' + settings.locationLong
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
                            showLocationName(component.short_name);
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
        $(`#step${num}_`).hide();
        $(`#step${num}_false`).toggle(!show);
        $(`#step${num}_true`).toggle(show);
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