'use strict';
/* Directives */

angular.module('myApp.directives', []).
    directive('appVersion', ['version', function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        };
    }])
    .directive('scHeader', function(){
        return {
            restrict: 'EA',
            replace: true,
            controller : 'headerController',
            templateUrl: 'partials/header.html'
        }
    })
    .directive('actionButton', function(User){
        return {
            restrict: 'EA',
            replace: true,
            scope : {
                text: "="
            },
            templateUrl: 'partials/button.html'
        }
    })
    .directive('scMenu', function(){
        return {
            restrict : 'EA',
            replace : true,
            controller : 'menuController',
            templateUrl: 'partials/menu.html'
        }
    })
    .directive('phoneInput', function(){
        return {
            restrict : 'EA',
            link : function(sc, el, at) {
                el.bind('keydown keypress', function(e){
                    /*console.log($(el).val());

                     if(sc.User.phone.length >= 10) {
                     e.preventDefault();
                     e.stopPropagation();
                     }*/
                });
            },
            replace : true,
            template: '<input id="phone" maxlength="10" type="tel" ng-model="User.phone"/>'
        }
    })
    .directive('ios7StatusBar', function() {
        return {
            restrict : 'EA',
            replace : true,
            controller : 'ios7StatusBarController',
            templateUrl: 'partials/statusBar.html'
        }
    });
