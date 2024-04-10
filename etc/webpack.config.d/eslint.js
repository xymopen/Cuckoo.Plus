const EslintWebpackPlugin = require('eslint-webpack-plugin')

/** @type {import('webpack').Configuration} */
module.exports = {
  plugins: [
    new EslintWebpackPlugin({
      extensions: [".tsx", ".ts", ".jsx", ".js", ".vue"],
    })
  ]
};
