/** @type {"usage" | "entry" | false} */
const useBuiltIns = "usage"

/** @type {import('@babel/core').TransformOptions} */
export default {
  sourceType: (/** @type {'module'} **/ ('module')),
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false,
        useBuiltIns,
        corejs: process.env.npm_package_dependencies_core_js,
        include: [
          // promise polyfill alone doesn't work in IE,
          // needs this as well. see: vuejs/vue-cli#1642
          "es.array.iterator",
          // this is required for webpack code splitting, vuex etc.
          "es.promise",
          // this is needed for object rest spread support in templates
          // as vue-template-es2015-compiler 1.8+ compiles it to Object.assign() calls.
          "es.object.assign",
          // #2012 es.promise replaces native Promise in FF and causes missing finally
          "es.promise.finally"
        ]
      }
    ],
    "@vue/babel-preset-jsx"
  ],
  plugins: [
    "@babel/plugin-syntax-dynamic-import",
    [
      "@babel/plugin-proposal-decorators",
      {
        legacy: true
      }
    ],
    [
      "@babel/plugin-transform-runtime",
      {
        regenerator: useBuiltIns !== "usage",
        // polyfills are injected by preset-env, so no need to add them again
        corejs: false,
        helpers: useBuiltIns === "usage",
        version: process.env.npm_package_devDependencies__babel_runtime
      }
    ]
  ]
}
