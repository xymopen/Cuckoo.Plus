import { mergeWithRules } from 'webpack-merge';
import VueLoaderPlugin from 'vue-loader/lib/plugin-webpack5.js';
import nodeExternals from 'webpack-node-externals';

const merge = mergeWithRules({
  module: {
    rules: {
      test: 'match',
      use: {
        loader: "match",
        options: "merge"
      }
    }
  }
});

/** @type {import('webpack').Configuration} */
const config = {
  plugins: [
    new VueLoaderPlugin()
  ],
  module: {
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: { compilerOptions: { whitespace: 'condense' } }
      }
    ]
  },
  resolve: {
    alias: {
      "vue$": "vue/dist/vue.runtime.esm.js"
    },
    extensions: [".tsx", ".jsx", ".vue"]
  }
}

/** @return {import('webpack').Configuration} */
export default env => {
  if (env !== "test") {
    return config
  } else {
    return merge(config, {
      target: "node",
      externalsPresets: { node: true },
      externals: [nodeExternals()],

      // when target === 'node', vue-loader will attempt to generate
      // SSR-optimized code. We need to turn that off here.
      module: {
        rules: [
          {
            loader: "vue-loader",
            options: {
              optimizeSSR: false
            }
          }
        ]
      }
    })
  }
};
