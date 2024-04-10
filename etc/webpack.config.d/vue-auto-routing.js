const VueAutoRoutingPlugin = require('vue-auto-routing/lib/webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  plugins: [
    new VueAutoRoutingPlugin({
      // Path to the directory that contains your page components.
      pages: 'src/pages',

      // A string that will be added to importing component path (default @/pages/).
      importPrefix: '@/pages/'
    })
  ],
  module: {
    rules: [
      {
        resourceQuery: [/blockType=route/, /blockType=route-meta/],
        enforce: 'post',
        loader: './lib/route-loader'
      }
    ]
  }
};
