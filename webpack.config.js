const path = require('path')
const { HotModuleReplacementPlugin } = require('webpack')

module.exports = {
  entry: {
    // examples
    hello_world: './examples/hello_world/index.tsx',
    counter: './examples/counter/index.tsx',
    dynamic_attribute: './examples/dynamic_attribute/index.tsx',
    toggle_visibility: './examples/toggle_visibility/index.tsx',
    two_elements: './examples/two_elements/index.tsx',

    // benchmarks
    change_one_of_50000: './benchmarks/change_one_of_50000/index.tsx',
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
