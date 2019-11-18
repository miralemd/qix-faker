const path = require('path');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const { terser } = require('rollup-plugin-terser');

const { name, version, author, license } = require('./package.json');

const banner = `/*
 * ${name} v${version}
 * Copyright (c) ${new Date().getFullYear()} ${author}
 * Released under the ${license} license
 */ 
`;

const cfg = {
  input: path.resolve('lib', 'index'),
  output: {
    file: path.resolve(__dirname, 'dist', 'qix-faker.umd.js'),
    format: 'umd',
    name: 'qixFaker',
    exports: 'named',
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({
      babelrc: false,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            targets: {
              browsers: ['last 2 Chrome versions', 'last 2 Firefox versions', 'last 2 Edge versions'],
            },
          },
        ],
      ],
      plugins: [],
    }),
    terser({
      output: {
        preamble: banner,
      },
    }),
  ],
};

module.exports = cfg;
