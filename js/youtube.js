/*
* youtube.js
* https://github.com/savetheinternet/Tinyboard/blob/master/js/youtube.js
*
* Released under the MIT license
* Copyright (c) 2013 Michael Save <savetheinternet@tinyboard.org>
*
* Usage:
*   $config['additional_javascript'][] = 'js/jquery.min.js';
*   $config['additional_javascript'][] = 'js/settings.js';(OPTIONAL)
*   $config['additional_javascript'][] = 'js/youtube.js';
*
* Optional: 
*	If you use settings.js(https://github.com/savetheinternet/Tinyboard/blob/master/js/settings.js)
*	you can change the video player box size with these settings
*
*	tb_settings['youtube_embed'] = {
*	player_width:"420px",//embed player width
*	player_height:"315px"//embed player height
*	};
*
*/

$(document)
    .ready(function () {
        var settings = new script_settings('youtube_embed'),
            youtubeExptext = /(?:youtube.com\/watch\?[^>]*v=|youtu.be\/)([\w_-]{11})(?:(?:#|\?|&amp;)a?t=([ms\d]+)|[^"])*.*?/i,
            PlayerWidth = (typeof settings.get('player_width') == "undefined") ? "420px" : settings.get('player_width'),
            PlayerHeight = (typeof settings.get('player_height') == "undefined") ? "315px" : settings.get('player_height');




        String.prototype.youTubeparsetext = function () {
            var match = this.match(youtubeExptext);
            if (match && match[1].length == 11) {
                return match[1];
            } else {
                return String('false');
            }
        };


        var YouTubeBox = function () {
            //video url
            var yt_url = this.href;
            //video id
            yt_id = yt_url.youTubeparsetext();

            var $button = $("<div />")
                .append($($("<a/>", {
                        "rel": "nofollow",
                        "target": "_BLANK",
                        "text": "Embed"
                    }))
                    .clone())
                .html();

            $youtubeBox = $('<span/>', {
                "class": 'embedbutton',
                "data-opened": "false",
                "data-youtubeid": yt_id,
                "css": {
                    "cursor": "pointer"
                }


            });

            $youtubeBox.html(" [" + $button + "]");

            $youtubeBox.click(clickEmbed);

            $(this)
                .after($youtubeBox);
        };




        var clickEmbed = function () {
            yt_id2 = $(this)
                .attr("data-youtubeid");
            yt_ind = $(this)
                .index();


            if ($(this)
                .attr("data-opened") == "false") {
                $(this)
                    .after('<span data-ytid="' + yt_id2 + '" data-ytind="' + yt_ind + '" class="youtube-box"></br><iframe style="display:inline-block;width:' + PlayerWidth + ';height:' + PlayerHeight + ';border:none;" class="youtube-frame" src="http://www.youtube.com/embed/' + yt_id2 + '?origin=' + document.location.host + '"></iframe></span>');
                $(this)
                    .attr("data-opened", "true");
                $(this)
                    .children('a')
                    .text("Close");
            } else {

                a = $.find("[data-ytid='" + yt_id2 + "']" + "[data-ytind='" + yt_ind + "']");
                $(a)
                    .remove();
                $(this)
                    .attr("data-opened", "false");
                $(this)
                    .children('a')
                    .text("Embed");
            }

        };



        var YouTubeInit = function () {
            var text = $(this)
                .html();
            var isYoutubeLink = text.youTubeparsetext();

            if (isYoutubeLink != 'false') {
                $(this)
                    .each(YouTubeBox);

            }
        };




        var disableYouTubeBox = function () {
            $('.embedbutton')
                .each(function () {
                    $(this)
                        .remove();
                });

            $('.youtube-box')
                .each(function () {
                    $(this)
                        .remove();
                });



        };




        emb_vid = localStorage['embvid'] ? true : false;

        $('hr:first')
            .before('<div id="emb-vid" style="text-align:right;"><a class="unimportant" href="javascript:void(0)">-</a></div>');
        $('div#emb-vid a')
            .text('Embed Youtube Videos (' + (emb_vid ? 'disabled' : 'enabled') + ')');

        $('div#emb-vid a')
            .click(function () {
                emb_vid = !emb_vid;

                if (emb_vid) {
                    $('div#emb-vid a')
                        .text('Embed Youtube Videos (disabled)');
                    localStorage.embvid = true;
                    disableYouTubeBox();
                } else {
                    $('div#emb-vid a')
                        .text('Embed Youtube Videos (enabled)');
                    delete localStorage.embvid;
                    $(".body a")
                        .each(YouTubeInit);
                }

                return false;




            });
        if (!emb_vid)

            $(".body a")
                .each(YouTubeInit);



        $(document)
            .bind('new_post', function (e, post) {
                if (!emb_vid)
                    $(post)
                        .find('.body a')
                        .each(YouTubeInit);
            });


    });
