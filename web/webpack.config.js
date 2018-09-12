const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: {
    index: './index.js',
    views: './views/index.js',
    containers: './containers/index.js'
  },
  mode: "production",

  output: {
    path: __dirname + '/../public/components',
    filename: '[name].bundle.js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "all",
          minChunks: 2
        }
      }
    }
  },

  /*devServer: {
      inline: true,
      port: 7777,
      contentBase: __dirname + '/public/'
  },*/
  resolve: {
    modules: [__dirname, 'node_modules', 'web'],
    extensions: ['*', '.js', '.jsx', '.css']
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ['env', 'stage-1', 'react']
        }
      },
      {
        test: /\.css$/,
        // use: ExtractTextPlugin.extract({
        //     fallback: "style-loader",
        //     use: "css-loader"
        // })
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'url-loader'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'url-loader'
        ]
      }
      // {
      //     test: /\.(svg)$/,
      //     use: ['babel-loader', 'react-svg-loader']
      // },
      // {
      //     test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      //     use: ["url-loader?limit=10000&mimetype=application/font-woff"]
      // },
      // {test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: "url-loader"}
      // {
      //     test: /\.(ttf|eot|woff|woff2)$/,
      //     use: ["url-loader"]
      // }
      // {
      //     test: /\.(woff|woff2|ttf|eot|ico)(\?|$)/,
      //     use: ['url-loader']
      // }
    ]
  }
};