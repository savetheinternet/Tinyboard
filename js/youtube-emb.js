$(document).ready(function () {
    //change this variable if you want to change how many videos are loaded per post
    //set this to 0 if you want all youtube urls in a post to be embbed
    var localembcount = 1;

    //size of player displayed in post
    var PlayerHeight = "315px";
    var PlayerWidth = "420px";

    //load stylesheet for youtube player
    $("head").append('<link rel="stylesheet" media="screen" href="/js/ytstyle/youtube.css">');

    //global regex
    var youtubeExphtml = /<a[^>]+(?:youtube.com\/watch\?[^>]*v=|youtu.be\/)([\w_-]{11})(?:(?:#|\?|&amp;)a?t=([ms\d]+)|[^"])*.*?<\/a>/gi;

    //nonglobal 
    var youtubeExp = /<a[^>]+(?:youtube.com\/watch\?[^>]*v=|youtu.be\/)([\w_-]{11})(?:(?:#|\?|&amp;)a?t=([ms\d]+)|[^"])*.*?<\/a>/i;


    //dummy youtube loader
    var embcode = '<a class="youtube-link" href="http://www.youtube.com/watch?v=:videoid:">http://www.youtube.com/watch?v=:videoid:</a>';


    //parse urls in a post to find youtube urls and their video ID's
    String.prototype.youTubeparse =

    function () {

        var match = this.match(youtubeExp);

        if (match && match[1].length == 11) {
            return match[1];
        } else {
            return String('false');

        }
    };




    String.prototype.youTubeparsehtml =
        function () {
            var match = this.match(youtubeExphtml);
            return match;
    };

    //init embed of videos
    var embVideos = function () {
        $(".post .body").each(function (indes) {
            var text = $(this).html();
            var replacetxt = text.youTubeparsehtml();
            if (replacetxt != null) {
                $.each(replacetxt, function (index, value) {
                    if (index < localembcount) {

                        getid = value.youTubeparse();


                        emb = embcode;
                        emb = emb.replace(':videoid:', getid);
                        text = text.replace(value, emb);

                        $(".post .body").eq(indes).html(text);




                    } else {
                        if (localembcount != 0) {

                            return;

                        } else {
                            getid = value.youTubeparse();


                            emb = embcode;
                            emb = emb.replace(':videoid:', getid);
                            text = text.replace(value, emb);

                            $(".post .body").eq(indes).html(text);

                        }
                    }



                });

            } else {
                return;
            }

        });
        youtubeSeer();

        //final setup of our dummy youtube player

        function youtubeSeer() {
            $('a.youtube-link').each(function () {
                var yt_url = this.href,
                    yt_id = yt_url.split('?v=')[1];



                $(this).replaceWith('<div data-originalurl="' + yt_url + '" class="youtube-box" style="display:inline-block;height:' + PlayerHeight + ';width:' + PlayerWidth + ';background-image:url(http://img.youtube.com/vi/' + yt_id + '/0.jpg);"><span class="youtube-bar"><span class="yt-bar-left"></span><span class="yt-bar-right"></span></span><span class="youtube-play"></span></div>');
                $('div.youtube-box').click(function () {
                    $(this).replaceWith('<iframe data-originalurl="' + yt_url + '" class="youtube-box" style="display:inline-block;width:' + PlayerWidth + ';height:' + PlayerHeight + ';" class="youtube-frame" src="http://www.youtube.com/embed/' + yt_id + '?autoplay=1"></iframe>');
                });




            });
        }
    };


    //disable video embbing and show original youtube urls
    var disableEmb = function () {
        $('.youtube-box').each(function () {
            var myUrl = $(this).attr('data-originalurl');
            $(this).replaceWith('<a target="_blank" rel="nofollow" href="' + myUrl + '">' + myUrl + '</a>');
        });



    };



    //local storage stuff
    emb_vid = localStorage['embvid'] ? true : false;

    $('hr:first').before('<div id="emb-vid" style="text-align:right;"><a class="unimportant" href="javascript:void(0)">-</a></div>');
    $('div#emb-vid a').text('Embed Youtube Videos (' + (emb_vid ? 'disabled' : 'enabled') + ')');

    $('div#emb-vid a').click(function () {
        emb_vid = !emb_vid;

        if (emb_vid) {
            $('div#emb-vid a').text('Embed Youtube Videos (disabled)');
            localStorage.embvid = true;
            disableEmb();
        } else {
            $('div#emb-vid a').text('Embed Youtube Videos (enabled)');
            delete localStorage.embvid;
            embVideos();

        }

        return false;




    });
    if (!emb_vid)
        embVideos();
});
