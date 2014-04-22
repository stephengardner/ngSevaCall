module.exports = function(grunt) {

	grunt.initConfig({
		concat: {
			angular: {
				files: {
					'app/vendors/angular/angular.js': ['components/angular/angular.js']
				}
			},
			jquery: {
				files: {
					'app/vendors/jquery/jquery.js': ['components/jquery/dist/jquery.js']
				}
			},
			bootstrap: {
				files: {
					'app/vendors/bootstrap/css/bootstrap.css': ['components/bootstrap/dist/css/bootstrap.css'],
					'app/vendors/bootstrap/js/bootstrap.js': ['components/bootstrap/dist/js/bootstrap.js']
				}
			},
			fontAwesome: {
				files: {
					'app/vendors/font-awesome/css/font-awesome.css': ['components/font-awesome/css/font-awesome.css'],
					'app/vendors/font-awesome/fonts/fontAwesome.otf': ['components/font-awesome/fonts/fontAwesome.otf'],
					'app/vendors/font-awesome/fonts/fontawesome-webfont.woff': ['components/font-awesome/fonts/fontawesome-webfont.woff'],
					'app/vendors/font-awesome/fonts/fontawesome-webfont.svg': ['components/font-awesome/fonts/fontawesome-webfont.svg'],
					'app/vendors/font-awesome/fonts/fontawesome-webfont.ttf': ['components/font-awesome/fonts/fontawesome-webfont.ttf'],
					'app/vendors/font-awesome/fonts/fontawesome-webfont.eot': ['components/font-awesome/fonts/fontawesome-webfont.eot']
				}
			},
			angularUiRouter: {
				files: {
					'app/angular-components/angular-ui-router/angular-ui-router.js': ['components/angular-ui-router/release/angular-ui-router.js']
				}
			},
			angularResource: {
				files: {
					'app/angular-components/angular-resource/angular-resource.js': ['components/angular-resource/angular-resource.js']
				}
			},
			angularInfiniteScroll: {
				files: {
					'app/angular-components/ngInfiniteScroll/ng-infinite-scroll.js': ['components/ngInfiniteScroll/ng-infinite-scroll.js']
				}
			},
			angularCookies: {
				files: {
					'app/angular-components/angular-cookies/angular-cookies.js': ['components/angular-cookies/angular-cookies.js']
				}
			},
			angularAnimate: {
				files: {
					'app/angular-components/angular-animate/angular-animate.js': ['components/angular-animate/angular-animate.js']
				}
			},
			angularLoadingBar: {
				files: {
					'app/angular-components/angular-loading-bar/js/angular-loading-bar.js': ['components/angular-loading-bar/build/loading-bar.js'],
					'app/angular-components/angular-loading-bar/css/angular-loading-bar.css': ['components/angular-loading-bar/build/loading-bar.css']
				}
			}
		}
	});
	
	grunt.loadNpmTasks("grunt-bower-install-simple");
	grunt.loadNpmTasks('grunt-contrib-concat');
	
	grunt.registerTask('bower', [
		'bower-install-simple',
		'concat'
	]);	
	
};