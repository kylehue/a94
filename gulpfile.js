const gulp = require("gulp");
const nodemon = require("gulp-nodemon");
const cssuglify = require("gulp-uglifycss")
const autoprefixer = require("gulp-autoprefixer")
const htmlminify = require("gulp-minify-html");
const babel = require("gulp-babel");
const replace = require("gulp-replace");
const webpack = require("webpack-stream");

const paths = {
	client: {
		entry: "src/client/js/app.js",
		img: "src/client/assets/images/**/*.*",
		svg: "src/client/assets/svg/**/*.*",
		js: "src/client/**/*.js",
		css: "src/client/**/*.css",
		html: "src/client/index.html",
		all: "src/client/**/*.*"
	},
	server: {
		js: "src/server/**/*.js",
		all: "src/server/**/*.*"
	},
	lib: "src/lib/**/*.js"
};

const babelConfig = {
	presets: [
		[
			"@babel/preset-env", {
				forceAllTransforms: true
			}
		]
	]
};

gulp.task("move:client:entry", function() {
	return gulp.src([paths.client.entry])
		.pipe(webpack(require("./webpack.config.js")))
		.pipe(gulp.dest("dist/client/js/"));
});

gulp.task("move:client:js", function() {
	return gulp.src([paths.client.js, `!${paths.client.entry}`])
		.pipe(gulp.dest("dist/client/"));
});

gulp.task("move:client:css", function() {
	return gulp.src([paths.client.css])
		.pipe(gulp.dest("dist/client/"));
});

gulp.task("move:client:img", function() {
	return gulp.src([paths.client.img])
		.pipe(gulp.dest("dist/client/assets/images/"));
});

gulp.task("move:client:svg", function() {
	return gulp.src([paths.client.svg])
		.pipe(gulp.dest("dist/client/assets/svg/"));
});

gulp.task("move:client:html", function() {
	return gulp.src([paths.client.html])
		.pipe(gulp.dest("dist/client/"));
});

gulp.task("move:server:js", function() {
	return gulp.src([paths.server.js])
		.pipe(gulp.dest("dist/server/"));
});

gulp.task("move:lib", function() {
	return gulp.src([paths.lib])
		.pipe(gulp.dest("dist/lib/"));
});

gulp.task("client:entry", function() {
	return gulp.src([paths.client.entry])
		.pipe(webpack(require("./webpack.config.js")))
		.pipe(replace("__development__ = true", "__development__ = false"))
		.pipe(babel(babelConfig))
		.pipe(gulp.dest("dist/client/js/"));
});

gulp.task("client:js", function() {
	return gulp.src([paths.client.js, `!${paths.client.entry}`, "!src/client/lib/**/*.*"])
		.pipe(babel(babelConfig))
		.pipe(gulp.dest("dist/client/"));
});

gulp.task("client:css", function() {
	return gulp.src([paths.client.css])
		.pipe(autoprefixer())
		.pipe(cssuglify())
		.pipe(gulp.dest("dist/client/"));
});

gulp.task("client:img", function() {
	return gulp.src([paths.client.img])
		.pipe(gulp.dest("dist/client/assets/images/"));
});

gulp.task("client:svg", function() {
	return gulp.src([paths.client.svg])
		.pipe(gulp.dest("dist/client/assets/svg/"));
});

gulp.task("client:html", function() {
	return gulp.src([paths.client.html])
		.pipe(replace("lib/vue.dev.js", "lib/vue.prod.js"))
		.pipe(htmlminify())
		.pipe(gulp.dest("dist/client/"));
});

gulp.task("server:js", function() {
	return gulp.src([paths.server.js])
		.pipe(babel(babelConfig))
		.pipe(gulp.dest("dist/server/"));
});

gulp.task("lib", function() {
	return gulp.src([paths.lib])
		.pipe(babel(babelConfig))
		.pipe(gulp.dest("dist/lib/"));
});

gulp.task("build:client", gulp.series(["client:entry", "client:js", "client:css", "client:img", "client:svg", "client:html"]));

gulp.task("build:server", gulp.series(["server:js"]));

gulp.task("build:lib", gulp.series(["move:lib", "lib"]));

gulp.task("build", gulp.series(["build:server", "build:client", "build:lib"]));

gulp.task("move:client", gulp.series(["move:client:entry", "move:client:js", "move:client:css", "move:client:img", "move:client:svg", "move:client:html"]));

gulp.task("move:server", gulp.series(["move:server:js"]));

gulp.task("move", gulp.series(["move:server", "move:client", "move:lib"]));

gulp.task("watch", function() {
	gulp.watch([paths.client.all], gulp.series(["move:client"]));
	gulp.watch([paths.server.all], gulp.series(["move:server", "move:client"]));
	gulp.watch([paths.lib], gulp.series(["move:lib", "move:client"]));
});

gulp.task("run", gulp.series(["move"], function() {
	return nodemon({
		delay: 0,
		script: "server/server.js",
		cwd: "dist/"
	});
}));