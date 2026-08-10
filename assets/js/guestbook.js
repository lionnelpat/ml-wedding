(function ($) {
    "use strict";

    var $carousel = $("#guestbook-carousel");
    var $empty = $("#guestbook-empty");
    var owlReady = false;

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
        var $quote = $('<span class="guestbook-quote">&ldquo;</span>');
        var $msg = $('<p class="guestbook-message"></p>').text(entry.message);
        var $name = $('<h5 class="guestbook-name"></h5>').text(entry.name);
        var $date = $('<span class="guestbook-date"></span>').text(formatDate(entry.date));

        $item.append($quote, $msg, $name, $date);
        return $item;
    }

    function initOwl() {
        if (owlReady || typeof $carousel.owlCarousel !== "function") {
            return;
        }
        $carousel.owlCarousel({
            loop: $carousel.children().length > 3,
            margin: 25,
            nav: true,
            navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
            dots: true,
            autoplay: true,
            autoplayTimeout: 5000,
            items: 3,
            responsive: {
                0: { items: 1 },
                600: { items: 2 },
                992: { items: 3 }
            }
        });
        owlReady = true;
    }

    function refreshOwl() {
        if (owlReady) {
            $carousel.trigger('destroy.owl.carousel');
            $carousel.removeClass('owl-loaded owl-drag');
            owlReady = false;
        }
        initOwl();
    }

    function renderMessages(messages) {
        $carousel.empty();
        if (!messages || messages.length === 0) {
            $carousel.append($empty);
            return;
        }
        messages.forEach(function (entry) {
            $carousel.append(buildCard(entry));
        });
        refreshOwl();
    }

    function loadMessages() {
        $.ajax({
            type: "GET",
            url: "guestbook.php",
            dataType: "json",
            success: function (res) {
                if (res && res.success) {
                    renderMessages(res.messages);
                }
            }
        });
    }

    $(function () {
        if (!$carousel.length) {
            return;
        }

        loadMessages();

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
