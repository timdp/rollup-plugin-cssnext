const postcss = require('postcss')
const presetEnv = require('postcss-preset-env')
const cssnano = require('cssnano')
const { createFilter } = require('rollup-pluginutils')

const RE_VAR = /([\s\S]*?)\bvar\(--([A-Za-z0-9_\-.[]$]+)\)/g

const RE_FIRST = /^[^.[]]*/

const toProps = path =>
  path.replace(RE_FIRST, name => `[${JSON.stringify(name)}]`)

const toRenderFunc = (css, name = 'data') => {
  let res = ''
  let idx = 0
  let match
  while ((match = RE_VAR.exec(css)) != null) {
    res += JSON.stringify(match[1]) + ' + ' + name + toProps(match[2]) + ' + '
    idx = match.index + match[0].length
  }
  res += JSON.stringify(css.substr(idx)) + ';'
  return `function (${name}) { return ${res} }`
}

const toFunctionNode = ({ css }) =>
  `var render = ${toRenderFunc(css)};\nexport default render;`

const toCssNode = ({ css, map }, enableSourceMaps) => {
  return {
    code: `var css = ${JSON.stringify(css)}; export default css;`,
    map: enableSourceMaps && map ? JSON.parse(map) : { mappings: '' }
  }
}

module.exports = (options = {}) => {
  const filter = createFilter(options.include, options.exclude)
  const plugins = [presetEnv(options.presetEnvOptions)]
  if (options.minify) {
    plugins.push(cssnano({ autoprefixer: false }))
  }
  const processor = postcss(plugins)
  const transform = options.dynamic ? toFunctionNode : toCssNode
  return {
    name: 'cssnext',
    transform (code, id) {
      if (!filter(id)) {
        return null
      }
      return processor
        .process(code, options.postcssOptions)
        .then(result => transform(result, options.sourceMap))
    }
  }
}
