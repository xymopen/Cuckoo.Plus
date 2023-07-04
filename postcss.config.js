/** @type {import('postcss').ProcessOptions & { plugins: PostCssLoaderPluginsOption }} */
module.exports = {
  // Add you postcss configuration here
  // Learn more about it at https://github.com/webpack-contrib/postcss-loader#config-files
  plugins: ["autoprefixer"],
};

/** @typedef {{ [pluginName: string]: false | any }} PostCssLoaderPluginsObjectOption */
/** @typedef {(string | [string, any] | PostCssLoaderPluginsObjectOption)[]} PostCssLoaderPluginsArrayOption */
/** @typedef {PostCssLoaderPluginsObjectOption | PostCssLoaderPluginsArrayOption} PostCssLoaderPluginsOption */
