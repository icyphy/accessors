console.log("Building cordova bundle in ./cordovaDist");
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  //for now using default context
  //context: path.join(__dirname, 'your-app'),
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
       {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], //Works for web app
        // use: ['style-loader/url', 'css-loader'],
      },
      {
        //CSS loads assets relative to itself
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath:'./' //correct for both versions
            },
          }
        ]
      },
      {
        //js loads assets relative to the HTML
        test: /\.(png|jpg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              // publicPath: '', //correct for web
              publicPath: 'file:///android_asset/www/', //correct for app
            },
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
            "style-loader", // creates style nodes from JS strings
            "css-loader", // translates CSS into CommonJS
            "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      }
    ]
  },
  resolve: {
    modules:[ path.resolve( __dirname,'src') , 'node_modules'],
    extensions: ['*', '.js', '.jsx', ".css"]
  },
  output: {
    path: __dirname + '/cordovaDist',
    publicPath: '/', //This version worked for the web app
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    //Copies static directory into dist
    new CopyWebpackPlugin([
        { from: 'static' }
    ])
  ]
};