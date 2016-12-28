/*

REQUIRED STUFF
==============
*/

var gulp        = require('gulp');
var sass        = require('gulp-sass');
// var sourcemaps  = require('gulp-sourcemaps');
// var notify      = require('gulp-notify');
var prefix      = require('gulp-autoprefixer');
var minifycss   = require('gulp-clean-css');
var uglify      = require('gulp-uglify');
var cache       = require('gulp-cache');
var concat      = require('gulp-concat');
var util        = require('gulp-util');
var header      = require('gulp-header');
var pixrem      = require('gulp-pixrem');
// var exec        = require('child_process').exec;
var eslint      = require('gulp-eslint');
var del         = require('del');
var cleanhtml   = require('gulp-cleanhtml');
// var scsslint    = require('gulp-scss-lint');

/*

FILE PATHS
==========
*/

var srcDir = './src';
var sassSrc = srcDir + 'assets/stylesheets/**/*.{sass,scss}';
var sassFile = srcDir + '/assets/stylesheets/global.scss';
var buildDir = './build'
var cssDest = buildDir + '/assets/stylesheets/';
var jsSrc = srcDir + '/js/**/*.js';
var jsDest = buildDir + '/js';
var jsDestFile = buildDir + "/internotes.js";
/*

ERROR HANDLING
==============
*/

var handleError = function(task) {
  return function(err) {

      notify.onError({
        message: task + ' failed, check the logs..'
      })(err);

    util.log(util.colors.bgRed(task + ' error:'), util.colors.red(err));
  };
};

/*
STYLES
======
*/

gulp.task('build:css', ['build:clean'], function() {

  // gulp.src(sassFile)
  //
  //   .pipe(sass({
  //     compass: false,
  //     bundleExec: true,
  //     sourcemap: false,
  //     style: 'compressed',
  //     debugInfo: true,
  //     lineNumbers: true,
  //     errLogToConsole: true,
  //     includePaths: [
  //       srcDir + '/node_modules/',
  //       'node_modules/',
  //       // 'bower_components/',
  //       // require('node-bourbon').includePaths
  //     ],
  //   }))
  //
  //   .on('error', handleError('styles'))
  return gulp.src("src/assets/stylesheets/**/*.css")
    .pipe(prefix('last 3 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')) // Adds browser prefixes (eg. -webkit, -moz, etc.)
    .pipe(pixrem())
    .pipe(minifycss({
      advanced: true,
      keepBreaks: false,
      keepSpecialComments: 0,
      mediaMerging: true,
      sourceMap: true,
      debug: true
    }, function(details) {
        console.log('[clean-css] Original size: ' + details.stats.originalSize + ' bytes');
        console.log('[clean-css] Minified size: ' + details.stats.minifiedSize + ' bytes');
        console.log('[clean-css] Time spent on minification: ' + details.stats.timeSpent + ' ms');
        console.log('[clean-css] Compression efficiency: ' + details.stats.efficiency * 100 + ' %');
    }))
    .pipe(gulp.dest(cssDest))
});

gulp.task('lint:scss', function() {
  gulp.src(sassSrc)
  .pipe(scsslint());
});

/*

SCRIPTS
=======
*/

var currentDate   = util.date(new Date(), 'dd-mm-yyyy HH:ss');
var pkg       = require('./package.json');
var banner      = '/*! <%= pkg.name %> <%= currentDate %> - <%= pkg.author %> */\n';

// Build all the things!
gulp.task("build", ["build:copy", "build:css", "build:html", "build:js"]);

// Clean build directory
gulp.task("build:clean", function() {
  return del(["build/*", "dist/*"]);
});

// Copy files that don't require any build process
gulp.task("build:copy", ["build:clean"], function() {
  gulp.src(["src/images/*"]).
    pipe(gulp.dest("build/images"));
  return gulp.src("src/manifest.json").
    pipe(gulp.dest("build"));
});

gulp.task('lint', function() {
  return gulp.src(jsSrc)
  // .pipe(cache("linting"))
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failOnError());
});

gulp.task('build:js', ["build:clean"], function() {
  gulp.src([jsSrc])
    .pipe(concat('internotes.js'))
    .pipe(uglify({preserveComments: false, compress: true, mangle: true}).on('error',function(e){console.log('\x07',e.message);return this.end();}))
    .pipe(header(banner, {pkg: pkg, currentDate: currentDate}))
    .pipe(gulp.dest(jsDest));
});

// Copy and compress HTML files
gulp.task("build:html", ["build:clean"], function() {
  return gulp.src(srcDir + "/**/*.html").
    pipe(cleanhtml()).
    pipe(gulp.dest(buildDir));
});

/*

WATCH
=====

*/

// Run the JS task followed by a reload
// gulp.task('js-watch', ['js'], browserSync.reload);
// gulp.task('watch', ['browsersync'], function() {
//
//   gulp.watch(sassSrc, ['styles']);
//   gulp.watch(jsSrc, ['js-watch']);
//
// });