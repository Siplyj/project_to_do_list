const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const autoprefixer = require('gulp-autoprefixer');
const csscomb = require('gulp-csscomb');

// gulp.task('clean', function() {
//   return del('prod');
// });

gulp.task('styles', function() {
  return gulp.src('src/styles/**/*.css')
    .pipe(autoprefixer())
    .pipe(csscomb())
    .pipe(gulp.dest('prod/styles'));
});

gulp.task('scripts', function() {
  return gulp.src('src/scripts/**/*.js')
    .pipe(gulp.dest('prod/scripts'));
});

gulp.task('assets', function() {
  return gulp.src('src/assets/**')
    .pipe(gulp.dest('prod'));
});

gulp.task('watch', function() {
  gulp.watch('src/styles/**/*.css', gulp.series('styles'));
  gulp.watch('src/scripts/**/*.js', gulp.series('scripts'));
  gulp.watch('src/assets/**', gulp.series('assets'));
});

gulp.task('serve', function() {
  browserSync.init({
    server: 'prod'
  });
  browserSync.watch('prod/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev', gulp.series('styles', 'assets', 'scripts',
  gulp.parallel('watch', 'serve')));