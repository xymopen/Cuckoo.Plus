// Generated using webpack-cli https://github.com/webpack/webpack-cli

const { resolve: pathResolve } = require('path');
const resolve = pathResolve.bind(undefined, __dirname);

// const getTargets = require('@babel/helper-compilation-targets').default;

const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { GenerateSW } = require("workbox-webpack-plugin");
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : "vue-style-loader";

const PublicConfig = require('./etc/webpack.config.d/public');
const EslintConfig = require('./etc/webpack.config.d/eslint');
const ForkTsCheckerConfig = require('./etc/webpack.config.d/fork-ts-checker');
const VueAutoRoutingConfig = require('./etc/webpack.config.d/vue-auto-routing');
const VueI18nConfig = require('./etc/webpack.config.d/vue-i18n');
const VueConfig = require('./etc/webpack.config.d/vue');
const AssetsConfig = require('./etc/webpack.config.d/assets');

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
  ],
  module: {
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
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
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
    // ForkTsCheckerConfig,
    VueAutoRoutingConfig,
    VueI18nConfig,
    VueConfig(env),
    AssetsConfig,
    ...overrides
  );
};
