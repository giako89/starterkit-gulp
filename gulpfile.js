"use strict";

var gulp = require('gulp'),
    del  = require('del'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    cache = require('gulp-cache'),
    runSequence = require('run-sequence'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    fileinclude = require('gulp-file-include'),
    htmlmin = require('gulp-htmlmin'),
    inlinesource = require('gulp-inline-source'),
  //  babel = require("gulp-babel"),
    browserSync = require('browser-sync').create();

/* base urls */
var SRC = 'src/';
var DIST = 'dist/';

/* Run local server */
gulp.task('serve', function() {

    browserSync.init({
        server: {
            baseDir: "./" + DIST
        },
        files : ["./" + DIST + "js/**/*.js", "./" + DIST + "**/*.html", "./" + DIST + "css/**/*.css" ]
    });

    gulp.watch("./"+ SRC + 'js/**/*.js', ['js:min']);
    gulp.watch("./"+ SRC + 'css/**/*.scss', [ 'css:min' ]);
    gulp.watch("./"+ SRC + "**/*.html", ['fileinclude']);
});

/* clear CACHE */
gulp.task('clear', function (done) {
    return cache.clearAll(done);
});

/* clean build folder */
gulp.task('clean', function () {
    return del(DIST + '**/*')
});

/* minify css */
gulp.task('css:min', function() {
    return gulp.src( SRC + 'css/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', gutil.log))
        .pipe(gulp.dest( DIST + 'css'))

});

/* concat & minify js */
gulp.task('js:min', function () {
    return gulp.src([
        SRC+'js/*.js'])
        .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest( DIST + 'js'))
        .on('error', gutil.log)
});

/* concat js */
gulp.task('js:concat', function () {
  return gulp.src([
    SRC+'js/*.js'])
      .pipe(concat('app.js'))
      .pipe(rename('app.min.js'))
      .pipe(gulp.dest( DIST + 'js'))
      .on('error', gutil.log)
});

gulp.task('fileinclude', function() {
    gulp.src([SRC+'*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(DIST));
});

gulp.task('fileinclude:min', function() {
    gulp.src([SRC+'*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(DIST));
});


/* optimize img */
gulp.task('image:min', function(){
    return gulp.src(SRC+'img/**')
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        })))
        .pipe(gulp.dest(DIST+'img'));
});

/* copy generic files to dist folder */
gulp.task('files', function() {
    return gulp.src([
        SRC+'.htaccess',
        SRC+'robots.txt',
        SRC+'favicon.ico'])
        .pipe(gulp.dest(DIST))
});

/* copy fonts to dist folder */
gulp.task('fonts', function() {
    return gulp.src(SRC+'fonts/**/*')
        .pipe(gulp.dest(DIST+'fonts'));
});

gulp.task('inlinesource', function () {
    return gulp.src(DIST+'index.html')
        .pipe(inlinesource())
        .pipe(gulp.dest(DIST));
});

// DEV, WATCH
gulp.task('default', function(){
    runSequence('clear','clean','css:min','js:concat','image:min','fileinclude','files','fonts','serve');
});

// PROD
gulp.task('prod', function(){
    runSequence('clear','clean','css:min','js:min','image:min','fileinclude:min','files','fonts','inlinesource');
});

