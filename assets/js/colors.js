(function ($) {
    "use strict";

    var $modal = $("#color-modal");

    function openColorModal($swatch) {
        $("#color-modal-swatch").css("background-color", $swatch.data("colorHex"));
        $("#color-modal-name").text($swatch.data("colorName"));
        $("#color-modal-subtitle").text($swatch.data("colorSubtitle"));
        $("#color-modal-desc").text($swatch.data("colorDesc"));
        $modal.addClass("is-open").attr("aria-hidden", "false");
    }

    function closeColorModal() {
        $modal.removeClass("is-open").attr("aria-hidden", "true");
    }

    $(function () {
        $(".color-swatch").on("click", function () {
            openColorModal($(this));
        });

        $("#color-modal-close, #color-modal-overlay").on("click", closeColorModal);

        $(document).on("keydown", function (e) {
            if (e.key === "Escape" && $modal.hasClass("is-open")) {
                closeColorModal();
            }
        });
    });
})(jQuery);
