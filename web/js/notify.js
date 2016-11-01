var Notify = function () {
    var _locationLat = null;
    var _locationLong = null;

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
                console.log("OneSignal User ID:", userId);
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

        if (localStorage.locationName) {
            showLocationName(localStorage.locationName);
        } else {
            showStep(1, false);
        }
    }
    
    function btnGetLocation() {
        try {
            navigator.geolocation.getCurrentPosition(function (loc) {
                localStorage.lat = _locationLat = loc.coords.latitude;
                localStorage.long = _locationLong = loc.coords.longitude;
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
        var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + _locationLat + ',' + _locationLong
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
        $(`#step${num}_false`).toggle(!show);
        $(`#step${num}_true`).toggle(show);
    }

    return {
        prepare: prepare
    }
}

var notify = Notify();
$(function () {
    notify.prepare();
})