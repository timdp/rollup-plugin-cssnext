import postcss from 'postcss'
import cssnext from 'postcss-cssnext'
import cssnano from 'cssnano'
import {createFilter} from 'rollup-pluginutils'

const RE_VAR = /([\s\S]*?)\bvar\(--([A-Za-z0-9_\-.\[\]$]+)\)/g

const RE_FIRST = /^[^.\[\]]*/

const toProps = (path) => path.replace(RE_FIRST, (name) => `[${JSON.stringify(name)}]`)

const parseVars = (css, name = 'data') => {
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

const toFunctionNode = ({css}) => {
  const code = 'export default ' + parseVars(css)
  const ast = {
    type: 'Program',
    sourceType: 'module',
    start: 0,
    end: null,
    body: []
  }
  return {ast, code, map: {mappings: ''}}
}

const toCssNode = ({css, map}, enableSourceMaps) => {
  return {
    code: 'export default ' + JSON.stringify(css) + ';',
    map: (enableSourceMaps && map)
      ? JSON.parse(map)
      : {mappings: ''}
  }
}

export default function (options = {}) {
  const filter = createFilter(options.include, options.exclude)
  const plugins = [cssnext(options.cssnextOptions)]
  if (options.minify) {
    plugins.push(cssnano({autoprefixer: false}))
  }
  const processor = postcss(plugins)
  const transform = options.dynamic ? toFunctionNode : toCssNode
  return {
    name: 'cssnext',
    transform (code, id) {
      if (!filter(id)) {
        return null
      }
      return processor.process(code, options.postcssOptions)
        .then((result) => transform(result, options.sourceMap))
    }
  }
}
