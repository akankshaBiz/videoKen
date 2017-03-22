/**
 * Created by LEGEND on 22-03-2017.
 */
/*** Created by LEGEND on 17-01-2017.*/
var app = angular.module('myApp', ["ui.router"]);
app.config(['$stateProvider', '$urlRouterProvider',function($stateProvider,$urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'login.html',
            controller: 'myCtrl'
        })

        .state('home', {
            url: '/home',
            templateUrl: 'home.html',
            controller: 'myCtrl'
        })

        .state('logout', {
            url: '/logout',
            templateUrl: 'index.html'
        })

        .state('signup', {
            url: '/signup',
            templateUrl: 'signup.html'
        })

        .state('profile', {
            url: '/profile',
            templateUrl: 'profile.html',
            controller: 'ProfileCtrl'
        });
    $urlRouterProvider.otherwise('/home');
}]);

app.factory('apiService', ['$http', '$q', function ($http, $q) {
    var apiService = {};
    var login = function (data) {
        var deferred = $q.defer();
        $http.post('/login', data).then(function (response) {
                deferred.resolve(response);
            },
            function (error) {
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };
    apiService.login = login;
    return apiService;
}]);

app.controller('ProfileCtrl', ['$scope', '$state', '$http', function ($scope, $state, $http) {
    $http.get('/profile').then(function (response) {
        console.log('the res is: ', response);
        $scope.username = response.data.data.email;
    })
}]);

app.controller('myCtrl', function ($scope, $http, $state, apiService, $sce) {
    $scope.user={};
    $scope.videoList = [];
    $scope.libraryList = [];
    $scope.play = false;
    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    };

    $scope.loginUser = function() {
        console.log($scope.user);
        // $http.post('/login',$scope.user).then(function (data) {
        apiService.login($scope.user).then(function(data) {
                console.log("Login success!", data);
                $state.go('profile');
            },
            function (err) {
                console.log(err);
                $scope.errortext = err;
            }
        );
    };
    $scope.logout = function(){
        $state.go('home');
    };
    $scope.saveUser = function() {
        console.log($scope.user);
        $http.post('/signup',$scope.user).then(function (data) {
                $state.go('profile');
            },
            function (err) {
                console.log(err);
                $scope.errortext = err;
            }
        );
    };
    $scope.searchVideo = function () {
    $http({
        method: 'GET',
        url: 'https://www.googleapis.com/youtube/v3/search?',
        params: {
            part: 'snippet',
            q: 'kpop',
            type: 'video',
            key: 'AIzaSyCLE-UPmf9nG5pC2U17v0dN3OlDPncMMqg'
        }
    }).then(function (response) {
        $scope.youTubeList = response.data.items;
        $scope.youTubeList.forEach(function (el) {
            $scope.videoList.push({
                title : el.snippet.title,
                url: "https://www.youtube.com/embed/"+ el.id.videoId + ""
            });
        });
        console.log(response);
        console.log("video list ",$scope.videoList);

    }),
        function (err) {
            console.log(err);
        }
    };
    $scope.addToLib = function (obj) {
        $scope.libraryList.push({
            title : obj.title,
            url: obj.url
        });
    };
    var activeVideo = 0;
    var playNext = function (obj) {
        alert("ended");
        activeVideo = (++activeVideo) % $scope.libraryList.length;

        // update the video source and play
        $scope.videoUrl = $scope.libraryList[activeVideo].url + "?autoplay=1";
        $scope.videoTitle = $scope.libraryList[activeVideo].title;
        obj.play();
    };
    var jq = $;

    jq('#libVideo').on('stateChange', function(){
        //Whatever you want to happen after it has ended
        alert("ended");
        activeVideo = (++activeVideo) % $scope.libraryList.length;

        // update the video source and play
        $scope.videoUrl = $scope.libraryList[activeVideo].url + "?autoplay=1";
        $scope.videoTitle = $scope.libraryList[activeVideo].title;
        jq('#libVideo').play();
    });
    $scope.playVid = function () {
        var libVideo = document.getElementById('libVideo');

        $scope.play = true;
        $scope.videoUrl = $scope.libraryList[activeVideo].url + "?autoplay=1";
        $scope.videoTitle = $scope.libraryList[activeVideo].title;

    };
});