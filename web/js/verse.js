var Verse = function () {
    var settings = {

    }

    function prepare() {
        $('#btnRead').on('click', readAloud);
    }



    function readAloud() {
        var player = new TtsPlayer()
            .withTextHighlighting()
            .forceVoice('Microsoft Hazel Desktop');

        var talkify = new talkifyPlaylist()
            .begin()
            .usingPlayer(player)
            // .withTextInteraction()
            .withElements($('.verseText'))
            .build()
            .play();
    }

    return {
        prepare: prepare,
        settings: settings
    }
}

var verse = Verse();
$(function () {
    verse.prepare();
})