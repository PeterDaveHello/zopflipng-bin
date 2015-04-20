/*global afterEach,beforeEach,it*/
'use strict';

var assert = require('assert');
var execFile = require('child_process').execFile;
var fs = require('fs');
var path = require('path');
var binCheck = require('bin-check');
var BinBuild = require('bin-build');
var compareSize = require('compare-size');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var tmp = path.join(__dirname, 'tmp');

beforeEach(function () {
	mkdirp.sync(tmp);
});

afterEach(function () {
	rimraf.sync(tmp);
});

it('rebuild the zopflipng binaries', function (cb) {
	new BinBuild()
		.src('https://github.com/google/zopfli/archive/bce73e2c23dc57a252802e4a6df97aa675fcea81.zip')
		.cmd('mkdir -p ' + tmp)
		.cmd('make zopflipng && mv ./zopflipng ' + path.join(tmp, 'zopflipng'))
		.run(function (err) {
			assert(!err);
			assert(fs.statSync(path.join(tmp, 'zopflipng')).isFile());
			cb();
		});
});

it('return path to binary and verify that it is working', function (cb) {
	binCheck(require('../').path, ['--help'], function (err, works) {
		assert(!err);
		assert(works);
		cb();
	});
});

it('minify a PNG', function (cb) {
	var src = path.join(__dirname, 'fixtures/test.png');
	var dest = path.join(tmp, 'test.png');
	var args = [
		'--lossy_8bit',
		src,
		dest
	];

	execFile(require('../').path, args, function (err) {
		assert(!err);

		compareSize(src, dest, function (err, res) {
			assert(!err);
			assert(res[dest] < res[src]);
			cb();
		});
	});
});
