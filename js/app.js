angular.module('templates.app', ['layout/footers/basic.tpl.html', 'layout/footers/details.tpl.html', 'layout/footers/player.tpl.html', 'layout/headers/basic.tpl.html', 'layout/headers/searchable.tpl.html', 'movie/details.tpl.html', 'movie/list.tpl.html', 'music/albums.tpl.html', 'music/artists.tpl.html', 'music/musics.tpl.html', 'music/songs.tpl.html', 'navigation/navigation.tpl.html', 'now/playing.tpl.html', 'now/playlist.tpl.html', 'remote/remote.tpl.html', 'settings/wizard.tpl.html', 'tvshow/details.tpl.html', 'tvshow/episodes.tpl.html', 'tvshow/list.tpl.html', 'tvshow/seasons.tpl.html']);

angular.module("layout/footers/basic.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("layout/footers/basic.tpl.html",
    "<div ng-switch on=\"player.active\">\n" +
    "    <div ng-switch-when=\"true\" class=\"row actions\">\n" +
    "        <div class=\"span3 icon-backward\"  ng-tap=\"\">\n" +
    "        </div>\n" +
    "        <div class=\"span3 icon-stop\" ng-tap=\"stop()\">\n" +
    "        </div>\n" +
    "        <div class=\"span3 icon-play\" ng-hide=\"player.speed\" ng-tap=\"togglePlay()\"></div>\n" +
    "        <div class=\"span3 icon-pause\" ng-show=\"player.speed\" ng-tap=\"togglePlay()\"></div>\n" +
    "        <div class=\"span3 icon-forward\" ng-tap=\"\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"false\" class=\"row actions\">\n" +
    "        <div class=\"span3 icon-film\"  ng-tap=\"goTo('videos','MovieTitles')\">\n" +
    "        </div>\n" +
    "        <div class=\"span3 icon-facetime-video\" ng-tap=\"goTo('videos','TVShowTitles')\">\n" +
    "        </div>\n" +
    "        <div class=\"span3 icon-music\" ng-tap=\"goTo('music')\">\n" +
    "        </div>\n" +
    "        <div class=\"span3 icon-picture\" ng-tap=\"goTo('pictures')\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("layout/footers/details.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("layout/footers/details.tpl.html",
    "<div ng-switch on=\"library.item.type\">\n" +
    "    <div ng-switch-when=\"movie\"  class=\"row actions\" >\n" +
    "        <div class=\"span3\" ng-tap=\"play({'movieid': library.item.movieid})\">\n" +
    "            <i class=\"icon-play\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"span3\" ng-tap=\"imdb(library.item.imdbnumber)\">\n" +
    "            <span class=\"imdb\">IMDb</span>\n" +
    "        </div>\n" +
    "        <div class=\"span3\" ng-tap=\"play({'file': library.item.trailer})\">\n" +
    "            <i class=\"icon-film\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"span3\" ng-tap=\"add({'movieid': library.item.movieid})\">\n" +
    "            <i class=\"icon-plus\"></i>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-switch-when=\"episode\"  class=\"row actions\" >\n" +
    "        <div class=\"span3\" ng-tap=\"play({'episodeid': library.item.episodeid})\">\n" +
    "            <i class=\"icon-play\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"span3\" ng-tap=\"add({'episodeid': library.item.episodeid})\">\n" +
    "            <i class=\"icon-plus\"></i>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("layout/footers/player.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("layout/footers/player.tpl.html",
    "<div class=\"row actions\">\n" +
    "    <div class=\"span2\" ng-tap=\"previous()\">\n" +
    "        <i class=\"icon-fast-backward\"></i>\n" +
    "    </div>\n" +
    "    <div class=\"span2\" ng-tap=\"backward()\">\n" +
    "        <i class=\"icon-backward\"></i>\n" +
    "    </div>\n" +
    "    <div class=\"span2\" ng-tap=\"togglePlay()\">\n" +
    "        <i class=\"icon-play\" ng-show=\"!player.speed\"></i>\n" +
    "        <i class=\"icon-pause\" ng-show=\"player.speed\"></i>\n" +
    "    </div>\n" +
    "    <div class=\"span2\" ng-tap=\"stop()\">\n" +
    "        <i class=\"icon-stop\"></i>\n" +
    "    </div>\n" +
    "    <div class=\"span2\" ng-tap=\"forward()\">\n" +
    "        <i class=\"icon-forward\"></i>\n" +
    "    </div>\n" +
    "    <div class=\"span2\" ng-tap=\"next()\">\n" +
    "        <i class=\"icon-fast-forward\"></i>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("layout/headers/basic.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("layout/headers/basic.tpl.html",
    "<a ng-tap=\"$parent.toggleDrawer()\"><i class=\"icon icon-reorder\"></i></a>\n" +
    "<h1>\n" +
    "    Foxmote\n" +
    "    <i class=\"logo\"></i>\n" +
    "</h1>\n" +
    "<h2 ng-class=\"{connected : connected, disconnected : !connected}\"\n" +
    "    ng-switch on=\"connected\">\n" +
    "    <div ng-switch-when=\"true\">\n" +
    "        {{configuration.host.displayName}}\n" +
    "        <span class=\"pull-right\">{{configuration.host.ip}}</span>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"false\">\n" +
    "      No connection\n" +
    "    </div>\n" +
    "</h2>");
}]);

angular.module("layout/headers/searchable.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("layout/headers/searchable.tpl.html",
    "<a ng-tap=\"$parent.toggleDrawer()\"><i class=\"icon icon-reorder\"></i></a>\n" +
    "<h1>\n" +
    "    <form action=\"#\">\n" +
    "        <input type=\"text\" required=\"required\" placeholder=\"Search\" ng-model=\"library.criteria\">\n" +
    "        <button type=\"reset\" class=\"icon-remove\"></button>\n" +
    "    </form>\n" +
    "</h1>\n" +
    "<h2 ng-class=\"{connected : connected, disconnected : !connected}\"\n" +
    "    ng-switch on=\"connected\">\n" +
    "    <div ng-switch-when=\"true\">\n" +
    "        {{configuration.host.displayName}}\n" +
    "        <span class=\"pull-right\">{{configuration.host.ip}}</span>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"false\">\n" +
    "        No connection\n" +
    "    </div>\n" +
    "</h2>");
}]);

angular.module("movie/details.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("movie/details.tpl.html",
    "<div ng-switch on=\"loading\" ng-class=\"{loading : loading}\">\n" +
    "    <div ng-switch-when=\"true\" class=\"icon-spinner icon-spin icon-large\"></div>\n" +
    "    <div class=\"movie detail\" ng-switch-when=\"false\">\n" +
    "        <div class=\"properties\">\n" +
    "            <h1>\n" +
    "                {{library.item.title}}\n" +
    "            </h1>\n" +
    "\n" +
    "            <div class=\"row\">\n" +
    "                <img class=\"offset1 span5 poster\" src=\"{{library.item.thumbnail | asset:configuration.host.ip | fallback:'img/backgrounds/low-contrast-256.png'}}\"/>\n" +
    "\n" +
    "                <div class=\"span6\">\n" +
    "                    <ul>\n" +
    "                        <li>\n" +
    "                            <div class=\"label\">Genres</div>\n" +
    "                            {{library.item.genre.join(', ')}}\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"label\">Runtime</div>\n" +
    "                            {{library.item.runtime | time | date:'HH:mm'}}\n" +
    "                        </li>\n" +
    "\n" +
    "                        <li ng-hide=\"movie.studio.length\">\n" +
    "                            <div class=\"label\">Studio</div>\n" +
    "                            {{library.item.studio.join(', ')}}\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"fanart\"\n" +
    "                 style=\"background-image: url({{library.item.fanart | asset:configuration.host.ip}});\"></div>\n" +
    "        </div>\n" +
    "        <div>\n" +
    "            <div class=\"rating\" rating rating-value=\"library.item.rating\" rating-max=\"10\"></div>\n" +
    "            <p>{{library.item.plot}}</p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("movie/list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("movie/list.tpl.html",
    "<div ng-switch on=\"loading\" ng-class=\"{loading : loading}\">\n" +
    "    <div ng-switch-when=\"true\" class=\"icon-spinner icon-spin icon-large\"></div>\n" +
    "    <ul data-type=\"list\" class=\"view movies\" ng-switch-when=\"false\">\n" +
    "        <li class=\"row movie\" ng-repeat=\"movie in movies | filter:library.criteria\"\n" +
    "            ng-tap=\"go('/movie/' + movie.movieid, 'none')\"\n" +
    "            ng-class-odd=\"'odd'\">\n" +
    "            <img class=\"span4 poster\" src=\"{{movie.thumbnail | asset:configuration.host.ip}}\"/>\n" +
    "            <em class=\"playcount\" ng-show=\"movie.playcount\">&#10003;</em>\n" +
    "\n" +
    "            <div class=\"span7\">\n" +
    "                <p>{{movie.label}}</p>\n" +
    "\n" +
    "                <p>{{movie.genre.join(', ')}}</p>\n" +
    "\n" +
    "                <p>\n" +
    "                    {{movie.runtime | time | date:'HH:mm'}}\n" +
    "                </p>\n" +
    "            </div>\n" +
    "            <span class=\"rating\"><em>{{movie.rating | number:1}}</em></span>\n" +
    "        </li>\n" +
    "        <li ng-show=\"!movies.length\" class=\"empty list\">No item here :'(</li>\n" +
    "    </ul>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("music/albums.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("music/albums.tpl.html",
    "<div ng-switch on=\"loading\" ng-class=\"{loading : loading}\">\n" +
    "    <div ng-switch-when=\"true\" class=\"icon-spinner icon-spin icon-large\"></div>\n" +
    "    <ul data-type=\"list\" class=\"view albums\" ng-switch-when=\"false\">\n" +
    "        <li class=\"row album\" ng-repeat=\"album in albums | filter:library.criteria\"\n" +
    "            ng-tap=\"go('/music/songs/albumid/' + album.albumid)\"\n" +
    "            ng-class-odd=\"'odd'\">\n" +
    "            <img class=\"span3 cover\" src=\"{{album.thumbnail | asset:configuration.host.ip}}\"\n" +
    "                 ng-show=\"hasCover(album)\"/>\n" +
    "            <img class=\"span3 cover unknow\" src=\"img/blank.gif\"\n" +
    "                 ng-hide=\"hasCover(album)\"/>\n" +
    "\n" +
    "            <div class=\"span7\">\n" +
    "                <p>{{album.label}}</p>\n" +
    "\n" +
    "                <p>{{album.artist.join(', ')}}</p>\n" +
    "\n" +
    "                <p>{{album.year}}</p>\n" +
    "            </div>\n" +
    "        </li>\n" +
    "        <li ng-show=\"!albums.length\" class=\"empty list\">No item here :'(</li>\n" +
    "    </ul>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("music/artists.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("music/artists.tpl.html",
    "<div ng-switch on=\"loading\" ng-class=\"{loading : loading}\">\n" +
    "    <div ng-switch-when=\"true\" class=\"icon-spinner icon-spin icon-large\"></div>\n" +
    "    <ul data-type=\"list\" class=\"view artists\" ng-switch-when=\"false\">\n" +
    "        <li class=\"row artist\" ng-repeat=\"artist in artists | filter:library.criteria\"\n" +
    "            ng-tap=\"go('/music/albums/artistid/' + artist.artistid)\"\n" +
    "            ng-class-odd=\"'odd'\">\n" +
    "            <img class=\"span3 cover\" src=\"{{artist.thumbnail | asset:configuration.host.ip}}\"\n" +
    "                 ng-show=\"hasCover(artist)\"/>\n" +
    "            <img class=\"span3 cover unknow\" src=\"img/blank.gif\" ng-hide=\"hasCover(artist)\"/>\n" +
    "\n" +
    "            <div class=\"span7\">\n" +
    "                <p>{{artist.label}}</p>\n" +
    "\n" +
    "                <p>{{artist.genre.join(', ')}}</p>\n" +
    "            </div>\n" +
    "        </li>\n" +
    "        <li ng-show=\"!artists.length\" class=\"empty list\">No item here :'(</li>\n" +
    "    </ul>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("music/musics.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("music/musics.tpl.html",
    "<div class=\"music\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"span6 category\">\n" +
    "            <div class=\"songs\" ng-tap=\"go('/music/songs')\">\n" +
    "                <h3>Songs</h3>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"span6 category\">\n" +
    "            <div class=\"albums\" ng-tap=\"go('/music/albums')\">\n" +
    "                <h3>Albums</h3>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"span6 category\">\n" +
    "            <div class=\"artists\" ng-tap=\"go('/music/artists')\">\n" +
    "                <h3>Artits</h3>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"span6 category\">\n" +
    "            <div class=\"party\" ng-tap=\"party()\">\n" +
    "                <h3>Party Mode</h3>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("music/songs.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("music/songs.tpl.html",
    "<div ng-switch on=\"loading\" ng-class=\"{loading : loading}\">\n" +
    "    <div ng-switch-when=\"true\" class=\"icon-spinner icon-spin icon-large\"></div>\n" +
    "    <div data-type=\"list\" ng-switch-when=\"false\">\n" +
    "        <ul class=\"view songs\">\n" +
    "            <li class=\"row album\" ng-show=\"isFiltered()\">\n" +
    "                <div class=\"span4 thumb\">\n" +
    "                    <img class=\"vinyl\" src=\"img/backgrounds/vinyl.png\"/>\n" +
    "                    <img class=\"cover\" src=\"{{getCover(songs[0])}}\"/>\n" +
    "                </div>\n" +
    "                <div class=\"span8\">\n" +
    "                    <p>{{songs[0].album}}</p>\n" +
    "\n" +
    "                    <p>{{songs[0].artist.join(', ')}}</p>\n" +
    "\n" +
    "                    <p>{{songs[0].year}}</p>\n" +
    "                </div>\n" +
    "            </li>\n" +
    "            <li class=\"row song\" ng-repeat=\"song in songs| filter:library.criteria\"\n" +
    "                ng-class-odd=\"'odd'\"\n" +
    "                ng-tap=\"play({songid : song.songid}, $index)\">\n" +
    "                <div class=\"span10\">\n" +
    "                    <p>{{song.label}}</p>\n" +
    "\n" +
    "                    <p>{{song.artist.join(', ')}}</p>\n" +
    "\n" +
    "                </div>\n" +
    "                <div class=\"span2\">\n" +
    "                    <p></p>\n" +
    "\n" +
    "                    <p>{{song.duration | time | date :'mm:ss'}}</p>\n" +
    "                </div>\n" +
    "            </li>\n" +
    "            <li ng-show=\"!songs.length\" class=\"empty list\">No item here :'(</li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("navigation/navigation.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("navigation/navigation.tpl.html",
    "<section data-type=\"sidebar\">\n" +
    "    <header>\n" +
    "        <h1>Library</h1>\n" +
    "    </header>\n" +
    "    <nav ng-class=\"{'active-player' : player.active, 'inactive-player': player.active}\">\n" +
    "        <ul>\n" +
    "            <li ng-repeat=\"item in medias\">\n" +
    "                <a ng-tap=\"go(item.hash)\" ng-class=\"isCurrent(item.hash)\">\n" +
    "                    <i class=\"{{item.icon}}\"></i>\n" +
    "                    {{item.label}}\n" +
    "                </a>\n" +
    "            </li>\n" +
    "            <li  ng-show=\"player.active\">\n" +
    "                <a  ng-tap=\"go('/now/playing')\" ng-class=\"isCurrent('/now/playing')\">\n" +
    "                    <i class=\"icon-youtube-play\"></i>\n" +
    "                    Now playing\n" +
    "                </a>\n" +
    "            </li>\n" +
    "            <li  ng-show=\"player.active\">\n" +
    "                <a  ng-tap=\"go('/now/playlist')\" ng-class=\"isCurrent('/now/playlist')\">\n" +
    "                    <i class=\"icon-glass\"></i>\n" +
    "                    Queue\n" +
    "                </a>\n" +
    "            </li>\n" +
    "            <li ng-repeat=\"item in controls\">\n" +
    "                <a ng-tap=\"go(item.hash)\" ng-class=\"isCurrent(item.hash)\">\n" +
    "                    <i class=\"{{item.icon}}\"></i>\n" +
    "                    {{item.label}}\n" +
    "                </a>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </nav>\n" +
    "    <div class=\"now playing\" ng-show=\"player.active\">\n" +
    "        <img class=\"poster\" src=\"{{player.item.art | thumb | asset:configuration.host.ip}}\" ng-tap=\"go('/now/playing','none')\"\n" +
    "             ng-show=\"hasPoster(player.item.art)\"/>\n" +
    "        <img class=\"poster unknown\" src=\"img/blank.gif\" ng-tap=\"go('/now/playing')\"\n" +
    "             ng-hide=\"hasPoster(player.item.art)\"/>\n" +
    "        <h1>{{getLabel(player.item)}}</h1>\n" +
    "        <footer>\n" +
    "            <div class=\"row actions\">\n" +
    "                <div class=\"offset4 span4 icon-play\" ng-tap=\"togglePlay()\"  ng-show=\"!player.speed\">\n" +
    "                </div>\n" +
    "                <div class=\"offset4 span4 icon-pause\" ng-tap=\"togglePlay()\"  ng-show=\"player.speed\">\n" +
    "                </div>\n" +
    "                <div class=\"span3\" ng-tap=\"next()\"><i class=\"icon-fast-forward\"></i></div>\n" +
    "            </div>\n" +
    "        </footer>\n" +
    "    </div>\n" +
    "</section>");
}]);

angular.module("now/playing.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("now/playing.tpl.html",
    "<div ng-switch on=\"loading\" ng-class=\"{loading : loading, now : !loading}\">\n" +
    "    <div ng-switch-when=\"true\" class=\"icon-spinner icon-spin icon-large\"></div>\n" +
    "    <div ng-switch-when=\"false\">\n" +
    "        <div ng-switch on=\"library.item.type\" class=\"playing\">\n" +
    "            <div ng-switch-when=\"movie\">\n" +
    "                <div ng-include src=\"'movie/details.tpl.html'\"></div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-switch-when=\"episode\">\n" +
    "                <div ng-include src=\"'tvshow/details.tpl.html'\"></div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-switch-default class=\"detail\">\n" +
    "                <div class=\"row\">\n" +
    "                    <img class=\"offset1 span10\" src=\"{{library.item.thumbnail | asset:configuration.host.ip}}\"/>\n" +
    "                </div>\n" +
    "                <h1>\n" +
    "                    {{library.item.label}}\n" +
    "                </h1>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"seek-wrapper\">\n" +
    "            <div class=\"row times\">\n" +
    "                {{player.seek.time | time | date:'HH:mm:ss'}}/\n" +
    "                {{player.seek.totaltime | time | date:'HH:mm:ss'}}\n" +
    "            </div>\n" +
    "            <div class=\"row\">\n" +
    "                <div class=\"span2 action\" ng-tap=\"toggleAudioStreams()\" ng-show=\"isTypeVideo()\">\n" +
    "                    <i class=\"icon-comments\"></i>\n" +
    "                </div>\n" +
    "                <div ng-class=\"{span8 :isTypeVideo(), span10 : !isTypeVideo(), offset1 : !isTypeVideo()}\"\n" +
    "                     role=\"slider\" aria-valuemin=\"0\" aria-valuenow=\"0\" aria-valuemax=\"100\">\n" +
    "                    <div seekbar seekbar-value=\"player.seek.percentage\" seekbar-max=\"100\"\n" +
    "                         on-seekbar-changed=\"onSeekbarChanged(newValue);\"></div>\n" +
    "                </div>\n" +
    "                <div class=\"span2 action\" ng-tap=\"toggleSubtitles()\" ng-show=\"isTypeVideo()\">\n" +
    "                    <i class=\"icon-quote-left\"></i>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<form role=\"dialog\" data-type=\"action\" class=\"chooser\" onsubmit=\"return false;\" ng-show=\"showAudioSelect\">\n" +
    "    <header>\n" +
    "        <h1> Audio Streams </h1>\n" +
    "    </header>\n" +
    "    <menu>\n" +
    "        <button ng-repeat=\"audio in player.audiostreams\" ng-tap=\"select('audio', audio)\">\n" +
    "          {{audio.name}} ( {{audio.language}})\n" +
    "          <i class=\"pull-right icon-check\" ng-show=\"isSelected(player.current.audiostream, audio)\"></i>\n" +
    "        </button>\n" +
    "        <button ng-tap=\"toggleAudioStreams()\"> Cancel </button>\n" +
    "    </menu>\n" +
    "</form>\n" +
    "\n" +
    "<form role=\"dialog\" data-type=\"action\" class=\"chooser\" onsubmit=\"return false;\" ng-show=\"showSubtitleSelect\">\n" +
    "    <header>\n" +
    "        <h1>Subtitles</h1>\n" +
    "    </header>\n" +
    "    <menu>\n" +
    "        <button ng-tap=\"select('subtitle', 'off')\">\n" +
    "            None\n" +
    "            <i class=\"pull-right icon-check\" ng-show=\"isSelected(player.current.subtitle, 'off')\"></i>\n" +
    "        </button>\n" +
    "        <button ng-repeat=\"subtitle in player.subtitles\" ng-tap=\"select('subtitle', subtitle)\">\n" +
    "            {{subtitle.name}} ({{subtitle.language}})\n" +
    "            <i class=\"pull-right icon-check\" ng-show=\"isSelected(player.current.subtitle, subtitle)\"></i>\n" +
    "        </button>\n" +
    "        <button ng-tap=\"toggleSubtitles()\"> Cancel </button>\n" +
    "    </menu>\n" +
    "</form>");
}]);

angular.module("now/playlist.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("now/playlist.tpl.html",
    "<div ng-switch on=\"loading\" ng-class=\"{loading : loading}\">\n" +
    "    <div ng-switch-when=\"true\" class=\"icon-spinner icon-spin icon-large\"></div>\n" +
    "    <div data-type=\"list\" ng-switch-when=\"false\">\n" +
    "        <ul class=\"view songs\">\n" +
    "            <li class=\"row \" ng-repeat=\"item in items\"\n" +
    "                ng-class-odd=\"'odd'\"\n" +
    "                ng-tap=\"next($index)\">\n" +
    "                    <img class=\"span4 poster\"\n" +
    "                         src=\"{{item.art | thumb | asset:configuration.host.ip | fallback:'img/backgrounds/low-contrast-128.png'}}\"/>\n" +
    "                <div class=\"span8\">\n" +
    "                    <p>{{item.label}}</p>\n" +
    "                    <p ng-show=\"item.duration\">{{item.duration | time | date :'mm:ss'}}</p>\n" +
    "                    <p ng-show=\"item.runtime\">{{item.runtime| time | date :'hh:mm:ss'}}</p>\n" +
    "                    <img class=\"equalizer\" src=\"img/backgrounds/equalizer.gif\" ng-show=\"isPlaying(item.id)\"/>\n" +
    "                </div>\n" +
    "            </li>\n" +
    "            <li ng-show=\"!items.length\" class=\"empty list\">No item here :'(</li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("remote/remote.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("remote/remote.tpl.html",
    "<div class=\"remote\">\n" +
    "    <div class=\"row shortcuts\">\n" +
    "        <div class=\"action\" ng-tap=\"xbmc.send('Input.ContextMenu')\">\n" +
    "            <i class=\"icon icon-list-ul\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"action\" ng-tap=\"xbmc.send('Input.Info')\">\n" +
    "            <i class=\"icon icon-info-sign\"></i>\n" +
    "        </div>\n" +
    "         <div class=\"action\" ng-tap=\"xbmc.send('Input.Home')\">\n" +
    "            <i class=\"icon icon-home\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"action\" ng-tap=\"xbmc.send('System.Shutdown')\">\n" +
    "            <i class=\"icon icon-power-off\"></i>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"sound\">\n" +
    "        <div class=\"row\">\n" +
    "            <div class=\"action\" ng-tap=\"toggleMute()\">\n" +
    "                <i class=\"icon icon-volume-off\"></i>\n" +
    "            </div>\n" +
    "            <div class=\"action\" ng-tap=\"setVolume(volume -1)\">\n" +
    "                <i class=\"icon icon-volume-down\"></i>\n" +
    "            </div>\n" +
    "            <div class=\"action\"  ng-tap=\"setVolume(volume +1)\">\n" +
    "                <i class=\"icon icon-volume-up\"></i>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"navigation\">\n" +
    "        <div class=\"row\">\n" +
    "            <div class=\"action offseted direction\" ng-tap=\"xbmc.send('Input.Up')\">\n" +
    "                <i class=\"icon icon-chevron-up\"></i>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"row\">\n" +
    "            <div class=\"action direction\" ng-tap=\"xbmc.send('Input.Left')\">\n" +
    "                <i class=\"icon icon-chevron-left\"></i>\n" +
    "            </div>\n" +
    "            <div class=\"action\" ng-tap=\"xbmc.send('Input.Select')\">\n" +
    "                <i class=\"icon icon-circle\"></i>\n" +
    "            </div>\n" +
    "            <div class=\"action direction\" ng-tap=\"xbmc.send('Input.Right')\">\n" +
    "                <i class=\"icon icon-chevron-right\"></i>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"row\">\n" +
    "            <div class=\"action\" ng-tap=\"xbmc.send('Input.Back')\">\n" +
    "                <i class=\"icon icon-mail-reply\"></i>\n" +
    "            </div>\n" +
    "            <div class=\"action direction\" ng-tap=\"xbmc.send('Input.Down')\">\n" +
    "                <i class=\"icon icon-chevron-down\"></i>\n" +
    "            </div>\n" +
    "            <div class=\"action\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("settings/wizard.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("settings/wizard.tpl.html",
    "<form class=\"wizard\">\n" +
    "    <h1>\n" +
    "        <img src=\"img/backgrounds/computer-icon.png\" width=\"64\" height=\"64\"/>\n" +
    "        <div>Host wizard</div>\n" +
    "    </h1>\n" +
    "\n" +
    "    <p>\n" +
    "        <label>Display name:</label>\n" +
    "        <input type=\"text\" placeholder=\"Ex : HTPC\" required=\"\" ng-model=\"configuration.host.displayName\" tabindex=\"1\">\n" +
    "        <button type=\"reset\" class=\"icon-remove\"></button>\n" +
    "    </p>\n" +
    "    <p>\n" +
    "        <label>Host IP:</label>\n" +
    "        <input type=\"text\" placeholder=\"Ex : 192.16.0.1\" required=\"\" ng-model=\"configuration.host.ip\" tabindex=\"2\">\n" +
    "        <button type=\"reset\" class=\"icon-remove\"></button>\n" +
    "    </p>\n" +
    "    <p>\n" +
    "        <label>Api port</label>\n" +
    "        <input type=\"text\" value=\"9090\" placeholder=\"Ex : 9090\" required=\"\" ng-model=\"configuration.host.port\" tabindex=\"3\">\n" +
    "        <button type=\"reset\" class=\"icon-remove\"></button>\n" +
    "    </p>\n" +
    "    <button ng-tap=\"save()\">Save</button>\n" +
    "</form>");
}]);

angular.module("tvshow/details.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tvshow/details.tpl.html",
    "<div ng-switch on=\"loading\" ng-class=\"{loading : loading}\">\n" +
    "    <div ng-switch-when=\"true\" class=\"icon-spinner icon-spin icon-large\"></div>\n" +
    "    <div ng-switch-when=\"false\" class=\"tvshow\">\n" +
    "        <img class=\"banner\"\n" +
    "             src=\"{{library.item.art['tvshow.banner']  | asset:configuration.host.ip | fallback:'img/backgrounds/low-contrast-256.png'}}\"\n" +
    "             />\n" +
    "\n" +
    "        <div class=\"episode detail\">\n" +
    "\n" +
    "            <h1>\n" +
    "                <div rating rating-value=\"library.item.rating\" rating-max=\"10\"></div>\n" +
    "                {{library.item.title}}\n" +
    "            </h1>\n" +
    "            <div class=\"row\">\n" +
    "                <img class=\"offset1 span10\" src=\"{{library.item.thumbnail  | asset:configuration.host.ip}}\"/>\n" +
    "            </div>\n" +
    "            <p>\n" +
    "                {{library.item.plot}}\n" +
    "            </p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tvshow/episodes.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tvshow/episodes.tpl.html",
    "<div ng-switch on=\"loading\" ng-class=\"{loading : loading}\">\n" +
    "    <div ng-switch-when=\"true\" class=\"icon-spinner icon-spin icon-large\"></div>\n" +
    "    <div ng-switch-when=\"false\" class=\"tvshow\">\n" +
    "        <img class=\"banner\" src=\"{{episodes[0].art['tvshow.banner']  | asset:configuration.host.ip}}\" alt=\"show.title\"/>\n" +
    "        <ul data-type=\"list\" class=\"view\">\n" +
    "            <li class=\"row episode\" ng-repeat=\"episode in episodes| filter:library.criteria\"\n" +
    "                ng-tap=\"go('/tvshow/' + tvshowid + '/'+season+'/'+episode.episodeid, 'none')\"\n" +
    "                ng-class-odd=\"'odd'\">\n" +
    "                <img class=\"span4\" src=\"{{episode.thumbnail  | asset:configuration.host.ip}}\"/>\n" +
    "\n" +
    "                <div class=\"span7\">\n" +
    "                    <p>\n" +
    "                        {{episode.title}}\n" +
    "                    </p>\n" +
    "\n" +
    "                    <p>\n" +
    "                        {{episode.episode | episode:episode.season}}\n" +
    "                    </p>\n" +
    "                    <span class=\"rating\"><em>{{episode.rating | number:1}}</em></span>\n" +
    "                </div>\n" +
    "            </li>\n" +
    "            <li ng-show=\"!episodes.length\" class=\"empty list\">No item here :'(</li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("tvshow/list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tvshow/list.tpl.html",
    "<div ng-switch on=\"loading\" ng-class=\"{loading : loading}\">\n" +
    "    <div ng-switch-when=\"true\" class=\"icon-spinner icon-spin icon-large\"></div>\n" +
    "    <ul data-type=\"list\" class=\"view tvshows\" ng-switch-when=\"false\">\n" +
    "        <li class=\"tvshow\" ng-repeat=\"show in tvshows | filter:library.criteria\"\n" +
    "            ng-tap=\"go('/tvshow/' + show.tvshowid, 'none')\"\n" +
    "            ng-class-odd=\"'odd'\">\n" +
    "            <em class=\"playcount\" ng-show=\"show.playcount\">&#10003;</em>\n" +
    "            <img class=\"banner\" src=\"{{show.art.banner  | asset:configuration.host.ip | fallback:'img/backgrounds/banner.png'}}\" alt=\"show.title\"/>\n" +
    "\n" +
    "            <div class=\"rating\">\n" +
    "                <em>{{show.rating | number:1}}</em>\n" +
    "            </div>\n" +
    "        </li>\n" +
    "        <li ng-show=\"!tvshows.length\" class=\"empty list\">No item here :'(</li>\n" +
    "    </ul>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("tvshow/seasons.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tvshow/seasons.tpl.html",
    "<div ng-switch on=\"loading\" ng-class=\"{loading : loading}\">\n" +
    "    <div ng-switch-when=\"true\" class=\"icon-spinner icon-spin icon-large\"></div>\n" +
    "    <div ng-switch-when=\"false\">\n" +
    "        <ul data-type=\"list\" class=\"view\">\n" +
    "            <li class=\"row season\" ng-repeat=\"season in seasons | filter:library.criteria\"\n" +
    "                ng-tap=\"go('/tvshow/' + tvshowid + '/' + season.season)\">\n" +
    "                <img class=\"span4 poster\" src=\"{{season.thumbnail  | asset:configuration.host.ip}}\"/>\n" +
    "\n" +
    "                <div class=\"span8\">\n" +
    "                    <p>\n" +
    "                        {{season.showtitle}}\n" +
    "                    </p>\n" +
    "\n" +
    "                    <p>\n" +
    "                        {{season.label}}\n" +
    "                    </p>\n" +
    "                </div>\n" +
    "            </li>\n" +
    "            <li ng-show=\"!seasons.length\" class=\"empty list\">No item here :'(</li>\n" +
    "        </ul>\n" +
    "        <div class=\"fanart\" style=\"background-image: url({{seasons[0].fanart | asset:configuration.host.ip}});\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "");
}]);
