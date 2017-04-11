const path = require('path')
const { HotModuleReplacementPlugin } = require('webpack')

module.exports = {
  entry: {
    hello_world: './examples/hello_world/index.tsx',
    counter: './examples/counter/index.tsx',
    dynamic_attribute: './examples/dynamic_attribute/index.tsx',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/assets',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    loaders: [{
      test: /\.tsx?$/,
      loader: 'ts-loader',
      query: {
        transpileOnly: true,
      },
      exclude: /node_modules/,
    }],
  },
  plugins: [
    new HotModuleReplacementPlugin(),
  ],
}
