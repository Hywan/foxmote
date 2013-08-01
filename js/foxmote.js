/*! foxmote - v0.0.1 - 2013-08-01
 * Copyright (c) 2013 Nicolas ABRIC;
 * Licensed MIT
 */
"use strict";
angular.module('app', [
    'ui.state',
    'directives.rating',
    'directives.seekbar',
    'directives.tap',
    'filters.xbmc',
    'services.xbmc',
    'templates.app']);

// this is where our app definition is
angular.module('app')
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            var xbmchost = localStorage.getItem('xbmchost');
            if (xbmchost === null) {
                $urlRouterProvider.otherwise("/settings");
            } else {
                $urlRouterProvider.otherwise("/");
            }

        }])
    .controller('AppCtrl', ['$scope', '$rootScope', '$state', '$location', '$filter', 'xbmc',
        function ($scope, $rootScope, $state, $location, $filter, xbmc) {
            $scope.$state = $state;
            var init = function () {
                $scope.player = {
                    id: -1,
                    active: false,
                    audiostreams: [],
                    current: {},
                    intervalId: -1,
                    item: {},
                    seek: {},
                    speed: 0,
                    subtitles: [],
                    type: ''
                };
                $scope.playlist = -1;
                $scope.library = {
                    item: {},
                    criteria: ''
                };
            };

            init();
            $scope.configuration = {host: {ip: '', port: '', displayName: ''}};
            $scope.xbmc = xbmc;

            $scope.go = function (path) {
                $location.path(path);
            };

            $scope.hasFooter = function () {
                return $scope.$state.current.views && $scope.$state.current.views.footer;
            }

            $scope.isConnected = function () {
                return xbmc.isConnected()
            }

            $scope.toggleDrawer = function () {
                var page = angular.element(document.querySelector('#page'));
                page.toggleClass('minimize');
            }

            $rootScope.$on("$stateChangeStart", function (event, next, current) {
                if ($scope.configuration.host.ip === '') {
                    $scope.go('/settings');
                }
            });

            var updateSeek = function () {
                $scope.$apply(function () {
                    $scope.player.seek.time++;
                    $scope.player.seek.percentage = $scope.player.seek.time / $scope.player.seek.totaltime * 100;
                });
            };

            var getItem = function (player) {
                $scope.player.id = player.playerid;
                $scope.player.active = true;
                $scope.player.item = xbmc.send('Player.GetItem', {
                    'properties': ['title', 'artist', 'albumartist', 'genre',
                        'year', 'rating', 'album', 'track', 'duration', 'comment', 'lyrics',
                        'musicbrainztrackid', 'musicbrainzartistid', 'musicbrainzalbumid',
                        'musicbrainzalbumartistid', 'playcount', 'fanart', 'director', 'trailer',
                        'tagline', 'plot', 'plotoutline', 'originaltitle', 'lastplayed', 'writer',
                        'studio', 'mpaa', 'cast', 'country', 'imdbnumber', 'premiered', 'productioncode',
                        'runtime', 'set', 'showlink', 'streamdetails', 'top250', 'votes', 'firstaired',
                        'season', 'episode', 'showtitle', 'thumbnail', 'file', 'resume', 'artistid',
                        'albumid', 'tvshowid', 'setid', 'watchedepisodes', 'disc', 'tag', 'art', 'genreid',
                        'displayartist', 'albumartistid', 'description', 'theme', 'mood', 'style',
                        'albumlabel', 'sorttitle', 'episodeguide', 'uniqueid', 'dateadded', 'channel',
                        'channeltype', 'hidden', 'locked', 'channelnumber', 'starttime', 'endtime'],
                    'playerid': $scope.player.id
                }, true, 'result.item').then(function (item) {
                        xbmc.send('Player.GetProperties', {
                            'properties': ['percentage', 'time', 'totaltime',
                                'speed', 'playlistid',
                                'currentsubtitle', 'subtitles',
                                'audiostreams', 'currentaudiostream', 'type'],
                            'playerid': $scope.player.id
                        }, true, 'result').then(function (properties) {
                                var timeFilter = $filter('time');
                                $scope.player.audiostreams = properties.audiostreams;
                                $scope.player.current = {
                                    audiostream: properties.currentaudiostream,
                                    subtitle: properties.currentsubtitle
                                };
                                $scope.player.seek = {
                                    time: timeFilter(properties.time),
                                    totaltime: timeFilter(properties.totaltime),
                                    percentage: properties.percentage
                                };
                                $scope.player.speed = properties.speed;
                                $scope.player.subtitles = properties.subtitles;
                                $scope.player.type = properties.type;

                                $scope.playlist = properties.playlistid;
                                if (properties.speed === 1) {
                                    window.clearInterval($scope.player.intervalId);
                                    $scope.player.intervalId = window.setInterval(updateSeek, 1000);
                                }
                            });
                        return item;
                    });
            };

            var onPlayerPause = function () {
                $scope.player.speed = 0;
                window.clearInterval($scope.player.intervalId);
            };

            var onPlayerPlay = function (obj) {
                var data = obj.params.data;
                getItem(data.player);
            };

            var onPlayerPropertyChanged = function (obj) {
                var data = obj.params.data;
                console.log(data);
            };

            var onPlayerStop = function (obj) {
                window.clearInterval($scope.player.intervalId);
                init();
                $scope.go('/');
            };

            var onPlayerSeek = function (obj) {
                var data = obj.params.data;
                var time = data.player.time;
                var timeFilter = $filter('time');
                var seek = $scope.player.seek;
                seek.time = timeFilter(time);
                seek.percentage = seek.time / seek.totaltime * 100;
            };

            var onPlayerSpeedChanged = function (obj) {
                var data = obj.params.data;
                console.log(data);

            };

            var onPlaylistClear = function () {
                $scope.playlist = -1;
            };

            xbmc.register('Player.OnPause', onPlayerPause.bind(this));
            xbmc.register('Player.OnPlay', onPlayerPlay.bind(this));
            xbmc.register('Player.OnPropertyChanged', onPlayerPropertyChanged.bind(this));
            xbmc.register('Player.OnStop', onPlayerStop.bind(this));
            xbmc.register('Player.OnSeek', onPlayerSeek.bind(this));
            xbmc.register('Playlist.OnClear', onPlaylistClear.bind(this));


            var xbmchost = localStorage.getItem('xbmchost');
            if (xbmchost !== null) {
                $scope.configuration = JSON.parse(xbmchost);
                $scope.xbmc.connect($scope.configuration.host.ip, $scope.configuration.host.port);
            } else {
                $scope.go('/settings');
            }
            var onLoad = function () {
                xbmc.send('Player.GetActivePlayers', null, true, 'result').then(function (players) {
                    if (players.length > 0) {
                        getItem(players[0]);
                    }
                });

            }.bind(this);
            if (xbmc.isConnected()) {
                onLoad();
            } else {
                xbmc.register('Websocket.OnConnected', onLoad);
            }

            var main = document.querySelector('div[role="main"]');
            var gestureDetector = new GestureDetector(main);
            gestureDetector.startDetecting();

            var onSwipe = function (event) {
                var direction = event.detail.direction || '';
                var page = angular.element(document.querySelector('#page'));
                if (direction.toLowerCase() === 'left' && page.hasClass('minimize')) {
                    page.removeClass('minimize');
                } else if (direction.toLowerCase() === 'right' && !page.hasClass('minimize')) {
                    page.addClass('minimize');
                }
            };

            main.addEventListener('swipe', onSwipe.bind(this));
        }]);
angular.module('app')
    .controller('FooterCtrl', ['$scope',
        function FooterCtrl($scope) {
            $scope.goTo = function (window, category) {
                var params = {'window': window};
                if (category) {
                    params.parameters = [category]
                }
                $scope.xbmc.send('GUI.ActivateWindow', params);
            };

            $scope.imdb = function (imdbnumber) {
                window.open('http://www.imdb.com/title/' + imdbnumber + '/', '_blank');
            };

            $scope.add = function (item) {
                if ($scope.playlist > -1) {
                    $scope.xbmc.send('Playlist.Add', {
                        'playlistid': $scope.playlist,
                        'item': item
                    });
                }
            }

            var setSpeed = function (speed) {
                $scope.player.speed = speed;
                $scope.xbmc.send('Player.SetSpeed', {
                    'playerid': $scope.player.id,
                    'speed': speed
                });
            }

            $scope.backward = function () {
                var newSpeed = $scope.player.speed;
                if ($scope.player.speed === 1) {
                    newSpeed = -2;
                } else if ($scope.player.speed > 0) {
                    newSpeed = newSpeed / 2;
                } else if ($scope.player.speed < 0) {
                    newSpeed = newSpeed * 2;
                }
                setSpeed(newSpeed >= -32 ? newSpeed : 1);
            };

            $scope.forward = function () {
                var newSpeed = $scope.player.speed;
                if ($scope.player.speed === -1) {
                    newSpeed = 1;
                } else if ($scope.player.speed > 0) {
                    newSpeed = newSpeed * 2;
                } else if ($scope.player.speed < 0) {
                    newSpeed = newSpeed / 2;
                }
                setSpeed(newSpeed <= 32 ? newSpeed : 1);
            };

            $scope.play = function (item) {
                $scope.xbmc.send('Player.Open', {
                    'item': item
                });
            };

            $scope.togglePlay = function () {
                if ($scope.player.speed === 0 || $scope.player.speed === 1) {
                    $scope.xbmc.send('Player.PlayPause', {
                        'playerid': $scope.player.id
                    });
                } else {
                    setSpeed(1);
                }
            };

            $scope.next = function () {
                $scope.xbmc.send('Player.GoTo', {
                    'playerid': $scope.player.id,
                    'to': 'next'
                });
            };

            $scope.previous = function () {
                $scope.xbmc.send('Player.GoTo', {
                    'playerid': $scope.player.id,
                    'to': 'previous'
                });
            };

            $scope.stop = function () {
                $scope.xbmc.send('Player.Stop', {
                    'playerid': $scope.player.id
                });
            };
        }
    ])
angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('moviedetails', {
            url: '/movie/:movieid',
            views: {
                header: {templateUrl: 'layout/headers/basic.tpl.html'},
                body: {
                    templateUrl: 'movie/details.tpl.html',
                    controller: 'MovieDetailsCtrl'
                },
                footer: {templateUrl: 'layout/footers/details.tpl.html', controller: 'FooterCtrl'}
            }
        });
    }])
    .controller('MovieDetailsCtrl', ['$scope', '$stateParams', '$location',
        function MovieDetailsCtrl($scope, $stateParams, $location, utilities) {
            $scope.movieid = parseInt($stateParams.movieid);
            $scope.loading = true;
            var onLoad = function () {
                $scope.library.item = $scope.xbmc.send('VideoLibrary.GetMovieDetails', {
                    'movieid': $scope.movieid,
                    'properties': ['title', 'genre', 'rating', 'thumbnail', 'plot',
                        'studio', 'director', 'fanart', 'runtime', 'trailer', 'imdbnumber']
                }, true, 'result.moviedetails').then(function (item) {
                        $scope.loading = false;
                        item.type = 'movie';
                        return item;
                    });

            }.bind(this);
            if ($scope.xbmc.isConnected()) {
                onLoad();
            } else {
                $scope.xbmc.register('Websocket.OnConnected', onLoad);
            }
        }
    ]);
angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('movies', {
            url: '/movies',
            views: {
                header: {templateUrl: 'layout/headers/searchable.tpl.html'},
                body: {templateUrl: 'movie/list.tpl.html', controller: 'MovieListCtrl'}
            }
        })
    }])
    .controller('MovieListCtrl', ['$scope',
        function MovieListCtrl($scope) {
            $scope.loading = true;
            var onLoad = function () {
                $scope.movies = $scope.xbmc.send('VideoLibrary.GetMovies', {
                    'limits': {
                        'start': 0,
                        'end': 75
                    },
                    'properties': ['title', 'genre', 'rating', 'thumbnail', 'runtime', 'playcount', 'streamdetails'],
                    'sort': {
                        'order': 'ascending',
                        'method': 'label',
                        'ignorearticle': true
                    }
                }, true, 'result.movies').then(function (movies) {
                        $scope.loading = false;
                        return movies;
                    });
            }.bind(this);
            if ($scope.xbmc.isConnected()) {
                onLoad();
            } else {
                $scope.xbmc.register('Websocket.OnConnected', onLoad);
            }
        }
    ]);
angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('filteredAlbums', {
            url: '/music/albums/:filter/:filterId',
            views: {
                header: {templateUrl: 'layout/headers/searchable.tpl.html'},
                body: {
                    templateUrl: 'music/albums.tpl.html', controller: 'MusicAlbumsCtrl'
                }
            }
        }).state('albums', {
                url: '/music/albums',
                views: {
                    header: {templateUrl: 'layout/headers/searchable.tpl.html'},
                    body: {
                        templateUrl: 'music/albums.tpl.html', controller: 'MusicAlbumsCtrl'
                    }
                }
            });
    }])
    .controller('MusicAlbumsCtrl', ['$scope', '$stateParams',
        function MusicAlbumsCtrl($scope, $stateParams) {
            $scope.loading = true;
            $scope.filter = $stateParams.filter;

            var params = {
                'limits': {
                    'start': 0,
                    'end': 100
                },
                'properties': ['title', 'artist', 'thumbnail', 'year', 'genre'],
                'sort': {
                    'order': 'ascending',
                    'method': 'label',
                    'ignorearticle': true
                }
            };

            if ($scope.filter) {
                $scope.filterId = parseInt($stateParams.filterId);
                params['filter'] = {};
                params['filter'][$scope.filter] = $scope.filterId;
            }
            var onLoad = function () {
                $scope.albums = $scope.xbmc.send('AudioLibrary.GetAlbums', params, true, 'result.albums').then(function (albums) {
                    $scope.loading = false;
                    return albums;
                });
            }.bind(this);
            if ($scope.xbmc.isConnected()) {
                onLoad();
            } else {
                $scope.xbmc.register('Websocket.OnConnected', onLoad);
            }

            $scope.hasCover = function (album) {
                return album.thumbnail !== '';
            }
        }
    ]);
angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('artists', {
            url: '/music/artists',
            views: {
                header: {templateUrl: 'layout/headers/searchable.tpl.html'},
                body: {
                    templateUrl: 'music/artists.tpl.html', controller: 'MusicArtistsCtrl'
                }
            }
        });
    }])
    .controller('MusicArtistsCtrl', ['$scope',
        function MusicAlbumsCtrl($scope, $stateParams) {
            var onLoad = function () {
                $scope.loading = true;
                $scope.artists = $scope.xbmc.send('AudioLibrary.GetArtists', {
                    'limits': {
                        'start': 0,
                        'end': 100
                    },
                    'properties': ['genre', 'thumbnail'],
                    'sort': {
                        'order': 'ascending',
                        'method': 'label',
                        'ignorearticle': true
                    }
                }, true, 'result.artists').then(function (artists) {
                        $scope.loading = false;
                        return artists;
                    });
            }.bind(this);
            if ($scope.xbmc.isConnected()) {
                onLoad();
            } else {
                $scope.xbmc.register('Websocket.OnConnected', onLoad);
            }

            $scope.hasCover = function (artist) {
                return artist.thumbnail !== '';
            }
        }
    ]);
angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('music', {
            url: '/musics',
            views: {
                header: {templateUrl: 'layout/headers/basic.tpl.html'},
                body: {
                    templateUrl: 'music/musics.tpl.html'
                }
            }
        })
    }])
angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('filteredSongs', {
            url: '/music/songs/:filter/:filterId',
            views: {
                header: {templateUrl: 'layout/headers/searchable.tpl.html'},
                body: {
                    templateUrl: 'music/songs.tpl.html', controller: 'MusicSongsCtrl'
                }
            }
        }).state('songs', {
                url: '/music/songs',
                views: {
                    header: {templateUrl: 'layout/headers/searchable.tpl.html'},
                    body: {
                        templateUrl: 'music/songs.tpl.html', controller: 'MusicSongsCtrl'
                    }
                }
            });
    }])
    .controller('MusicSongsCtrl', ['$scope', '$rootScope', '$stateParams', '$filter',
    function MusicSongsCtrl($scope, $rootScope, $stateParams, $filter) {
        $scope.loading = true;
        $scope.filter = $stateParams.filter;
        $scope.queue = [];
        var params = {
            'limits': {
                'start': 0,
                'end': 500
            },
            'properties': ['title', 'artist', 'album', 'albumid', 'thumbnail', 'duration', 'track', 'year'],
            'sort': {
                'order': 'ascending',
                'method': 'label',
                'ignorearticle': true
            }
        };
        if ($scope.filter) {
            $scope.filterId = parseInt($stateParams.filterId);
            params['filter'] = {};
            params['filter'][$scope.filter] = $scope.filterId;
            params.sort.method = 'track';
        }
        var onLoad = function () {
            $scope.xbmc.send('AudioLibrary.GetSongs', params, true, 'result.songs').then(function (songs) {
                $scope.loading = false;
                $scope.songs = songs;
            });

        }.bind(this);

        var playlistAdd = function () {
            if ($scope.queue.length > 0) {
                $scope.xbmc.send('Playlist.Add', {
                    'playlistid': $scope.playlist,
                    'item': {songid: $scope.queue[0].songid}
                });
                $scope.queue = $scope.queue.slice(1);
                if ($scope.queue.length > 0) {
                    window.setTimeout(playlistAdd.bind(this), 500);
                }
            }
        }

        $scope.$watch('playlist', function () {
            playlistAdd();
        }, true);

        if ($scope.xbmc.isConnected()) {
            onLoad();
        } else {
            $scope.xbmc.register('Websocket.OnConnected', onLoad);
        }

        $scope.getCover = function (song) {
            var assetFilter = $filter('asset');
            var hasCover = typeof $scope.filter !== 'undefined' && song && song.thumbnail !== '';
            if (hasCover) {
                return assetFilter(song.thumbnail, $scope.configuration.host.ip);
            } else {
                return 'img/backgrounds/album.png';
            }
        }

        $scope.isFiltered = function () {
            return typeof $scope.filter !== 'undefined';
        }

        $scope.play = function (item, index) {
            $scope.xbmc.send('Player.Open', {
                'item': item
            });
            if (index + 1 < $scope.songs.length) {
                $scope.queue = $scope.songs.slice(index + 1);
            }
        };
    }
])
angular.module('app')
    .controller('NavigationCtrl', ['$scope', '$location', '$filter',
        function ($scope, $location, $filter) {
            $scope.medias = [
                {
                    hash: '/movies',
                    icon: 'icon-film',
                    label: 'Movies'
                },
                {
                    hash: '/tvshows',
                    icon: 'icon-facetime-video',
                    label: 'TV Shows'
                },
                {
                    hash: '/musics',
                    icon: 'icon-music',
                    label: 'Musics'
                }
            ];
            $scope.controls = [
                {
                    hash: '/',
                    icon: 'icon-remote',
                    label: 'Remote'
                },
                {
                    hash: '/settings',
                    icon: 'icon-cogs',
                    label: 'Settings'
                }
            ];
            $scope.getThumb = function (art) {
                var asset = $filter('asset');
                if (art) {
                    if (art['album.thumb']) {
                        return  asset(art['album.thumb'], $scope.configuration.host.ip);
                    }
                    if (art['tvshow.poster']) {
                        return  asset(art['tvshow.poster'], $scope.configuration.host.ip);
                    }
                    if (art.poster) {
                        return  asset(art.poster, $scope.configuration.host.ip);
                    }
                    if (art.thumb) {
                        return asset(art.thumb, $scope.configuration.host.ip);
                    }

                }
                return 'img/blank.gif';
            };

            $scope.getLabel = function (item) {
                if (item) {
                    return  item.title !== '' ? item.title : item.label;
                }
                return '';
            }

            $scope.go = function (path) {
                $location.path(path);
                $scope.toggleDrawer();
            };

            $scope.isCurrent = function (hash) {
                return hash === $location.path() ? 'selected' : '';
            };
            $scope.togglePlay = function () {
                $scope.xbmc.send('Player.PlayPause', {
                    'playerid': $scope.player.id
                });
            };
            $scope.next = function () {
                $scope.xbmc.send('Player.GoTo', {
                    'playerid': $scope.player.id,
                    'to': 'next'
                });
            }
        }]);

angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('playing', {
            url: '/now/playing',
            views: {
                header: {templateUrl: 'layout/headers/basic.tpl.html'},
                body: {
                    templateUrl: 'now/playing.tpl.html',
                    controller: 'NowPlayingCtrl'
                },
                footer: {templateUrl: 'layout/footers/player.tpl.html', controller: 'FooterCtrl'}
            }
        });
    }])
    .controller('NowPlayingCtrl', ['$scope',
        function NowPlayingCtrl($scope) {
            $scope.loading = true;
            $scope.showAudioSelect = false;
            $scope.showSubtitleSelect = false;
            var onLoad = function () {
                $scope.xbmc.send('Player.GetActivePlayers', null, true, 'result').then(function (players) {
                        if (players.length > 0) {
                            $scope.library.item = $scope.xbmc.send('Player.GetItem', {
                                'properties': ['title', 'artist', 'albumartist', 'genre',
                                    'year', 'rating', 'album', 'track', 'duration', 'comment', 'lyrics',
                                    'musicbrainztrackid', 'musicbrainzartistid', 'musicbrainzalbumid',
                                    'musicbrainzalbumartistid', 'playcount', 'fanart', 'director', 'trailer',
                                    'tagline', 'plot', 'plotoutline', 'originaltitle', 'lastplayed', 'writer',
                                    'studio', 'mpaa', 'cast', 'country', 'imdbnumber', 'premiered', 'productioncode',
                                    'runtime', 'set', 'showlink', 'streamdetails', 'top250', 'votes', 'firstaired',
                                    'season', 'episode', 'showtitle', 'thumbnail', 'file', 'resume', 'artistid',
                                    'albumid', 'tvshowid', 'setid', 'watchedepisodes', 'disc', 'tag', 'art', 'genreid',
                                    'displayartist', 'albumartistid', 'description', 'theme', 'mood', 'style',
                                    'albumlabel', 'sorttitle', 'episodeguide', 'uniqueid', 'dateadded', 'channel',
                                    'channeltype', 'hidden', 'locked', 'channelnumber', 'starttime', 'endtime'],
                                'playerid': players[0].playerid
                            }, true, 'result.item').then(function (item) {
                                    $scope.loading = false;
                                    return item;
                                });

                        } else {
                            $scope.go('/');
                        }
                    }
                )
            }.bind(this);
            if ($scope.xbmc.isConnected()) {
                onLoad();
            } else {
                $scope.xbmc.register('Websocket.OnConnected', onLoad);
            }

            $scope.isTypeVideo = function () {
                return $scope.player.type === 'video' ||
                    $scope.player.type === 'movie' ||
                    $scope.player.type === 'episode';
            };

            $scope.isSelected = function (current, obj) {
                if (typeof obj === 'string') {
                    return obj === current;
                } else {
                    return obj.index === current.index;
                }
            };

            $scope.onSeekbarChanged = function (newValue) {
                $scope.xbmc.send('Player.Seek', {
                    'playerid': $scope.player.id,
                    'value': newValue});
            };

            $scope.select = function (type, obj) {
                var params = {
                    'playerid': $scope.player.id};
                var method = '';
                if (type === 'audio') {
                    method = 'Player.SetAudioStream';
                    params.stream = typeof obj === 'string' ? obj : obj.index;
                    $scope.showAudioSelect = false;
                    $scope.player.current.audiostream = obj;
                } else if (type === 'subtitle') {
                    method = 'Player.SetSubtitle';
                    params.subtitle = typeof obj === 'string' ? obj : obj.index;
                    params.enable = true;
                    $scope.showSubtitleSelect = false;
                    $scope.player.current.subtitle = obj;
                }
                $scope.xbmc.send(method, params);
            };

            $scope.toggleAudioStreams = function () {
                $scope.showAudioSelect = !$scope.showAudioSelect;
            };

            $scope.toggleSubtitles = function () {
                $scope.showSubtitleSelect = !$scope.showSubtitleSelect;
            };


            $scope.$watch('player.item', function () {
                $scope.library.item = $scope.player.item;
            }, true);

        }
    ])

angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('remote', {
            url: '/',
            views: {
                header: {templateUrl: 'layout/headers/basic.tpl.html'},
                body: {
                    templateUrl: 'remote/remote.tpl.html',
                    controller: 'RemoteCtrl'
                },
                footer: {templateUrl: 'layout/footers/basic.tpl.html', controller: 'FooterCtrl'}
            }
        });
    }])
    .controller('RemoteCtrl', ['$scope', '$location',
        function RemoteCtrl($scope, $location) {
            var onLoad = function () {
                $scope.volume = $scope.xbmc.send('Application.GetProperties', {
                    'properties': ['volume']
                }, true, 'result.volume');
            }.bind(this);
            if ($scope.xbmc.isConnected()) {
                onLoad();
            } else {
                $scope.xbmc.register('Websocket.OnConnected', onLoad);
            }

            $scope.setVolume = function (volume) {
                volume = Math.max(0, Math.min(volume, 100));
                $scope.xbmc.send('Application.SetVolume', {'volume': volume});
            }
        }]);
angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('settings', {
            url: '/settings',
            views: {
                header: {templateUrl: 'layout/headers/basic.tpl.html'},
                body: {templateUrl: 'settings/wizard.tpl.html', controller: 'WizardCtrl'}
            }
        });
    }])
    .controller('WizardCtrl', ['$scope',
        function WizardCtrl($scope) {
            $scope.save = function () {
                localStorage.setItem('xbmchost', JSON.stringify($scope.configuration));
                $scope.xbmc.connect($scope.configuration.host.ip, $scope.configuration.host.port);
                $scope.go('/');
            }
        }]);
angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('episode', {
            url: '/tvshow/:tvshowid/:season/:episodeid',
            views: {
                header: {templateUrl: 'layout/headers/basic.tpl.html'},
                body: {
                    templateUrl: 'tvshow/details.tpl.html',
                    controller: 'EpisodeDetailsCtrl'
                },
                footer: {templateUrl: 'layout/footers/details.tpl.html', controller: 'FooterCtrl'}
            }
        });
    }])
    .controller('EpisodeDetailsCtrl', ['$scope', '$stateParams', '$location',
        function EpisodeDetailsCtrl($scope, $stateParams, $location) {
            $scope.episodeid = parseInt($stateParams.episodeid);
            var onLoad = function () {
                $scope.loading = true;
                $scope.library.item = $scope.xbmc.send('VideoLibrary.GetEpisodeDetails', {
                    'episodeid': $scope.episodeid,
                    'properties': ['title', 'plot', 'rating', 'firstaired', 'runtime', 'thumbnail', 'art']
                }, true, 'result.episodedetails').then(function (item) {
                        $scope.loading = false;
                        item.type = 'episode';
                        return item;
                    });

            }.bind(this);
            if ($scope.xbmc.isConnected()) {
                onLoad();
            } else {
                $scope.xbmc.register('Websocket.OnConnected', onLoad);
            }

            $scope.play = function (episodeid) {
                $scope.xbmc.send('Player.Open', {
                    'item': {
                        'episodeid': episodeid
                    }
                });
            }
        }]);
angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('episodes', {
            url: '/tvshow/:tvshowid/:season',
            views: {
                header: {templateUrl: 'layout/headers/searchable.tpl.html'},
                body: {
                    templateUrl: 'tvshow/episodes.tpl.html',
                    controller: 'TvShowEpisodesCtrl'
                }
            }
        });
    }])
    .controller('TvShowEpisodesCtrl', ['$scope', '$stateParams', '$location',
        function TvShowEpisodesCtrl($scope, $stateParams, $location) {
            $scope.loading = true;
            $scope.tvshowid = parseInt($stateParams.tvshowid);
            $scope.season = parseInt($stateParams.season);
            var onLoad = function () {
                $scope.laoding = true;
                $scope.episodes = $scope.xbmc.send('VideoLibrary.GetEpisodes', {
                    'tvshowid': $scope.tvshowid,
                    'season': $scope.season,
                    'properties': ['title', 'rating', 'firstaired', 'runtime', 'season', 'episode', 'thumbnail', 'art'],
                    'limits': {
                        'start': 0,
                        'end': 75
                    },
                    'sort': {
                        'order': 'ascending',
                        'method': 'label'
                    }
                }, true, 'result.episodes').then(function (episodes) {
                        $scope.loading = false;
                        return episodes;
                    });
            }.bind(this);
            if ($scope.xbmc.isConnected()) {
                onLoad();
            } else {
                $scope.xbmc.register('Websocket.OnConnected', onLoad);
            }
        }]);
angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('tvshows', {
            url: '/tvshows',
            views: {
                header: {templateUrl: 'layout/headers/searchable.tpl.html'},
                body: {templateUrl: 'tvshow/list.tpl.html',
                    controller: 'TvShowListCtrl'}
            }
        });
    }])
    .controller('TvShowListCtrl', ['$scope',
        function TvShowListCtrl($scope) {
            var onLoad = function () {
                $scope.loading = true;
                $scope.tvshows = $scope.xbmc.send('VideoLibrary.GetTVShows', {
                    'limits': {
                        'start': 0,
                        'end': 75
                    },
                    'properties': ['genre', 'title', 'rating', 'art', 'playcount'],
                    'sort': {
                        'order': 'ascending',
                        'method': 'label'
                    }
                }, true, 'result.tvshows').then(function (tvshows) {
                        $scope.loading = false;
                        return tvshows;
                    });
            }.bind(this);
            if ($scope.xbmc.isConnected()) {
                onLoad();
            } else {
                $scope.xbmc.register('Websocket.OnConnected', onLoad);
            }
        }]);
angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('seasons', {
            url: '/tvshow/:tvshowid',
            views: {
                header: {templateUrl: 'layout/headers/searchable.tpl.html'},
                body: {
                    templateUrl: 'tvshow/seasons.tpl.html',
                    controller: 'TvShowSeasonsCtrl'
                }
            }
        });
    }])
    .controller('TvShowSeasonsCtrl', ['$scope', '$stateParams', '$location',
    function TvShowSeasonsCtrl($scope, $stateParams, $location) {
        $scope.loading = true;
        $scope.tvshowid = parseInt($stateParams.tvshowid);
        var onLoad = function () {
            $scope.xbmc.send('VideoLibrary.GetSeasons', {
                'tvshowid': $scope.tvshowid,
                'properties': ['season', 'showtitle', 'fanart', 'thumbnail'],
                'limits': {
                    'start': 0,
                    'end': 75
                },
                'sort': {
                    'order': 'ascending',
                    'method': 'label'
                }
            }, true, 'result.seasons').then(function (seasons) {
                    $scope.seasons = seasons || [];
                    $scope.loading = false;
                    if (seasons.length === 1) {
                        $scope.go('/tvshow/' + $scope.tvshowid + '/' + seasons[0].season);
                    }
                });
        }.bind(this);
        if ($scope.xbmc.isConnected()) {
            onLoad();
        } else {
            $scope.xbmc.register('Websocket.OnConnected', onLoad);
        }
    }])
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



/**
 * GestureDetector.js: generate events for one and two finger gestures.
 *
 * A GestureDetector object listens for touch and mouse events on a specified
 * element and generates higher-level events that describe one and two finger
 * gestures on the element. The hope is that this will be useful for webapps
 * that need to run on mouse (or trackpad)-based desktop browsers and also in
 * touch-based mobile devices.
 *
 * Supported events:
 *
 *  tap        like a click event
 *  dbltap     like dblclick
 *  pan        one finger motion, or mousedown followed by mousemove
 *  swipe      when a finger is released following pan events
 *  holdstart  touch (or mousedown) and hold. Must set an option to get these.
 *  holdmove   motion after a holdstart event
 *  holdend    when the finger or mouse goes up after holdstart/holdmove
 *  transform  2-finger pinch and twist gestures for scaling and rotation
 *             These are touch-only; they can't be simulated with a mouse.
 *
 * Each of these events is a bubbling CustomEvent with important details in the
 * event.detail field. The event details are not yet stable and are not yet
 * documented. See the calls to emitEvent() for details.
 *
 * To use this library, create a GestureDetector object by passing an element to
 * the GestureDetector() constructor and then calling startDetecting() on it.
 * The element will be the target of all the emitted gesture events. You can
 * also pass an optional object as the second constructor argument. If you're
 * interested in holdstart/holdmove/holdend events, pass {holdEvents:true} as
 * this second argument. Otherwise they will not be generated.
 *
 * Implementation note: event processing is done with a simple finite-state
 * machine. This means that in general, the various kinds of gestures are
 * mutually exclusive. You won't get pan events until your finger or mouse has
 * moved more than a minimum threshold, for example, but it does, the FSM enters
 * a new state in which it can emit pan and swipe events and cannot emit hold
 * events. Similarly, if you've started a 1 finger pan/swipe gesture and
 * accidentally touch with a second finger, you'll continue to get pan events,
 * and won't suddenly start getting 2-finger transform events.
 *
 * This library never calls preventDefault() or stopPropagation on any of the
 * events it processes, so the raw touch or mouse events should still be
 * available for other code to process. It is not clear to me whether this is a
 * feature or a bug.
 */

var GestureDetector = (function() {

  //
  // Constructor
  //
  function GD(e, options) {
    this.element = e;
    this.options = options || {};
    this.state = initialState;
    this.timers = {};
    this.listeningForMouseEvents = true;
  }

  //
  // Public methods
  //

  GD.prototype.startDetecting = function() {
    var self = this;
    eventtypes.forEach(function(t) {
      self.element.addEventListener(t, self);
    });
  };

  GD.prototype.stopDetecting = function() {
    var self = this;
    eventtypes.forEach(function(t) {
      self.element.removeEventListener(t, self);
    });
  };

  //
  // Internal methods
  //

  GD.prototype.handleEvent = function(e) {
    var handler = this.state[e.type];
    if (!handler) return;

    // If this is a touch event handle each changed touch separately
    if (e.changedTouches) {
      // If we ever receive a touch event, then we know we are on a
      // touch device and we stop listening for mouse events. If we
      // don't do that, then the touchstart touchend mousedown mouseup
      // generated by a single tap gesture will cause us to output
      // tap tap dbltap, which is wrong
      if (this.listeningForMouseEvents) {
        this.listeningForMouseEvents = false;
        this.element.removeEventListener('mousedown', this);
      }

      // XXX https://bugzilla.mozilla.org/show_bug.cgi?id=785554
      // causes touchend events to list all touches as changed, so
      // warn if we see that bug
      if (e.type === 'touchend' && e.changedTouches.length > 1) {
        console.warn('gesture_detector.js: spurious extra changed touch on ' +
                     'touchend. See ' +
                     'https://bugzilla.mozilla.org/show_bug.cgi?id=785554');
      }

      for (var i = 0; i < e.changedTouches.length; i++) {
        handler(this, e, e.changedTouches[i]);
        // The first changed touch might have changed the state of the
        // FSM. We need this line to workaround the bug 785554, but it is
        // probably the right thing to have here, even once that bug is fixed.
        handler = this.state[e.type];
      }
    }
    else {    // Otherwise, just dispatch the event to the handler
      handler(this, e);
    }
  };

  GD.prototype.startTimer = function(type, time) {
    this.clearTimer(type);
    var self = this;
    this.timers[type] = setTimeout(function() {
      self.timers[type] = null;
      var handler = self.state[type];
      if (handler)
        handler(self, type);
    }, time);
  };

  GD.prototype.clearTimer = function(type) {
    if (this.timers[type]) {
      clearTimeout(this.timers[type]);
      this.timers[type] = null;
    }
  };

  // Switch to a new FSM state, and call the init() function of that
  // state, if it has one.  The event and touch arguments are optional
  // and are just passed through to the state init function.
  GD.prototype.switchTo = function(state, event, touch) {
    this.state = state;
    if (state.init)
      state.init(this, event, touch);
  };

  GD.prototype.emitEvent = function(type, detail) {
    if (!this.target) {
      console.error('Attempt to emit event with no target');
      return;
    }

    var event = this.element.ownerDocument.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, detail);
    this.target.dispatchEvent(event);
  };

  //
  // Tuneable parameters
  //
  GD.HOLD_INTERVAL = 1000;     // Hold events after 1000 ms
  GD.PAN_THRESHOLD = 20;       // 20 pixels movement before touch panning
  GD.MOUSE_PAN_THRESHOLD = 15; // Mice are more precise, so smaller threshold
  GD.DOUBLE_TAP_DISTANCE = 50;
  GD.DOUBLE_TAP_TIME = 500;
  GD.VELOCITY_SMOOTHING = .5;

  // Don't start sending transform events until the gesture exceeds a threshold
  GD.SCALE_THRESHOLD = 20;     // pixels
  GD.ROTATE_THRESHOLD = 22.5;  // degrees

  // For pans and zooms, we compute new starting coordinates that are part way
  // between the initial event and the event that crossed the threshold so that
  // the first event we send doesn't cause a big lurch. This constant must be
  // between 0 and 1 and says how far along the line between the initial value
  // and the new value we pick
  GD.THRESHOLD_SMOOTHING = 0.9;

  //
  // Helpful shortcuts and utility functions
  //

  var abs = Math.abs, floor = Math.floor, sqrt = Math.sqrt, atan2 = Math.atan2;
  var PI = Math.PI;

  // The names of events that we need to register handlers for
  var eventtypes = [
    'touchstart',
    'touchmove',
    'touchend',
    'mousedown'  // We register mousemove and mouseup manually
  ];

  // Return the event's timestamp in ms
  function eventTime(e) {
    // In gecko, synthetic events seem to be in microseconds rather than ms.
    // So if the timestamp is much larger than the current time, assue it is
    // in microseconds and divide by 1000
    var ts = e.timeStamp;
    if (ts > 2 * Date.now())
      return Math.floor(ts / 1000);
    else
      return ts;
  }


  // Return an object containg the space and time coordinates of
  // and event and touch. We freeze the object to make it immutable so
  // we can pass it in events and not worry about values being changed.
  function coordinates(e, t) {
    return Object.freeze({
      screenX: t.screenX,
      screenY: t.screenY,
      clientX: t.clientX,
      clientY: t.clientY,
      timeStamp: eventTime(e)
    });
  }

  // Like coordinates(), but return the midpoint between two touches
  function midpoints(e, t1, t2) {
    return Object.freeze({
      screenX: floor((t1.screenX + t2.screenX) / 2),
      screenY: floor((t1.screenY + t2.screenY) / 2),
      clientX: floor((t1.clientX + t2.clientX) / 2),
      clientY: floor((t1.clientY + t2.clientY) / 2),
      timeStamp: eventTime(e)
    });
  }

  // Like coordinates(), but for a mouse event
  function mouseCoordinates(e) {
    return Object.freeze({
      screenX: e.screenX,
      screenY: e.screenY,
      clientX: e.clientX,
      clientY: e.clientY,
      timeStamp: eventTime(e)
    });
  }

  // Given coordinates objects c1 and c2, return a new coordinates object
  // representing a point and time along the line between those points.
  // The position of the point is controlled by the THRESHOLD_SMOOTHING constant
  function between(c1, c2) {
    var r = GD.THRESHOLD_SMOOTHING;
    return Object.freeze({
      screenX: floor(c1.screenX + r * (c2.screenX - c1.screenX)),
      screenY: floor(c1.screenY + r * (c2.screenY - c1.screenY)),
      clientX: floor(c1.clientX + r * (c2.clientX - c1.clientX)),
      clientY: floor(c1.clientY + r * (c2.clientY - c1.clientY)),
      timeStamp: floor(c1.timeStamp + r * (c2.timeStamp - c1.timeStamp))
    });
  }

  // Compute the distance between two touches
  function touchDistance(t1, t2) {
    var dx = t2.screenX - t1.screenX;
    var dy = t2.screenY - t1.screenY;
    return sqrt(dx * dx + dy * dy);
  }

  // Compute the direction (as an angle) of the line between two touches
  // Returns a number d, -180 < d <= 180
  function touchDirection(t1, t2) {
    return atan2(t2.screenY - t1.screenY,
                 t2.screenX - t1.screenX) * 180 / PI;
  }

  // Compute the clockwise angle between direction d1 and direction d2.
  // Returns an angle a -180 < a <= 180.
  function touchRotation(d1, d2) {
    var angle = d2 - d1;
    if (angle > 180)
      angle -= 360;
    else if (angle <= -180)
      angle += 360;
    return angle;
  }

  // Determine if two taps are close enough in time and space to
  // trigger a dbltap event. The arguments are objects returned
  // by the coordinates() function.
  function isDoubleTap(lastTap, thisTap) {
    var dx = abs(thisTap.screenX - lastTap.screenX);
    var dy = abs(thisTap.screenY - lastTap.screenY);
    var dt = thisTap.timeStamp - lastTap.timeStamp;
    return (dx < GD.DOUBLE_TAP_DISTANCE &&
            dy < GD.DOUBLE_TAP_DISTANCE &&
            dt < GD.DOUBLE_TAP_TIME);
  }

  //
  // The following objects are the states of our Finite State Machine
  //

  // In this state we're not processing any gestures, just waiting
  // for an event to start a gesture and ignoring others
  var initialState = {
    name: 'initialState',
    init: function(d) {
      // When we enter or return to the initial state, clear
      // the detector properties that were tracking gestures
      // Don't clear d.lastTap here, though. We need it for dbltap events
      d.target = null;
      d.start = d.last = null;
      d.touch1 = d.touch2 = null;
      d.vx = d.vy = null;
      d.startDistance = d.lastDistance = null;
      d.startDirection = d.lastDirection = null;
      d.lastMidpoint = null;
      d.scaled = d.rotated = null;
    },

    // Switch to the touchstarted state and process the touch event there
    // Once we've started processing a touch gesture we'll ignore mouse events
    touchstart: function(d, e, t) {
      d.switchTo(touchStartedState, e, t);
    },

    // Or if we see a mouse event first, then start processing a mouse-based
    // gesture, and ignore any touch events
    mousedown: function(d, e) {
      d.switchTo(mouseDownState, e);
    }
  };

  // One finger is down but we haven't generated any event yet. We're
  // waiting to see...  If the finger goes up soon, its a tap. If the finger
  // stays down and still, its a hold. If the finger moves its a pan/swipe.
  // And if a second finger goes down, its a transform
  var touchStartedState = {
    name: 'touchStartedState',
    init: function(d, e, t) {
      // Remember the target of the event
      d.target = e.target;
      // Remember the id of the touch that started
      d.touch1 = t.identifier;
      // Get the coordinates of the touch
      d.start = d.last = coordinates(e, t);
      // Start a timer for a hold
      // If we're doing hold events, start a timer for them
      if (d.options.holdEvents)
        d.startTimer('holdtimeout', GD.HOLD_INTERVAL);
    },

    touchstart: function(d, e, t) {
      // If another finger goes down in this state, then
      // go to transform state to start 2-finger gestures.
      d.clearTimer('holdtimeout');
      d.switchTo(transformState, e, t);
    },
    touchmove: function(d, e, t) {
      // Ignore any touches but the initial one
      // This could happen if there was still a finger down after
      // the end of a previous 2-finger gesture, e.g.
      if (t.identifier !== d.touch1)
        return;

      if (abs(t.screenX - d.start.screenX) > GD.PAN_THRESHOLD ||
          abs(t.screenY - d.start.screenY) > GD.PAN_THRESHOLD) {
        d.clearTimer('holdtimeout');
        d.switchTo(panStartedState, e, t);
      }
    },
    touchend: function(d, e, t) {
      // Ignore any touches but the initial one
      if (t.identifier !== d.touch1)
        return;

      // If there was a previous tap that was close enough in time
      // and space, then emit a 'dbltap' event
      if (d.lastTap && isDoubleTap(d.lastTap, d.start)) {
        d.emitEvent('tap', d.start);
        d.emitEvent('dbltap', d.start);
        // clear the lastTap property, so we don't get another one
        d.lastTap = null;
      }
      else {
        // Emit a 'tap' event using the starting coordinates
        // as the event details
        d.emitEvent('tap', d.start);

        // Remember the coordinates of this tap so we can detect double taps
        d.lastTap = coordinates(e, t);
      }

      // In either case clear the timer and go back to the initial state
      d.clearTimer('holdtimeout');
      d.switchTo(initialState);
    },

    holdtimeout: function(d) {
      d.switchTo(holdState);
    }

  };

  // A single touch has moved enough to exceed the pan threshold and now
  // we're going to generate pan events after each move and a swipe event
  // when the touch ends. We ignore any other touches that occur while this
  // pan/swipe gesture is in progress.
  var panStartedState = {
    name: 'panStartedState',
    init: function(d, e, t) {
      // Panning doesn't start until the touch has moved more than a
      // certain threshold. But we don't want the pan to have a jerky
      // start where the first event is a big distance. So proceed as
      // pan actually started at a point along the path between the
      // first touch and this current touch.
      d.start = d.last = between(d.start, coordinates(e, t));

      // If we transition into this state with a touchmove event,
      // then process it with that handler. If we don't do this then
      // we can end up with swipe events that don't know their velocity
      if (e.type === 'touchmove')
        panStartedState.touchmove(d, e, t);
    },

    touchmove: function(d, e, t) {
      // Ignore any fingers other than the one we're tracking
      if (t.identifier !== d.touch1)
        return;

      // Each time the touch moves, emit a pan event but stay in this state
      var current = coordinates(e, t);
      d.emitEvent('pan', {
        absolute: {
          dx: current.screenX - d.start.screenX,
          dy: current.screenY - d.start.screenY
        },
        relative: {
          dx: current.screenX - d.last.screenX,
          dy: current.screenY - d.last.screenY
        },
        position: current
      });

      // Track the pan velocity so we can report this with the swipe
      // Use a exponential moving average for a bit of smoothing
      // on the velocity
      var dt = current.timeStamp - d.last.timeStamp;
      var vx = (current.screenX - d.last.screenX) / dt;
      var vy = (current.screenY - d.last.screenY) / dt;

      if (d.vx == null) { // first time; no average
        d.vx = vx;
        d.vy = vy;
      }
      else {
        d.vx = d.vx * GD.VELOCITY_SMOOTHING +
          vx * (1 - GD.VELOCITY_SMOOTHING);
        d.vy = d.vy * GD.VELOCITY_SMOOTHING +
          vy * (1 - GD.VELOCITY_SMOOTHING);
      }

      d.last = current;
    },
    touchend: function(d, e, t) {
      // Ignore any fingers other than the one we're tracking
      if (t.identifier !== d.touch1)
        return;

      // Emit a swipe event when the finger goes up.
      // Report start and end point, dx, dy, dt, velocity and direction
      var current = coordinates(e, t);
      var dx = current.screenX - d.start.screenX;
      var dy = current.screenY - d.start.screenY;
      // angle is a positive number of degrees, starting at 0 on the
      // positive x axis and increasing clockwise.
      var angle = atan2(dy, dx) * 180 / PI;
      if (angle < 0)
        angle += 360;

      // Direction is 'right', 'down', 'left' or 'up'
      var direction;
      if (angle >= 315 || angle < 45)
        direction = 'right';
      else if (angle >= 45 && angle < 135)
        direction = 'down';
      else if (angle >= 135 && angle < 225)
        direction = 'left';
      else if (angle >= 225 && angle < 315)
        direction = 'up';

      d.emitEvent('swipe', {
        start: d.start,
        end: current,
        dx: dx,
        dy: dy,
        dt: e.timeStamp - d.start.timeStamp,
        vx: d.vx,
        vy: d.vy,
        direction: direction,
        angle: angle
      });

      // Go back to the initial state
      d.switchTo(initialState);
    }
  };

  // We enter this state if the user touches and holds for long enough
  // without moving much.  When we enter we emit a holdstart event. Motion
  // after the holdstart generates holdmove events. And when the touch ends
  // we generate a holdend event. holdmove and holdend events can be used
  // kind of like drag and drop events in a mouse-based UI. Currently,
  // these events just report the coordinates of the touch.  Do we need
  // other details?
  var holdState = {
    name: 'holdState',
    init: function(d) {
      d.emitEvent('holdstart', d.start);
    },

    touchmove: function(d, e, t) {
      var current = coordinates(e, t);
      d.emitEvent('holdmove', {
        absolute: {
          dx: current.screenX - d.start.screenX,
          dy: current.screenY - d.start.screenY
        },
        relative: {
          dx: current.screenX - d.last.screenX,
          dy: current.screenY - d.last.screenY
        },
        position: current
      });

      d.last = current;
    },

    touchend: function(d, e, t) {
      var current = coordinates(e, t);
      d.emitEvent('holdend', {
        start: d.start,
        end: current,
        dx: current.screenX - d.start.screenX,
        dy: current.screenY - d.start.screenY
      });
      d.switchTo(initialState);
    }
  };

  // We enter this state if a second touch starts before we start
  // recoginzing any other gesture.  As the touches move we track the
  // distance and angle between them to report scale and rotation values
  // in transform events.
  var transformState = {
    name: 'transformState',
    init: function(d, e, t) {
      // Remember the id of the second touch
      d.touch2 = t.identifier;

      // Get the two Touch objects
      var t1 = e.touches.identifiedTouch(d.touch1);
      var t2 = e.touches.identifiedTouch(d.touch2);

      // Compute and remember the initial distance and angle
      d.startDistance = d.lastDistance = touchDistance(t1, t2);
      d.startDirection = d.lastDirection = touchDirection(t1, t2);

      // Don't start emitting events until we're past a threshold
      d.scaled = d.rotated = false;
    },

    touchmove: function(d, e, t) {
      // Ignore touches we're not tracking
      if (t.identifier !== d.touch1 && t.identifier !== d.touch2)
        return;

      // Get the two Touch objects
      var t1 = e.touches.identifiedTouch(d.touch1);
      var t2 = e.touches.identifiedTouch(d.touch2);

      // Compute the new midpoints, distance and direction
      var midpoint = midpoints(e, t1, t2);
      var distance = touchDistance(t1, t2);
      var direction = touchDirection(t1, t2);
      var rotation = touchRotation(d.startDirection, direction);

      // Check all of these numbers against the thresholds. Otherwise
      // the transforms are too jittery even when you try to hold your
      // fingers still.
      if (!d.scaled) {
        if (abs(distance - d.startDistance) > GD.SCALE_THRESHOLD) {
          d.scaled = true;
          d.startDistance = d.lastDistance =
            floor(d.startDistance +
                  GD.THRESHOLD_SMOOTHING * (distance - d.startDistance));
        }
        else
          distance = d.startDistance;
      }
      if (!d.rotated) {
        if (abs(rotation) > GD.ROTATE_THRESHOLD)
          d.rotated = true;
        else
          direction = d.startDirection;
      }

      // If nothing has exceeded the threshold yet, then we
      // don't even have to fire an event.
      if (d.scaled || d.rotated) {
        // The detail field for the transform gesture event includes
        // 'absolute' transformations against the initial values and
        // 'relative' transformations against the values from the last
        // transformgesture event.
        d.emitEvent('transform', {
          absolute: { // transform details since gesture start
            scale: distance / d.startDistance,
            rotate: touchRotation(d.startDirection, direction)
          },
          relative: { // transform since last gesture change
            scale: distance / d.lastDistance,
            rotate: touchRotation(d.lastDirection, direction)
          },
          midpoint: midpoint
        });

        d.lastDistance = distance;
        d.lastDirection = direction;
        d.lastMidpoint = midpoint;
      }
    },

    touchend: function(d, e, t) {
      // If either finger goes up, we're done with the gesture.
      // The user might move that finger and put it right back down
      // again to begin another 2-finger gesture, so we can't go
      // back to the initial state while one of the fingers remains up.
      // On the other hand, we can't go back to touchStartedState because
      // that would mean that the finger left down could cause a tap or
      // pan event. So we need an afterTransform state that waits for
      // a finger to come back down or the other finger to go up.
      if (t.identifier === d.touch2)
        d.touch2 = null;
      else if (t.identifier === d.touch1) {
        d.touch1 = d.touch2;
        d.touch2 = null;
      }
      else
        return; // It was a touch we weren't tracking

      // If we emitted any transform events, now we need to emit
      // a transformend event to end the series.  The details of this
      // event use the values from the last touchmove, and the
      // relative amounts will 1 and 0, but they are included for
      // completeness even though they are not useful.
      if (d.scaled || d.rotated) {
        d.emitEvent('transformend', {
          absolute: { // transform details since gesture start
            scale: d.lastDistance / d.startDistance,
            rotate: touchRotation(d.startDirection, d.lastDirection)
          },
          relative: { // nothing has changed relative to the last touchmove
            scale: 1,
            rotate: 0
          },
          midpoint: d.lastMidpoint
        });
      }

      d.switchTo(afterTransformState);
    }
  };

  // We did a tranform and one finger went up. Wait for that finger to
  // come back down or the other finger to go up too.
  var afterTransformState = {
    name: 'afterTransformState',
    touchstart: function(d, e, t) {
      d.switchTo(transformState, e, t);
    },

    touchend: function(d, e, t) {
      if (t.identifier === d.touch1)
        d.switchTo(initialState);
    }
  };

  var mouseDownState = {
    name: 'mouseDownState',
    init: function(d, e) {
      // Remember the target of the event
      d.target = e.target;

      // Register this detector as a *capturing* handler on the document
      // so we get all subsequent mouse events until we remove these handlers
      var doc = d.element.ownerDocument;
      doc.addEventListener('mousemove', d, true);
      doc.addEventListener('mouseup', d, true);

      // Get the coordinates of the mouse event
      d.start = d.last = mouseCoordinates(e);

      // Start a timer for a hold
      // If we're doing hold events, start a timer for them
      if (d.options.holdEvents)
        d.startTimer('holdtimeout', GD.HOLD_INTERVAL);
    },

    mousemove: function(d, e) {
      // If the mouse has moved more than the panning threshold,
      // then switch to the mouse panning state. Otherwise remain
      // in this state

      if (abs(e.screenX - d.start.screenX) > GD.MOUSE_PAN_THRESHOLD ||
          abs(e.screenY - d.start.screenY) > GD.MOUSE_PAN_THRESHOLD) {
        d.clearTimer('holdtimeout');
        d.switchTo(mousePannedState, e);
      }
    },

    mouseup: function(d, e) {
      // Remove the capturing event handlers
      var doc = d.element.ownerDocument;
      doc.removeEventListener('mousemove', d, true);
      doc.removeEventListener('mouseup', d, true);

      // If there was a previous tap that was close enough in time
      // and space, then emit a 'dbltap' event
      if (d.lastTap && isDoubleTap(d.lastTap, d.start)) {
        d.emitEvent('tap', d.start);
        d.emitEvent('dbltap', d.start);
        d.lastTap = null; // so we don't get another one
      }
      else {
        // Emit a 'tap' event using the starting coordinates
        // as the event details
        d.emitEvent('tap', d.start);

        // Remember the coordinates of this tap so we can detect double taps
        d.lastTap = mouseCoordinates(e);
      }

      // In either case clear the timer and go back to the initial state
      d.clearTimer('holdtimeout');
      d.switchTo(initialState);
    },

    holdtimeout: function(d) {
      d.switchTo(mouseHoldState);
    }
  };

  // Like holdState, but for mouse events instead of touch events
  var mouseHoldState = {
    name: 'mouseHoldState',
    init: function(d) {
      d.emitEvent('holdstart', d.start);
    },

    mousemove: function(d, e) {
      var current = mouseCoordinates(e);
      d.emitEvent('holdmove', {
        absolute: {
          dx: current.screenX - d.start.screenX,
          dy: current.screenY - d.start.screenY
        },
        relative: {
          dx: current.screenX - d.last.screenX,
          dy: current.screenY - d.last.screenY
        },
        position: current
      });

      d.last = current;
    },

    mouseup: function(d, e) {
      var current = mouseCoordinates(e);
      d.emitEvent('holdend', {
        start: d.start,
        end: current,
        dx: current.screenX - d.start.screenX,
        dy: current.screenY - d.start.screenY
      });
      d.switchTo(initialState);
    }
  };

  var mousePannedState = {
    name: 'mousePannedState',
    init: function(d, e) {
      // Panning doesn't start until the mouse has moved more than
      // a certain threshold. But we don't want the pan to have a jerky
      // start where the first event is a big distance. So reset the
      // starting point to a point between the start point and this
      // current point
      d.start = d.last = between(d.start, mouseCoordinates(e));

      // If we transition into this state with a mousemove event,
      // then process it with that handler. If we don't do this then
      // we can end up with swipe events that don't know their velocity
      if (e.type === 'mousemove')
        mousePannedState.mousemove(d, e);
    },
    mousemove: function(d, e) {
      // Each time the mouse moves, emit a pan event but stay in this state
      var current = mouseCoordinates(e);
      d.emitEvent('pan', {
        absolute: {
          dx: current.screenX - d.start.screenX,
          dy: current.screenY - d.start.screenY
        },
        relative: {
          dx: current.screenX - d.last.screenX,
          dy: current.screenY - d.last.screenY
        },
        position: current
      });

      // Track the pan velocity so we can report this with the swipe
      // Use a exponential moving average for a bit of smoothing
      // on the velocity
      var dt = current.timeStamp - d.last.timeStamp;
      var vx = (current.screenX - d.last.screenX) / dt;
      var vy = (current.screenY - d.last.screenY) / dt;

      if (d.vx == null) { // first time; no average
        d.vx = vx;
        d.vy = vy;
      }
      else {
        d.vx = d.vx * GD.VELOCITY_SMOOTHING +
          vx * (1 - GD.VELOCITY_SMOOTHING);
        d.vy = d.vy * GD.VELOCITY_SMOOTHING +
          vy * (1 - GD.VELOCITY_SMOOTHING);
      }

      d.last = current;
    },
    mouseup: function(d, e) {
      // Remove the capturing event handlers
      var doc = d.element.ownerDocument;
      doc.removeEventListener('mousemove', d, true);
      doc.removeEventListener('mouseup', d, true);

      // Emit a swipe event when the mouse goes up.
      // Report start and end point, dx, dy, dt, velocity and direction
      var current = mouseCoordinates(e);

      // FIXME:
      // lots of code duplicated between this state and the corresponding
      // touch state, can I combine them somehow?
      var dx = current.screenX - d.start.screenX;
      var dy = current.screenY - d.start.screenY;
      // angle is a positive number of degrees, starting at 0 on the
      // positive x axis and increasing clockwise.
      var angle = atan2(dy, dx) * 180 / PI;
      if (angle < 0)
        angle += 360;

      // Direction is 'right', 'down', 'left' or 'up'
      var direction;
      if (angle >= 315 || angle < 45)
        direction = 'right';
      else if (angle >= 45 && angle < 135)
        direction = 'down';
      else if (angle >= 135 && angle < 225)
        direction = 'left';
      else if (angle >= 225 && angle < 315)
        direction = 'up';

      d.emitEvent('swipe', {
        start: d.start,
        end: current,
        dx: dx,
        dy: dy,
        dt: current.timeStamp - d.start.timeStamp,
        vx: d.vx,
        vy: d.vy,
        direction: direction,
        angle: angle
      });

      // Go back to the initial state
      d.switchTo(initialState);
    }
  };

  return GD;
}());


"use strict";
angular.module('directives.rating', [])
    .directive('rating', function () {
        return {
            restrict: 'A',
            template: '<div class="rating">' +
                '<i ng-repeat="star in stars" ng-class="star"></i>' +
                '</div>',
            scope: {
                ratingValue: '=',
                ratingMax: '='
            },
            link: function (scope, elem, attrs) {
                var updateStars = function () {
                    scope.stars = [];
                    for (var i = 1; i <= scope.ratingMax; i++) {
                        if (i < scope.ratingValue) {
                            scope.stars.push({'icon-star': true});
                        } else if (Math.round(scope.ratingValue) === i) {
                            scope.stars.push({'icon-star-half-empty': true});
                        } else {
                            scope.stars.push({'icon-star-empty': true});
                        }
                    }
                };

                scope.$watch('ratingValue', function (newVal, oldVal) {
                    if (newVal) {
                        updateStars();
                    }
                });
            }
        }
    });
"use strict";
angular.module('directives.seekbar', [])
    .directive('seekbar', function () {
        return {
            restrict: 'A',
            template: '<progress max="{{seekbarMax}}"></progress>' +
                '<button></button>',
            scope: {
                seekbarValue: '=',
                seekbarMax: '=',
                onSeekbarChanged: '&'
            },
            link: function (scope, elem, attrs) {
                var thumb = elem.find('button');
                var progress = elem.find('progress');
                var moving = false;
                var newValue = -1;

                var offset = function (el) {
                    var offsetLeft = el.prop('offsetLeft');
                    var offsetTop = el.prop('offsetTop');
                    var tmp = el;
                    var position;
                    var hasParent = true;
                    while (hasParent) {
                        tmp = tmp.parent();
                        if (tmp[0].nodeName.toLowerCase() === 'body') {
                            hasParent = false;
                        } else {
                            position = getComputedStyle(tmp[0]).position;
                            if (position === 'relative' || position === 'absolute' || position === 'fixed') {
                                offsetLeft += tmp.prop('offsetLeft');
                                offsetTop += tmp.prop('offsetTop');
                            }
                        }
                    }
                    return {left: offsetLeft, top: offsetTop};
                }

                var offsetLeft = offset(progress).left;

                var update = function (value) {
                    thumb.css('left', value + '%');
                    progress.attr('value', Math.round(value));
                }

                progress.bind('touchstart', function (evt) {
                    evt.stopPropagation();
                    var x = evt.touches[0].clientX;
                    var percent = (x - offsetLeft) / progress.prop('offsetWidth');
                    if (percent < 0)
                        percent = 0;
                    if (percent > 1)
                        percent = 1;
                    update(scope.seekbarMax * percent);
                    scope.onSeekbarChanged({newValue: parseInt(progress.attr('value'))});
                });

                thumb.bind('touchstart', function (evt) {
                    evt.stopPropagation();
                    thumb.addClass('active');
                    moving = true;
                });
                thumb.bind('touchmove', function (evt) {
                    evt.stopPropagation();
                    if (moving) {
                        var x = evt.touches[0].clientX;
                        var percent = (x - offsetLeft) / progress.prop('offsetWidth');
                        if (percent < 0)
                            percent = 0;
                        if (percent > 1)
                            percent = 1;
                        update(scope.seekbarMax * percent);
                    }
                });
                thumb.bind('touchend', function () {
                    scope.onSeekbarChanged({newValue: parseInt(progress.attr('value'))});
                    moving = false;
                    thumb.removeClass('active');
                });
                scope.$watch('seekbarValue', function (newVal, oldVal) {
                    if (newVal && !moving) {
                        scope.seekbarValue = newVal;
                        update(newVal);
                    }
                });
            }
        }
    });
"use strict";
angular.module('directives.tap', [])
    .directive('ngTap', function () {
        var isTouch = !!('ontouchstart' in window);
        return function (scope, elm, attrs) {
            // if there is no touch available, we'll fall back to click
            if (isTouch) {
                var tapping = false;
                elm.bind('touchstart', function () {
                    tapping = true;
                    elm.addClass('active');
                });
                // prevent firing when someone is f.e. dragging
                elm.bind('touchmove', function () {
                    tapping = false;
                });
                elm.bind('touchend', function () {
                    tapping && scope.$apply(attrs.ngTap);
                    elm.removeClass('active');
                });
            }
            else {
                elm.bind('click', function () {
                    scope.$apply(attrs.ngTap);
                });
            }
        };
    });
angular.module('filters.xbmc.asset', [])
    .filter('asset', function () {
        return function (input, host, port) {
            if (input && host) {
                port = port || 8080;
                return 'http://' + host + ':' + port + '/image/' + encodeURIComponent(input);
            } else {
                return 'img/blank.gif';
            }
        };
    });
"use strict";
angular.module('filters.xbmc.episode', [])
    .filter('episode', function () {
        return function (input, season) {
            var episode = parseInt(input);
            if (season && episode && !isNaN(episode)) {
                return 'S' + (season < 10 ? '0' + season : season) + 'E' + (episode < 10 ? '0' + episode : episode);
            } else {
                return '';
            }
        };
    });
angular.module('filters.xbmc.time', [])
    .filter('time', function () {
        return function (input) {
            if (typeof input === 'number') {
                var d = new Date();
                d.setHours(0);
                d.setMinutes(0);
                d.setSeconds(0);
                return new Date(d.getTime() + input * 1000);
            }
            if (typeof input === 'object') {
                var seconds = 0;
                seconds += input.hours * 60 * 60;
                seconds += input.minutes * 60;
                seconds += input.seconds;
                return seconds;
            }

        };
    });
angular.module('filters.xbmc', ['filters.xbmc.asset', 'filters.xbmc.episode', 'filters.xbmc.time']);
"use strict";
angular.module('services.xbmc.mock', [])
    .factory('xbmc', ['$rootScope', '$q', '$http', '$parse',
        function ($rootScope, $q, $http, $parse) {
            // We return this object to anything injecting our service
            var factory = {};
            var isConnected = false;
            factory.isConnected = function () {
                return isConnected;
            }

            factory.register = function (method, callback) {

            }

            factory.send = function (method, params, shouldDefer, pathExpr) {
                var defer = $q.defer();
                $http.get('/app/data/' + method + '.json').success(function (data) {
                    var obj = data;
                    if (pathExpr) {
                        var getter = $parse(pathExpr);
                        obj = getter(data);
                    } else {
                        obj = data;
                    }
                    window.setTimeout(function () {
                        $rootScope.$apply(function () {
                            defer.resolve(obj);
                        });
                    }, Math.round(Math.random() * 5000))
                });
                return defer.promise;
            }

            factory.unregister = function (method, callback) {

            }

            factory.connect = function () {
                isConnected = true;
            }

            return factory;
        }
    ])

angular.module('services.websocket', [])
    .factory('websocket', function () {
        // We return this object to anything injecting our service
        var factory = {};
        var isWSConnected = false;
        // Create our websocket object with the address to the websocket
        var ws = null;
        factory.isConnected = function () {
            return isWSConnected;
        }

        factory.connect = function (url, callback) {
            ws = new WebSocket(url);
            ws.onopen = function () {
                isWSConnected = true;
                if (callback) {
                    callback();
                }
            };

            ws.onclose = function () {
                isWSConnected = false;
                console.log('Lost connection retry in 10 sec')
                window.setTimeout(function () {
                    factory.connect(url, callback)
                }.bind(this), 10000);
            };

            ws.onerror = function () {
                isWSConnected = false;
                console.log('Can t connect retry in 10 sec');
                window.setTimeout(function () {
                    factory.connect(url, callback)
                }.bind(this), 10000);
            };
        };

        factory.disconnect = function () {
            ws.close();
        };

        factory.send = function (request) {
            if (isWSConnected) {
                ws.send(JSON.stringify(request));
            }
        };

        factory.subscribe = function (callback) {
            if (isWSConnected) {
                ws.onmessage = function (evt) {
                    callback(evt);
                }
            }
        }
        return factory;
    })

angular.module('services.xbmc', ['services.websocket'])
    .factory('xbmc', ['$rootScope', '$q', '$parse', 'websocket',
        function ($rootScope, $q, $parse, websocket) {
            // We return this object to anything injecting our service
            var factory = {};
            var resolved = false;
            var callbacks = {};
            var currentCallbackId = 0;
            var notifications = {};

            // This creates a new callback ID for a request
            function getCallbackId() {
                currentCallbackId += 1;
                if (currentCallbackId > 10000) {
                    currentCallbackId = 0;
                }
                return currentCallbackId;
            }

            function getDefer(id, method, pathExpr) {
                var defer = $q.defer();
                callbacks[id] = {
                    timestamp: Date.now(),
                    cb: defer,
                    parseExpr: pathExpr,
                    method: method
                };
                return defer;
            }

            function onConnected() {
                websocket.subscribe(onMessage.bind(this));
                var onConnectedCallbacks = notifications['Websocket.OnConnected'] || [];
                for (var i = 0; i < onConnectedCallbacks.length; i++) {
                    onConnectedCallbacks[i]();
                }
            };

            function onMessage(event) {
                if (event.data !== '') {
                    console.log(event.data);
                    var data = JSON.parse(event.data);
                    if (callbacks.hasOwnProperty(data.id)) {
                        var cb = callbacks[data.id];
                        var obj = data;
                        if (cb.hasOwnProperty('parseExpr')) {
                            var getter = $parse(cb.parseExpr);
                            obj = getter(data);
                        }
                        $rootScope.$apply(callbacks[data.id].cb.resolve(obj));
                        delete callbacks[data.id];
                    } else if (notifications[data.method] && notifications[data.method].length > 0) {
                        for (var i = 0; i < notifications[data.method].length; i++) {
                            $rootScope.$apply(notifications[data.method][i](data));
                        }
                    }
                }
            };
            factory.isConnected = function () {
                return websocket.isConnected();
            }

            factory.register = function (method, callback) {
                notifications[method] = notifications[method] || [];
                notifications[method].push(callback);
            }

            factory.send = function (method, params, shouldDefer, pathExpr) {
                shouldDefer = shouldDefer || false;
                pathExpr = pathExpr || 'result';

                var request = {
                    'jsonrpc': '2.0',
                    'method': method
                };
                if (params) {
                    request.params = params;
                }
                if (shouldDefer) {
                    request.id = getCallbackId();
                    var defer = getDefer(request.id, method, pathExpr);
                }
                websocket.send(request);
                return shouldDefer ? defer.promise : 0;
            }

            factory.unregister = function (method, callback) {
                notifications[method] = notifications[method] || [];
                var indexOf = notifications[method].indexOf(callback);
                if (indexOf > -1) {
                    notifications[method] = notifications[method].splice(indexOf, 1);
                }
            }

            factory.connect = function (url, port) {
                websocket.connect('ws://' + url + ':' + port + '/jsonrpc', onConnected);
            }

            return factory;
        }
    ])
angular.module('templates.app', ['layout/footers/basic.tpl.html', 'layout/footers/details.tpl.html', 'layout/footers/player.tpl.html', 'layout/headers/basic.tpl.html', 'layout/headers/searchable.tpl.html', 'movie/details.tpl.html', 'movie/list.tpl.html', 'music/albums.tpl.html', 'music/artists.tpl.html', 'music/musics.tpl.html', 'music/songs.tpl.html', 'navigation/navigation.tpl.html', 'now/playing.tpl.html', 'remote/remote.tpl.html', 'settings/wizard.tpl.html', 'tvshow/details.tpl.html', 'tvshow/episodes.tpl.html', 'tvshow/list.tpl.html', 'tvshow/seasons.tpl.html']);

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
    "        <div class=\"span3\" ng-tap=\"play({'file': library.item..trailer})\">\n" +
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
    "    <i class=\"pull-right logo\"></i>\n" +
    "</h1>\n" +
    "<h2 ng-class=\"{connected : $parent.isConnected(), disconnected : !$parent.isConnected()}\"\n" +
    "    ng-switch on=\"$parent.isConnected()\">\n" +
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
    "<h2 ng-class=\"{connected : $parent.isConnected(), disconnected : !$parent.isConnected()}\"\n" +
    "    ng-switch on=\"$parent.isConnected()\">\n" +
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
    "                <img class=\"offset1 span5 poster\" src=\"{{library.item.thumbnail | asset:configuration.host.ip}}\"/>\n" +
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
    "        <h1>Medias</h1>\n" +
    "    </header>\n" +
    "    <nav>\n" +
    "        <ul>\n" +
    "            <li ng-repeat=\"item in medias\">\n" +
    "                <a ng-tap=\"go(item.hash)\" ng-class=\"isCurrent(item.hash)\">\n" +
    "                    <i class=\"{{item.icon}}\"></i>\n" +
    "                    {{item.label}}\n" +
    "                </a>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </nav>\n" +
    "    <header>\n" +
    "        <h1>Controls</h1>\n" +
    "    </header>\n" +
    "    <nav>\n" +
    "        <ul>\n" +
    "            <li ng-repeat=\"item in controls\">\n" +
    "                <a ng-tap=\"go(item.hash)\" ng-class=\"isCurrent(item.hash)\">\n" +
    "                    <i class=\"{{item.icon}}\"></i>\n" +
    "                    {{item.label}}\n" +
    "                </a>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </nav>\n" +
    "    <div class=\"now playing\" ng-show=\"player.active\">\n" +
    "        <img class=\"poster\" src=\"{{getThumb(player.item.art)}}\" ng-tap=\"go('/now/playing','none')\"/>\n" +
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

angular.module("remote/remote.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("remote/remote.tpl.html",
    "<div class=\"remote\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"action\" ng-tap=\"xbmc.send('Input.Home')\">\n" +
    "            <i class=\"icon icon-home\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"action\" ng-tap=\"xbmc.send('Input.Info')\">\n" +
    "            <i class=\"icon icon-info-sign\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"action\" ng-tap=\"xbmc.send('System.Shutdown')\">\n" +
    "            <i class=\"icon icon-power-off\"></i>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"action\" ng-tap=\"xbmc.send('Input.Back')\">\n" +
    "            <i class=\"icon icon-mail-reply\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"action direction\" ng-tap=\"xbmc.send('Input.Up')\">\n" +
    "            <i class=\"icon icon-chevron-up\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"action\"  ng-tap=\"setVolume(volume -1)\">\n" +
    "            <i class=\"icon icon-volume-off\"><small>+</small></i>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"action direction\" ng-tap=\"xbmc.send('Input.Left')\">\n" +
    "            <i class=\"icon icon-chevron-left\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"action\" ng-tap=\"xbmc.send('Input.Select')\">\n" +
    "            <i class=\"icon icon-circle\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"action direction\" ng-tap=\"xbmc.send('Input.Right')\">\n" +
    "            <i class=\"icon icon-chevron-right\"></i>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"action\" ng-tap=\"xbmc.send('Input.ContextMenu')\">\n" +
    "            <i class=\"icon icon-list-ul\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"action direction\" ng-tap=\"xbmc.send('Input.Down')\">\n" +
    "            <i class=\"icon icon-chevron-down\"></i>\n" +
    "        </div>\n" +
    "        <div class=\"action\" ng-tap=\"setVolume(volume +1)\">\n" +
    "            <i class=\"icon icon-volume-off\"><small>-</small></i>\n" +
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
    "        <img class=\"banner\" src=\"{{library.item.art['tvshow.banner']  | asset:configuration.host.ip}}\"\n" +
    "             alt=\"show.title\"/>\n" +
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
    "            <img class=\"banner\" src=\"{{show.art.banner  | asset:configuration.host.ip}}\" alt=\"show.title\"/>\n" +
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
