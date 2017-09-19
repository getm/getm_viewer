var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util')
var zip = require('gulp-zip');
var pump = require('pump');
var webpack = require('webpack');
var WebpackDevServer = require("webpack-dev-server");
var webpackProdConfig = require('./webpack.prod.config.js');
var webpackDevConfig = require('./webpack.dev.config.js');
var path = require('path');

// The address:port the dev server should run on
var devPort = 9002;
var devHost = 'localhost';

// The address:port services are running on (in order to proxy calls)
var tomcatAddress = 'http://localhost:8080';

// Create proxies for these routes
var routes = [
    '/product/**/*',
    '/geoserver/**/*',
    '/GeoServerRest/**/*',
    '/cgswebdbrest/**/*',
    '/auth'
]

gulp.task("dev", ['webpack-dev-server']);

gulp.task('build', ['copy-assets', 'copy-module-assets', 'build-polyfill', 'build-geolib'], function(done) {
    gutil.log(gutil.colors.green('Compiling source...'));
    webpack(webpackProdConfig, function(err, stats) {
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

gulp.task('copy-module-assets', function(done) {
    gutil.log(gutil.colors.green('Copying CSS for dependencies...'));
    gulp.src('./node_modules/openlayers/dist/ol.css')
    .pipe(gulp.dest('./dist/css'))
    done();
});

gulp.task("copy-assets", function(done) {
    waitForAll([
        copy([
            'lib/jquery/jquery-3.2.1.min.js'
        ], './dist'),
        pump([
            gulp.src([
                'assets/**/*'
            ], {base: './assets'}),
            gulp.dest('./dist'),
        ])
    ], done);
});

gulp.task("build-polyfill", function(done) {
    copy([
        './node_modules/classlist-polyfill/src/index.js',
        './node_modules/es5-shim/es5-shim.js',
        './node_modules/es6-promise/dist/es6-promise.js',
        './lib/polyfills/array-from.js',
        './lib/polyfills/string-includes-polyfill.js',
        './lib/polyfills/resize-polyfill.js',
        './lib/polyfills/remove-polyfill.js',
        './lib/polyfills/request-animation-frame-polyfill.js'
    ], './dist', [
        concat('polyfill-bundle.js'),
        //uglify()
    ], done);
});

gulp.task('build-geolib', function(done) {
    copy([
        './lib/geo/geo.js',
        './lib/geo/dms.js',
        './lib/geo/utm.js',
        './lib/geo/mgrs.js',
        './lib/geo/coord_manager.js'
    ], './dist', [
        concat('geolib.js'),
        uglify(),
    ], done)
})

gulp.task("webpack-dev-server", function() {
    const proxies = createProxies(routes);
    new WebpackDevServer(webpack(webpackDevConfig), {
        historyApiFallback: true,
        contentBase: ["./dist", "./"],
        inline: true,
        hot: true,
        proxy: proxies,
        stats: {
            colors: true,
            chunks: false
        }
    })
    .listen(devPort, devHost, function(err) {
        if(err) {
            throw new gutil.PluginError("webpack-dev-server", err);
        }
    });
});

/**
 * Waits for all streams to finish before calling the passed callback.
 * Use this to group multiple pumps/gulp.streams together & wait for them
 * all to finish before moving on.
 */
function waitForAll(streams, cb) {
    let completed = 0;
    streams.forEach(stream => {
        stream.on('end', () => {
            completed += 1;
            if(completed === streams.length) {
                cb();
            }
        })
    });
}

function createProxies(routes) {
    const proxy = {}
    routes.forEach(route => {
        proxy[route] = {
            target: tomcatAddress,
            changeOrigin: true
        }
    });
    return proxy;
}

function copyImages(baseDir, newDir) {
    try {
        var baseFiles = fs.readdirSync(baseDir);
        var newFiles = fs.readdirSync(newDir);
        if(baseFiles.length !== newFiles.length) {
            return true;
        }
        for(let i = 0; i < baseFiles.length; i++) {
            if(baseFiles[i] !== newFiles[i]) {
                return true;
            }
        }

        return false;
    } catch (e) {
        return true;
    }
}

function copy(source, destination, transforms, cb) {
    cb = cb || (() => {}); // If no cb is passed, use a no-op
    const streams = [
        gulp.src(source),
        gulp.dest(destination)
    ];
    if(transforms) { streams.splice(1, 0, ...transforms.filter(t => !!t)); }
    return pump(streams, cb);
}
