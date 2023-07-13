const { dp2px, sp2rem } = require('./src/utils/AndroidMeasurements')

/** @type {import('postcss').ProcessOptions & { plugins: PostCssLoaderPluginsOption }} */
module.exports = {
  // Add you postcss configuration here
  // Learn more about it at https://github.com/webpack-contrib/postcss-loader#config-files
  plugins: [
    "autoprefixer",
    "postcss-mixins",
    "postcss-simple-vars",
    "postcss-nesting",
    [
      "postcss-custom-unit",
      {
        units: [
          { from: 'dp', convert (value) { return `${dp2px(value)}px` } },
          { from: 'sp', convert (value) { return `${sp2rem(value)}rem` } },
        ],
      }
    ],
  ],
};

/** @typedef {{ [pluginName: string]: false | any }} PostCssLoaderPluginsObjectOption */
/** @typedef {(string | [string, any] | PostCssLoaderPluginsObjectOption)[]} PostCssLoaderPluginsArrayOption */
/** @typedef {PostCssLoaderPluginsObjectOption | PostCssLoaderPluginsArrayOption} PostCssLoaderPluginsOption */
