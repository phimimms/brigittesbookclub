/*
  eslint-disable
    @typescript-eslint/explicit-function-return-type,
    @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, prefer-named-capture-group
*/
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = function() {
  const isDev = (process.env.NODE_ENV === 'development');

  const preprocessLoader = `preprocess-loader?${isDev ? '+DEVELOPMENT' : ''}`;

  if (process.env.PROJECT_SRC === 'svr') {

    /* Server Configuration */
    return {
      entry: './src/server/index',

      externals: [ nodeExternals() ],

      module: {
        rules: [
          {
            exclude: /node_modules/u,
            test: /\.ts$/u,
            use: [
              { loader: 'awesome-typescript-loader' },
              { loader: preprocessLoader },
            ],
          },
        ],
      },

      node: {
        __dirname: false,
      },

      output: {
        filename: 'server.js',
        libraryTarget: 'commonjs',
        path: path.join(__dirname, 'build'),
      },

      plugins: getServerPlugins(isDev),

      resolve: {
        extensions: [ '.js', '.json', '.ts' ],
        modules: [
          path.join(__dirname, 'src/server'),
          path.join(__dirname, 'src/shared'),
          'node_modules',
        ],
      },

      stats: 'errors-only',

      target: 'node',

      watch: isDev,
    };
  }

  /* Application Configuration */
  return {
    devServer: {
      compress: true,
      historyApiFallback: true,
      hot: true,
      inline: true,
      port: 3001,
      proxy: {
        '/v1': 'http://localhost:3000',
      },
      stats: 'errors-only',
      watchOptions: {
        ignored: [
          'src/server/**/*.ts',
          'node_modules',
        ],
      },
    },

    devtool: isDev ? 'inline-source-map' : 'source-map',

    entry: {
      app: './src/client/index.ts',
    },

    module: {
      rules: [
        {
          test: /\.(css|scss)$/u,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: isDev,
              },
            },
            { loader: 'css-loader' },
            {
              loader: 'postcss-loader',
            },
          ],
        },
        {
          loader: 'file-loader',
          test: /\.(eot|svg|ttf)(\?[a-z0-9]+)?$/u,
        },
        {
          test: /\.(gif|jpg|png)$/u,
          use: [
            {
              loader: 'url-loader',
              options: { limit: 8192 },
            },
          ],
        },
        {
          exclude: /node_modules/u,
          test: /\.svelte$/u,
          use: [
            {
              loader: 'svelte-loader',
              options: {
                emitCss: true,
                preprocess: require('svelte-preprocess')({
                  postcss: true,
                  typescript: true,
                }),
              },
            },
            {
              loader: preprocessLoader,
            },
          ],
        },
        {
          exclude: /node_modules/u,
          test: /\.ts$/u,
          use: [
            { loader: 'awesome-typescript-loader' },
            { loader: preprocessLoader },
          ],
        },
        {
          loader: 'url-loader?limit=10000&mimetype=application/font-woff',
          test: /\.woff(2)?(\?[a-z0-9]+)?$/u,
        },
      ],
    },

    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: 'all',
            minChunks: 2,
            name: 'vendor',
            test: /node_modules/u,
          },
        },
      },
    },

    output: {
      filename: '[name].[hash].js',
      path: path.join(__dirname, 'public'),
      publicPath: '/',
    },

    plugins: getApplicationPlugins(isDev),

    resolve: {
      extensions: [ '.ts', '.mjs', '.svelte', '.js', '.json' ],
      mainFields: [ 'svelte', 'browser', 'module', 'main' ],
      modules: [
        path.join(__dirname, 'src/app'),
        path.join(__dirname, 'src/shared'),
        'node_modules',
      ],
    },

    stats: 'minimal',

    target: 'web',
  };
};

function getApplicationPlugins(isDev) {
  const plugins = [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: 'body',
      template: path.join(__dirname, 'src/client/index.html'),
    }),
    new MiniCssExtractPlugin({
      chunkFilename: '[id].css',
      filename: '[name].[hash].css',
    }),
  ];

  if (isDev) {
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  return plugins;
}

function getServerPlugins(isDev) {
  const plugins = [];

  if (isDev) {
    plugins.push(new WebpackShellPlugin({ onBuildEnd: 'npm run start:dev' }));
  }

  return plugins;
}
