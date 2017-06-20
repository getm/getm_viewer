const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
    entry: ['./src/index.ts'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'map.bundle.js'
    },
    resolve: { extensions: ['.ts', '.js'] },
    module: {
        rules: [
            {test: /\.css$/, use: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?-url'})},
            {test: /\.ts$/, use: 'awesome-typescript-loader'}
        ]
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     },
        //     include: /.js$/
        // }),
        new ExtractTextPlugin('map.bundle.css'),
    ]
};

module.exports = config; 