import EslintWebpackPlugin from 'eslint-webpack-plugin'

/** @type {import('webpack').Configuration} */
export default {
  plugins: [
    new EslintWebpackPlugin({
      extensions: [".tsx", ".ts", ".jsx", ".js", ".vue"],
    })
  ]
};
