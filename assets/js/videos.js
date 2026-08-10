(function ($) {
    "use strict";

    var $modal = $("#video-modal");
    var $embed = $("#video-modal-embed");
    var $pending = $("#video-modal-pending");

    function openVideo(youtubeId) {
        if (youtubeId) {
            $embed.html('<iframe src="https://www.youtube.com/embed/' + youtubeId + '?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>');
            $embed.show();
            $pending.hide();
        } else {
            $embed.hide().empty();
            $pending.show();
        }
        $modal.addClass('is-open').attr('aria-hidden', 'false');
    }

    // Shared with other scripts (e.g. the auto-popup intro video on scroll).
    window.openVideoModal = openVideo;

    function closeVideo() {
        $modal.removeClass('is-open').attr('aria-hidden', 'true');
        $embed.empty(); // stop playback
    }

    $(function () {
        $(".video-card").on("click keydown", function (e) {
            if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") {
                return;
            }
            if (e.type === "keydown") {
                e.preventDefault();
            }
            openVideo($(this).data('youtube-id'));
        });

        $("#video-modal-close, #video-modal-overlay").on("click", closeVideo);

        $(document).on("keydown", function (e) {
            if (e.key === "Escape" && $modal.hasClass('is-open')) {
                closeVideo();
            }
        });
    });
})(jQuery);
