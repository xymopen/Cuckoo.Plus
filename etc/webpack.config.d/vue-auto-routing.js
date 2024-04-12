import VueAutoRoutingPlugin from 'vue-auto-routing/lib/webpack-plugin.js';

/** @type {import('webpack').Configuration} */
export default {
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
        enforce: (/** @type {'post'} */ ('post')),
        loader: './lib/route-loader.cjs'
      }
    ]
  }
};
