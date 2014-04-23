<?php
	// a php file that executes the shell_exec function (by using backticks),
	// this URL, when pinged, will execute a git pull, updating our repo every time this project is pushed to github
	`git pull`;
?>