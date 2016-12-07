import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import { stream as wiredep } from 'wiredep';

const $ = gulpLoadPlugins();

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    'app/fonts/**',
    '!app/scripts.babel',
    '!app/*.json',
    '!app/*.html',
  ], {
      base: 'app',
      dot: true
    }).pipe(gulp.dest('dist/chrome'));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format());
  };
}

gulp.task('lint', lint('app/scripts.babel/**/*.js', {
  env: {
    es6: true
  }
}));

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{ cleanupIDs: false }]
    }))
      .on('error', function (err) {
        console.log(err);
        this.end();
      })))
    .pipe(gulp.dest('dist/chrome/images'));
});

gulp.task('html', () => {
  return gulp.src('app/*.html')
    .pipe($.useref({ searchPath: ['.tmp', 'app', '.'] }))
    .pipe($.sourcemaps.init())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss({ compatibility: '*' })))
    .pipe($.sourcemaps.write())
    .pipe($.if('*.html', $.htmlmin({ removeComments: true, collapseWhitespace: true })))
    .pipe(gulp.dest('dist/chrome'));
});

gulp.task('chromeManifest', () => {
  return gulp.src('app/manifest.json')
    .pipe($.chromeManifest({
      exclude: [
        {
          'content_scripts.[0].css': [
            'styles/page-firefox.css'
          ]
        }
      ],
      background: {
        target: 'scripts/background.js',
        exclude: [
          'scripts/chromereload.js'
        ]
      }
    }))
    .pipe($.if('*.css', $.cleanCss({ compatibility: '*' })))
    .pipe($.if('*.js', $.sourcemaps.init()))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.js', $.sourcemaps.write('.')))
    .pipe(gulp.dest('dist/chrome'));
});

gulp.task('babel', () => {
  return gulp.src('app/scripts.babel/**/*.js')
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('watch', ['lint', 'babel'], () => {
  $.livereload.listen();

  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    'app/styles/**/*',
    'app/_locales/**/*.json'
  ]).on('change', $.livereload.reload);

  gulp.watch('app/scripts.babel/**/*.js', ['lint', 'babel']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('size', () => {
  return gulp.src('dist/chrome/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('firefoxManifest', () => {
  return gulp.src('app/manifest.json')
    .pipe($.chromeManifest({
      exclude: [
        {
          'content_scripts.[0].css': [
            'styles/page-chrome.css'
          ]
        }
      ],
      background: {
        target: 'scripts/background.js',
        exclude: [
          'scripts/chromereload.js'
        ]
      }
    }))
    .pipe($.if('*.css', $.cleanCss({ compatibility: '*' })))
    .pipe($.if('*.js', $.sourcemaps.init()))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.js', $.sourcemaps.write('.')))
    .pipe(gulp.dest('dist/firefox'));
});

gulp.task('firefoxCopy', () => {
  return gulp.src(['dist/chrome/**/*', '!**/page-chrome.css'])
    .pipe(gulp.dest('dist/firefox'));
});

gulp.task('firefoxSize', () => {
  return gulp.src('dist/firefox/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('wiredep', () => {
  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('firefoxPackage', () => {
  var manifest = require('./dist/firefox/manifest.json');
  return gulp.src('dist/firefox/**')
    .pipe($.zip('Firefox Persian Twitter-' + manifest.version + '.zip'))
    .pipe(gulp.dest('package'));
});

gulp.task('chromePackage', () => {
  var manifest = require('./dist/chrome/manifest.json');
  return gulp.src('dist/chrome/**')
    .pipe($.zip('Chrome Persian Twitter-' + manifest.version + '.zip'))
    .pipe(gulp.dest('package'));
});

gulp.task('package', () => {
  runSequence('chromePackage', 'firefoxPackage');
});

gulp.task('buildChrome', cb => {
  runSequence(
    'lint', 'babel', 'chromeManifest',
    ['html', 'images', 'extras'],
    'size',
    cb
  );
});

gulp.task('buildFirefox', cb => {
  runSequence(
    'firefoxCopy',
    'firefoxManifest',
    'firefoxSize',
    cb
  );
});

gulp.task('build', (cb) => {
  runSequence('buildChrome', 'buildFirefox', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});

