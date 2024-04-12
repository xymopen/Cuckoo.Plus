import CopyWebpackPlugin from "copy-webpack-plugin";

/** @type {import('webpack').Configuration} */
export default {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        "public"
      ]
    })
  ]
};
