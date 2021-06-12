/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import LessPluginAutoPrefix from 'less-plugin-autoprefix';
import { dependencies as externals } from '../../app/package.json';

export default {
  externals: [...Object.keys(externals || {})],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: {
                localIdentName: '[local]--[hash:base64:5]',
              },
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                plugins: [
                  new LessPluginAutoPrefix({
                    enable: true,
                    options: {
                      browsers: ['last 3 versions'],
                    },
                  }),
                ],
              },
              sourceMap: false,
            },
          },
        ],
      },
      {
        test: /\.(mp3)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 4096,
          name: '[name].[hash:8].[ext]',
        },
      },
    ],
  },

  output: {
    path: path.join(__dirname, '../../app'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.join(__dirname, '../../app'), 'node_modules'],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
  ],
};
