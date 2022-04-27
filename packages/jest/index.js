/* eslint-disable @typescript-eslint/no-var-requires */
const { createTransformer } = require('@swc/jest')
const { extname } = require('path')

const skipTypes = /(css|less|sass|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)/

const transformer = createTransformer({
  jsc: {
    parser: {
      syntax: 'typescript',
      tsx: true,
    },
    target: 'es2019',
    transform: { react: { runtime: 'automatic' } },
  }
})

module.exports = {
  process (src, filename, options) {
    if (filename.endsWith('.js'))
      return src

    if (skipTypes.test(extname(filename)))
      return ''

    return transformer.process(src, filename, options)
  },
  processAsync(src, filename, options) {
    if (filename.endsWith('.js'))
      return Promise.resolve(src)

    if (skipTypes.test(extname(filename)))
      return Promise.resolve('')

    return transformer.processAsync(src, filename, options)
  },
  getCacheKey (src, filename, ...rest) {
    return transformer.getCacheKey(src, filename, ...rest)
  }
}
