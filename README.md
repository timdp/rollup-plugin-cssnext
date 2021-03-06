# rollup-plugin-cssnext

[![npm](https://img.shields.io/npm/v/rollup-plugin-cssnext.svg)](https://www.npmjs.com/package/rollup-plugin-cssnext) [![Dependencies](https://img.shields.io/david/timdp/rollup-plugin-cssnext.svg)](https://david-dm.org/timdp/rollup-plugin-cssnext) [![JavaScript Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://standardjs.com/)

Easy integration between [Rollup](http://rollupjs.org/) and [postcss-preset-env](https://preset-env.cssdb.org/).

## Installation

```bash
npm install --save-dev rollup-plugin-cssnext
```

## Usage

First, configure Rollup:

```js
import cssnext from 'rollup-plugin-cssnext'

const rollupOptions = {
  plugins: [
    cssnext({
      include: '**/*.css',
      exclude: null,
      dynamic: true,
      minify: true
    })
  ]
}
```

Then, import a CSS file as a string:

```js
import style from './style.css'

console.log(style)
```

## Options

### `minify`

Minify CSS using [cssnano](http://cssnano.co/). Default: `false`.

### `dynamic`

Return a template function instead of a string. Default: `false`.

The template function takes a single argument containing the replacements for
every `var()` in the CSS. For example, take the following CSS:

```css
:root {
  --bgColor: brown;
}

body {
  background-color: var(--bgColor);
  color: var(--fgColor);
}
```

With `{ dynamic: true }`, you'd use this stylesheet as follows:

```js
import buildCss from './style.css'

const styleSheet = buildCss({
  fgColor: 'white'
})
console.log(styleSheet)
```

### `include` and `exclude`

From [rollup-pluginutils](https://github.com/rollup/rollup-pluginutils#createfilter).

### `postcssOptions`

Options for [postcss](http://postcss.org/).

### `presetEnvOptions`

Options for [postcss-preset-env](https://preset-env.cssdb.org/).

## Author

[Tim De Pauw](https://github.com/timdp)

## License

MIT
