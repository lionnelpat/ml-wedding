(function ($) {
    "use strict";

    var $marquee = $("#guestbook-marquee");
    var $track = $("#guestbook-track");
    var $empty = $("#guestbook-empty");
    var $modal = $("#guestbook-modal");

    var SPEED_PX_PER_SEC = 55; // constant scroll speed regardless of item count
    var MIN_ITEMS_PER_COPY = 6; // repeat short lists so the marquee never looks empty

    function formatDate(iso) {
        try {
            var d = new Date(iso);
            return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
            return '';
        }
    }

    function buildCard(entry) {
        var $item = $('<div class="guestbook-item"></div>');
        $item.attr('data-name', entry.name);
        $item.attr('data-message', entry.message);
        $item.attr('data-date', entry.date);

        var $quote = $('<span class="guestbook-quote">&ldquo;</span>');
        var $msg = $('<p class="guestbook-message"></p>').text(entry.message);
        var $name = $('<h5 class="guestbook-name"></h5>').text(entry.name);
        var $date = $('<span class="guestbook-date"></span>').text(formatDate(entry.date));

        $item.append($quote, $msg, $name, $date);
        return $item;
    }

    function renderMarquee(messages) {
        $track.css('animation', 'none').empty();

        if (!messages || messages.length === 0) {
            $track.append($empty);
            return;
        }

        var repeat = Math.max(1, Math.ceil(MIN_ITEMS_PER_COPY / messages.length));

        for (var r = 0; r < repeat; r++) {
            messages.forEach(function (entry) {
                $track.append(buildCard(entry));
            });
        }

        // Measure the width of a single copy, then duplicate it once more
        // so translateX(-50%) loops seamlessly.
        var singleWidth = $track[0].scrollWidth;
        var $clones = $track.children().clone(true);
        $track.append($clones);

        var duration = Math.max(10, singleWidth / SPEED_PX_PER_SEC);
        requestAnimationFrame(function () {
            $track.css('animation', 'guestbook-scroll ' + duration + 's linear infinite');
        });
    }

    function loadMessages() {
        $.ajax({
            type: "GET",
            url: "guestbook.php",
            dataType: "json",
            success: function (res) {
                if (res && res.success) {
                    renderMarquee(res.messages);
                }
            }
        });
    }

    function openModal(name, message, date) {
        $("#guestbook-modal-name").text(name);
        $("#guestbook-modal-message").text(message);
        $("#guestbook-modal-date").text(formatDate(date));
        $modal.addClass('is-open').attr('aria-hidden', 'false');
    }

    function closeModal() {
        $modal.removeClass('is-open').attr('aria-hidden', 'true');
    }

    $(function () {
        if (!$track.length) {
            return;
        }

        loadMessages();

        // Event delegation: cards are rebuilt on every reload.
        $track.on("click", ".guestbook-item", function () {
            var $this = $(this);
            openModal($this.data('name'), $this.data('message'), $this.data('date'));
        });

        $("#guestbook-modal-close, #guestbook-modal-overlay").on("click", closeModal);

        $(document).on("keydown", function (e) {
            if (e.key === "Escape" && $modal.hasClass('is-open')) {
                closeModal();
            }
        });

        $("#guestbook-form").on("submit", function (e) {
            e.preventDefault();

            var $form = $(this);
            var name = $.trim($("#gb-name").val());
            var message = $.trim($("#gb-message").val());

            $("#gb-success").hide();
            $("#gb-error").hide();

            if (!name || !message) {
                $("#gb-error").text("Merci de remplir votre nom et votre message.").slideDown("fast");
                return;
            }

            $("#gb-loader").css("display", "inline-block");
            $("#gb-submit").prop("disabled", true);

            $.ajax({
                type: "POST",
                url: "guestbook.php",
                data: $form.serialize(),
                dataType: "json",
                success: function (res) {
                    $("#gb-loader").hide();
                    $("#gb-submit").prop("disabled", false);
                    if (res && res.success) {
                        $("#gb-success").text("Merci pour votre message !").slideDown("slow");
                        setTimeout(function () { $("#gb-success").slideUp("slow"); }, 3000);
                        $form[0].reset();
                        loadMessages();
                    } else {
                        $("#gb-error").text((res && res.error) || "Une erreur est survenue.").slideDown("fast");
                    }
                },
                error: function () {
                    $("#gb-loader").hide();
                    $("#gb-submit").prop("disabled", false);
                    $("#gb-error").text("Une erreur est survenue. Merci de réessayer.").slideDown("fast");
                }
            });
        });
    });
})(jQuery);
