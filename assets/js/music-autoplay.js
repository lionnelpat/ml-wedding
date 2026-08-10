(function () {
    "use strict";

    var iframe = document.getElementById('sc-player');
    if (!iframe || typeof SC === 'undefined') {
        return;
    }

    var widget = SC.Widget(iframe);
    var started = false;

    function tryPlay() {
        if (started) {
            return;
        }
        started = true;
        widget.play();
    }

    widget.bind(SC.Widget.Events.READY, function () {
        // Best-effort: works if the browser already allows autoplay for this origin.
        tryPlay();
    });

    // Reliable fallback: browsers allow starting audio right after a genuine
    // user gesture, so the first tap/click/key anywhere on the page unlocks it.
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(function (evt) {
        document.addEventListener(evt, tryPlay, { once: true, passive: true });
    });
})();
