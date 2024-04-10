// Generated using webpack-cli https://github.com/webpack/webpack-cli

const { resolve: pathResolve } = require('path');
const resolve = pathResolve.bind(undefined, __dirname);

// const getTargets = require('@babel/helper-compilation-targets').default;

const webpack = require('webpack');
const { mergeWithRules } = require('webpack-merge');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin-webpack5');
const VueAutoRoutingPlugin = require('vue-auto-routing/lib/webpack-plugin');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { GenerateSW } = require("workbox-webpack-plugin");
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require('webpack-node-externals');

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : "vue-style-loader";

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

const PublicConfig = require('./etc/webpack.config.d/public');
const EslintConfig = require('./etc/webpack.config.d/eslint');

/** @type {import('webpack').Configuration & { devServer: import('webpack-dev-server').Configuration }} */
const config = {
  entry: "./src/index.ts",
  output: {
    path: resolve("dist"),
    filename: "js/[name].js",
    chunkFilename: "js/[name].js",
    clean: true,
  },
  devServer: {
    open: true,
    host: "localhost",
  },
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      ...Object.fromEntries(
        Object.entries(process.env)
          .filter(([key]) => key.startsWith("npm_"))
          .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
      ),
    }),
    new HtmlWebpackPlugin({
      scriptLoading: 'defer',
      templateParameters: (compilation, assets, assetTags, pluginOptions) => {
        // enhance html-webpack-plugin's built in template params
        return {
          compilation: compilation,
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            tags: assetTags,
            files: assets,
            options: pluginOptions,
          },
          ANALYTICS_SCRIPT: process.env.ANALYTICS_SCRIPT ?? "",
        }
      },
      template: "index.html",
    }),
    new VueLoaderPlugin(),
    new VueAutoRoutingPlugin({
      // Path to the directory that contains your page components.
      pages: 'src/pages',

      // A string that will be added to importing component path (default @/pages/).
      importPrefix: '@/pages/'
    }),
    // disable for now for too many errors
    // new ForkTsCheckerWebpackPlugin({
    //   typescript: {
    //     diagnosticOptions: {
    //       semantic: true,
    //       syntactic: false,
    //     },
    //   },
    // }),
  ],
  module: {
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
      {
        test: /\.ts$/i,
        use: [
          "babel-loader",
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              appendTsSuffixTo: ['\\.vue$'],
            },
          },
        ],
        exclude: ["/node_modules/"],
      },
      {
        test: /\.tsx$/i,
        use: [
          "babel-loader",
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              appendTsxSuffixTo: ['\\.vue$'],
            },
          },
        ],
        exclude: ["/node_modules/"],
      },
      {
        test: /\.(jsx?)$/i,
        loader: "babel-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.less$/i,
        use: [
          stylesHandler,
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: false,
                plugins: ["autoprefixer"],
              },
            },
          },
          "less-loader",
        ],
      },
      {
        test: /\.p(ost)?css$/i,
        use: [
          stylesHandler,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          "postcss-loader",
        ],
      },
      {
        test: /\.css$/i,
        use: [
          stylesHandler,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: false,
                plugins: ["autoprefixer"],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: "asset",
        generator: { filename: 'img/[name].[hash:8][ext]' },
      },
      {
        test: /\.(svg)$/i,
        type: "asset/resource",
        generator: { filename: 'img/[name].[hash:8][ext]' },
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/i,
        type: "asset",
        generator: { filename: 'fonts/[name].[hash:8][ext]' },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: { compilerOptions: { whitespace: 'condense' } },
      },
      {
        resourceQuery: /blockType=i18n/,
        type: 'javascript/auto',
        loader: '@intlify/vue-i18n-loader',
      },

      {
        resourceQuery: [/blockType=route/, /blockType=route-meta/],
        enforce: 'post',
        loader: './lib/route-loader',
      },
    ],
  },
  resolve: {
    alias: {
      "vue$": "vue/dist/vue.runtime.esm.js",
    },
    extensions: [".tsx", ".ts", ".jsx", ".js", ".vue"],
    plugins: [new TsconfigPathsPlugin({
      extensions: [".tsx", ".ts", ".jsx", ".js", ".vue"],
    })],
  },
  externals: {
    'moment': 'moment',
    'underscore': '_',
    // todo muse ui has bug
  },
};

module.exports = env => {
  /** @type {import('webpack').Configuration[]} */
  const overrides = [];

  if (env === "test") {
    overrides.push({
      target: "node",
      externalsPresets: { node: true },
      // @ts-ignore
      externals: [nodeExternals()],

      // when target === 'node', vue-loader will attempt to generate
      // SSR-optimized code. We need to turn that off here.
      // @ts-ignore
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

  if (isProduction) {
    overrides.push({
      mode: "production",
      devtool: false,

      plugins: [
        new MiniCssExtractPlugin(),
        // @ts-ignore
        new GenerateSW({
          additionalManifestEntries: [
            'https://fonts.loli.net/css?family=Open+Sans',
            'https://fonts.loli.net/icon?family=Material+Icons',
            'https://cdnjs.loli.net/ajax/libs/moment.js/2.22.2/moment.min.js',
            'https://cdnjs.loli.net/ajax/libs/moment.js/2.22.2/locale/zh-cn.js',
            'https://cdnjs.loli.net/ajax/libs/moment.js/2.22.2/locale/zh-hk.js',
            'https://cdnjs.loli.net/ajax/libs/moment.js/2.22.2/locale/zh-tw.js',
            'https://cdnjs.loli.net/ajax/libs/moment.js/2.22.2/locale/ja.js',
            'https://cdnjs.loli.net/ajax/libs/underscore.js/1.9.1/underscore-min.js',
            'https://unpkg.com/muse-ui/dist/muse-ui.css',
            'https://gstatic.loli.net/s/materialicons/v46/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
          ],
          // workbox-webpack-plugin has some issues
          // babelPresetEnvTargets: getTargets(),
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
        })
      ]
    })
  } else {
    overrides.push({
      mode: "development",
      devtool: "source-map"
    })
  }
  return merge(
    config,
    PublicConfig,
    // disable for now for too many errors
    // EslintConfig,
    ...overrides
  );
};
