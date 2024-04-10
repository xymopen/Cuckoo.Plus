const CopyWebpackPlugin = require("copy-webpack-plugin");

/** @type {import('webpack').Configuration} */
module.exports = {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        "public"
      ]
    })
  ]
};
