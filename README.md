# ngQuotogenic

## Quotogenic built with Angular.js (in progress)

This project is based on re-designing [quotogenic.com](http://quotogenic.com) using the Angular.js framework.  
Abstracting all backend functionality into a REST API, and using Angular's two way data binding
to allow for easier real-time updates in a Single-Page-Application powered quote/photo matching platform.

### Live: Online

See this early project in action at [quotogenic.com/ng](http://quotogenic.com/ng), current code is synced in real-time using github push/pull hooks

## Where to begin

### app directory

The application is built off angular-seed, a boilerplate for angular/bower enabled applications.
You'll find the actual code residing in the "app" directory

## Fundamentals

A very high level look at the fundamentals involved with the current progress of this Angular project: 

* `Angular` - ui-router, services, directives, controllers, partials, ngProgress, authentication, login/logout, infinite scroll, etc
* `PHP` - Database connection, API integration, ajax retrieval, JSON delivery, REST oriented
* `REST` - Custom REST PHP Class for creating endpoints and delivering data
* `MySQL` - Retrieval of data across several tables totaling hundreds of thousands of rows, created with a normalized table structure
* `Bootstrap` - Bootstrap CSS

more coming...

## Grunt | Bower

This project uses grunt and bower to automatically add dependencies to the `app/vendors` and `app/angular-components` directories.
Within the `Gruntfile.js` is a list of `concat` operations to move files from the `components` directory at the root (these are the `bower_components`, renamed, using `.bowerrc`),
and place them within the `app` directory, at their desired locations.
In order to run this grunt operation, which is configured within `Gruntfile.js`, simply run `grunt bower` from the project root via the CLI.

## Hidden Passwords

This repository exposes the backend API as well as the frontend javascript/HTML/CSS.
The sensitive data, database passwords, and instagram API Secret Key, have been ignored from this repository.  
So while this is a full platform as-is, it is not forkably usable by a third party unless you'd like access to my database and instagram API (on request)

## Contact

Contact me at opensourceaugie@gmail.com or [quotogenic.com/contact](http://quotogenic.com/contact)