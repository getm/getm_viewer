var gulp = require('gulp');
var gutil = require('gulp-util')
var zip = require('gulp-zip');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');

gulp.task('build', ['copy-assets'], function(done) {
    gutil.log(gutil.colors.green('Compiling source...'));
    webpack(webpackConfig, function(err, stats) {
        if(err) throw new gutil.PluginError('build', err);
        gutil.log("[webpack]", stats.toString({
            children: false,
            chunks: false,
            colors: true
        }));

        gutil.log(gutil.colors.green('Building .war file...'));
        gulp.src('./dist/**/!(*.war)')
        .pipe(zip('getm.war'))
        .pipe(gulp.dest('./dist'))
        done();
    })
});

gulp.task('copy-assets', function(done) {
    gutil.log(gutil.colors.green('Copying CSS for dependencies...'));
    gulp.src('./node_modules/jqueryui/jquery-ui.min.css')
    .pipe(gulp.dest('./dist'))
    gulp.src('./node_modules/openlayers/dist/ol.css')
    .pipe(gulp.dest('./dist'))

    gutil.log(gutil.colors.green('Copying jQuery UI image files...'))
    gulp.src('./node_modules/jqueryui/images/**/*')
    .pipe(gulp.dest('./dist/images'));
    done();
})