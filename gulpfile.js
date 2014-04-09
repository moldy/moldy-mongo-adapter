var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	jshintReporter = require("jshint-stylish"),
	shell = require('gulp-shell');

var pkg = require('./package.json');

gulp.task("jshint", function () {
	return gulp.src(["./src/scripts/**/*.js", "test/**/*.js"])
		.pipe(jshint())
		.pipe(jshint.reporter(jshintReporter));
});

gulp.task('test', ['jshint'], function () {
	return gulp.src('').pipe(shell(['npm test']));
});

gulp.task('watch', function () {
	gulp.watch(['./src/**/*.js'], ['test']);
	gulp.watch(['./test/**/*'], ['test']);
	gulp.watch(['*.js'], ['default']);
});

gulp.task('default', ['test']);
gulp.task('run', ['test', 'watch']);