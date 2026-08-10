(function () {
    "use strict";

    var coupleSection = document.getElementById('couple');
    if (!coupleSection) {
        return;
    }

    var INTRO_VIDEO_ID = '-yt7ejmpWJI';
    var triggered = false;
    var ticking = false;

    function checkPosition() {
        ticking = false;
        if (triggered) {
            return;
        }
        // Fires once the section has fully scrolled past (above the viewport),
        // not when the user simply hasn't reached it yet.
        if (coupleSection.getBoundingClientRect().bottom < 0) {
            triggered = true;
            if (typeof window.openVideoModal === 'function') {
                window.openVideoModal(INTRO_VIDEO_ID);
            }
            window.removeEventListener('scroll', onScroll);
        }
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(checkPosition);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Covers the case where the page loads already scrolled past the section
    // (e.g. deep link, browser scroll restoration).
    checkPosition();
})();
