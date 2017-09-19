const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
    entry: ['whatwg-fetch', './src/index.tsx'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'map.bundle.js'
    },
    resolve: {  
        modules: [path.resolve('./'), 'node_modules'],       
        extensions: [
            '.js',
            '.jsx',
            '.ts',
            '.tsx'
        ] 
    },
    module: {
        rules: [
            {test: /\.css$/, use: ExtractTextPlugin.extract({use: "css-loader?-url"})},
            {test: /\.scss$/, use: ExtractTextPlugin.extract({fallback: "style-loader", use: ["css-loader?-url", "sass-loader?sourceMap"]})},
            {test: /\.(ts|tsx)$/, exclude: [/node_modules/], use: 'awesome-typescript-loader'},
            {test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: "url-loader?limit=10000&mimetype=application/font-woff" },
            {test: /\.(ttf|svg|woff|woff2|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: "file-loader?name=[name].[ext]" }
        ]
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     },
        //     include: /.js$/
        // }),
        new ExtractTextPlugin('map.bundle.css')
    ]
};

module.exports = config; 