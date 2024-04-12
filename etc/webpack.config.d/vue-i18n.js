/** @type {import('webpack').Configuration} */
export default {
  module: {
    rules: [
      {
        resourceQuery: /blockType=i18n/,
        type: 'javascript/auto',
        loader: '@intlify/vue-i18n-loader',
      }
    ]
  }
};
