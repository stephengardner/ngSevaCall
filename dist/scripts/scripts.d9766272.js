"use strict";window.onerror=function(a,b,c){console.log("SCError: "+a+" in "+b+" at line "+c)};var checkPhoneGap=function(){return"undefined"!=typeof cordova||"undefined"!=typeof phonegap},isPhoneGap=checkPhoneGap(),testing=!1,testRequestID=112669,testPhoneNumber="(301) 704-7437",skipAPICalls=!1,testingType="",environment="local",root,api_root,mapsLoaded=!1,appOptions={analytics:{gaStorageName:"sc_clientId",gaIDs:{"Seva Call Mobile App":"UA-51774414-1","Seva Call Mobile Web":"UA-52209319-1"},eventTypes:{1:"page",2:"interaction",3:"alert"}}},alerts={call_companies:{body:"Call companies now? You may receive up to three calls"},home:{title:"Start Over?",body:"Returning to step 1 will cancel your current request, continue?"},abandon:{title:"Start Over?",body:"Are you sure you want to abandon this request?"}};"local"!=environment||isPhoneGap?"local"==environment&&isPhoneGap?(root="",api_root="http://test.s17.sevacall.com/"):"development"==environment?(root=isPhoneGap?"":"http://test.s17.sevacall.com/mobile/",api_root="http://test.s17.sevacall.com/"):"production"==environment&&(console.log=function(){},console.warn=function(){},console.error=function(){},root="",api_root=isPhoneGap?"http://www.sevacall.com/":"../"):(root="../../",api_root="http://localhost/"),String.prototype.capitalize=function(){return this.toLowerCase().replace(/^.|\s\S/g,function(a){return a.toUpperCase()})};var myApp=angular.module("myApp",["myApp.services","myApp.directives","myApp.controllers","ui.router","ngAnimate","ngStorage"]).factory("MyInterceptor",["$q","$rootScope","$injector","$timeout","Overlay","Track",function(a,b,c,d,e,f){var g=0,h=function(b){var d=function(){f.event(3,"alert_internet_failed")};return b.then(function(b){if(console.log("*--*Http Wrapper Success Response: ",b),b.data&&"string"==typeof b.data&&-1!=b.data.indexOf("DOCTYPE")){var f=a.defer();return d(),new xAlert("Verify you are connected to the internet and retry.",function(d){if(1==d){var f=c.get("$http");return f(b.config)}e.remove(),a.reject("rejected")},"Connection Error","Retry, Cancel"),f.promise}return console.log("*Response was valid and we're connected to the internet... returning"),b},function(b){if(console.log("-*-Http wrapper error response: ",b),500==b.status,g>=2){g=0;var f=a.defer();return d(),new xAlert("Verify you are connected to the internet and retry.",function(d){if(1==d){var f=c.get("$http");return f(b.config)}e.remove(),a.reject("rejected")},"Connection Error","Retry, Cancel"),f.promise}g++;var h=c.get("$http");return h(b.config)})};return h}]).config(["$httpProvider",function(a){a.responseInterceptors.push("MyInterceptor")}]).config(["$httpProvider",function(a){a.defaults.transformRequest=function(a){return void 0===a?a:$.param(a)}}]).config(["$httpProvider",function(a){a.responseInterceptors.push(function(a,b){return function(c){return b.$broadcast("event:routeChangeStart"),c.then(function(a){return b.$broadcast("event:routeChangeSuccess"),a},function(c){return b.$broadcast("event:routeChangeError"),a.reject(c)})}})}]).config(function(a,b){b.otherwise("/step1");var c={name:"step1",url:"/step1",controller:"step1Controller",templateUrl:root+"views/home.html"},d={name:"step2",url:"/step2",controller:"step2Controller",templateUrl:root+"views/step2.html",resolve:{resolveAPI:function(a,b,c,d,e){if(e.id)return!0;var f=b.defer();return a.add(1),c.step1().then(function(b){"Invalid Location"==b&&(console.log("-*-Invalid step 2"),d.path("/")),a.remove(),f.resolve(b)}),f.promise}}},e={name:"step3",url:"/step3",controller:"step3Controller",templateUrl:root+"views/step3.html"},f={name:"recording",url:"/recording",controller:"recordingController",templateUrl:root+"views/recording.html"},g={name:"timetable",url:"/timetable",controller:"timeTableController",templateUrl:root+"views/timetable.html"},h={name:"step2a",url:"/step2a",controller:"step2aController",templateUrl:root+"views/step2a.html"},i={name:"settings",url:"/settings",controller:"step2aController",templateUrl:root+"views/step2a.html"},j={name:"information",url:"/information",controller:"informationController",templateUrl:root+"views/information.html",resolve:{resolveSize:function(){var a=$(".ui-view-container").width(),b=parseInt(a/16*9)+2,c={height:b+"px","max-height":"400px"};return 400>b?c={width:"100%"}:(b=400,a=b/9*16,c={width:a+"px"}),[b,a,c]}}},k={name:"summary",url:"/summary",controller:"summaryController",templateUrl:root+"views/summary.html"};a.state(c),a.state(d),a.state(e),a.state(f),a.state(k),a.state(g),a.state(h),a.state(i),a.state(j)}).run(function(a,b,c,d,e,f,g,h,i,j,k){FastClick.attach(document.body),d.$on("requestCompleted",function(){f.go("summary")}),d.$on("$stateChangeStart",function(a,b){function d(){console.log("*-*Preventing default change on state change Menu Button"),a.preventDefault();var d=function(){c.reset(),f.go(b.name),g.sync()};return k.on?(new xAlert(alerts.abandon.body,function(a){1==a&&d()},alerts.abandon.title,"Yes, Cancel"),!1):void d()}return console.log("-Going to state: "+b.name),"step2"!=b.name&&"step3"!=b.name||c.id||i.path("/step1"),c.id&&!c.complete&&"step1"==b.name?d():(e.close(),void console.log("*Menu closed"))}),d.$on("$locationChangeStart",function(a,b){function d(){return console.log("*-*Preventing default change on location change Back Button"),a.preventDefault(),k.on?(new xAlert(alerts.abandon.body,function(a){1==a&&e()},alerts.abandon.title,"Yes, Cancel"),!1):void e()}var e=function(){c.reset(),f.go("step1"),g.sync()};return c.id&&!c.complete&&-1!=b.indexOf("step1")?d():void(-1==b.indexOf("step3")&&-1==b.indexOf("step2")||c.id||i.path("/step1"))})}).filter("orderObjectBy",function(){return function(a,b,c){var d=[];return angular.forEach(a,function(a){d.push(a)}),d.sort(function(a,c){return a[b]>c[b]}),c&&d.reverse(),d}});myApp.filter("reverse",function(){return function(a){return a.slice().reverse()}});