/**
 * Created by Techelogy Group LLC on 7/19/16.
 */
'use strict';
const path = require('path');
const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const server = require('gulp-develop-server');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const tslint = require('gulp-tslint');
const plumber = require('gulp-plumber');
const zip = require('gulp-zip');
const jEditor = require('gulp-json-editor');
const runSequence = require('run-sequence');
const tsFiles = ['src/**/*.ts', '!node_modules/**', '!build/**', '!logs/**'];
const nonTsFiles = ['src/**/*.*', '!src/**/*.ts',, '!src/assets/*'];
const tsProject = ts.createProject('tsconfig.json');

gulp.task('files:move', function(){
    gulp.src('src/assets/*')
    .pipe(plumber())
    .pipe(gulp.dest('build/src/assets/'));
  });

gulp.task('clean', () => {
    return gulp
        .src(['build', 'logs', 'release'], {read: false})
        .pipe(clean());
});

gulp.task('files:copy', () => {
    return gulp.src(nonTsFiles)
        .pipe(plumber())
        .pipe(gulp.dest('build'));
});

gulp.task('ts:lint', () =>
    gulp.src(tsFiles)
        .pipe(tslint({
            configuration: 'tslint.json'
        }))
        .pipe(tslint.report({
            emitError: false
        }))
);
gulp.task('ts:compile', function () {
    return tsProject
        .src(tsFiles, {base: './src'})
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .pipe(sourcemaps.write('.', {
            includeContent: false,
            sourceRoot: function () {
                return path.join(__dirname, 'src');
            }
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('ts:compile:release', function () {
    return tsProject
        .src(tsFiles, {base: './src'})
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .pipe(uglify())
        .pipe(sourcemaps.write('.', {
            includeContent: false,
            sourceRoot: function () {
                return path.join(__dirname, 'src');
            }
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('package.json', () => {
    return gulp.src('package.json')
        .pipe(jEditor(json => {
            json.devDependencies = {};
            return json;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('zip', () => {
    return gulp.src('build/**/*', {dot: true})
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('release'));
});

gulp.task('build', (cb) => {
    runSequence('clean', 'ts:compile', 'files:copy','files:move', cb);
});

gulp.task('build:release', (cb) => {
    runSequence('clean', 'ts:compile', 'files:copy', 'package.json', 'zip', cb);
});

gulp.task('watch', (cb) => {
    runSequence('build', cb);
    gulp.watch(tsFiles, ['ts:compile']);
    gulp.watch(nonTsFiles, ['files:copy']);
});

gulp.task('server:start', (cb) => {
    runSequence('files:copy', 'files:move', 'ts:compile', cb);
    server.listen({path: 'build/server.js'}, (error) => {
        console.log(error);
    });
});

gulp.task('server:restart', ['ts:compile'], function () {
    server.restart();
});

gulp.task('default', ['server:start'], function () {
    gulp.watch(tsFiles, ['server:restart']);
});
