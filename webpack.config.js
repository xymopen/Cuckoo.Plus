// Generated using webpack-cli https://github.com/webpack/webpack-cli

import { resolve as pathResolve } from 'path';
const resolve = pathResolve.bind(undefined, import.meta.dirname);

// import getTargets from '@babel/helper-compilation-targets';

import webpack from 'webpack';
import { merge } from 'webpack-merge';
import HtmlWebpackPlugin from "html-webpack-plugin";
import { GenerateSW } from "workbox-webpack-plugin";
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : "vue-style-loader";

import PublicConfig from './etc/webpack.config.d/public.js';
import ForkTsCheckerConfig from './etc/webpack.config.d/fork-ts-checker.js';
import VueAutoRoutingConfig from './etc/webpack.config.d/vue-auto-routing.js';
import VueI18nConfig from './etc/webpack.config.d/vue-i18n.js';
import VueConfig from './etc/webpack.config.d/vue.js';
import AssetsConfig from './etc/webpack.config.d/assets.js';

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
        exclude: [/([/\\])node_modules\1/],
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
        exclude: [/([/\\])node_modules\1/],
      },
      {
        test: /\.(jsx?)$/i,
        loader: "babel-loader",
        exclude: {
          and: [/([/\\])node_modules\1/],
          not: /muse-ui(-loading|-message|-toast)?/
        },
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
    alias: {
      "muse-ui$": "muse-ui/src/index.js",
      "muse-ui/lib": "muse-ui/src",
      "muse-ui-loading$": "muse-ui-loading/src/index.js",
      "muse-ui-message$": "muse-ui-message/src/index.js",
      "muse-ui-toast$": "muse-ui-toast/src/index.js"
    },
    extensions: [".ts", ".js"],
    plugins: [new TsconfigPathsPlugin({
      extensions: [".tsx", ".ts", ".jsx", ".js", ".vue"],
    })],
  },
  externals: {
    // todo muse ui has bug
  },
};

/** @type {import('webpack-cli').CallableOption} */
const callback = (env, argv) => {
  /** @type {import('webpack').Configuration[]} */
  const overrides = [{
    plugins: [
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn|zh-hk|zh-tw|ja|de/)
    ]
  }];

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
    // ForkTsCheckerConfig,
    VueAutoRoutingConfig,
    VueI18nConfig,
    VueConfig(env, argv),
    AssetsConfig,
    ...overrides
  );
}

export default callback;
