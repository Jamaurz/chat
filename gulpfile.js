var gulp = require('gulp');
var less = require('gulp-less');
var jade = require('gulp-jade');
var autoprefixer = require('gulp-autoprefixer');

gulp.task("less", function(){
    return gulp.src('public/stylesheets/less/**/*.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('public/stylesheets/css'))
})

gulp.task("jade",function(){
     return gulp.src('public/partials/jade/**/*.jade')
        .pipe(jade())
        .pipe(gulp.dest('public/partials/html'));
})

gulp.task('watch',function(){
    gulp.watch('public/stylesheets/less/**/*.less', ['less']);
    gulp.watch('public/partials/jade/**/*.jade', ['jade']);
})