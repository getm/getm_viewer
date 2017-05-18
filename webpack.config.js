const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const config = {
    entry: ['./src/index.ts'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'map.bundle.js'
    },
    resolve: { extensions: ['.ts', '.js'] },
    module: {
        rules: [
            {test: /\.css$/, use: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader'})},
            {test: /\.ts$/, use: 'awesome-typescript-loader'}
        ]
    },
    plugins: [
        new ExtractTextPlugin('map.css'),
        new ExtractTextPlugin('getm.css')
    ],
    devServer: {
        inline: true,
        hot: true,
        port: 9002,
        contentBase: path.join(__dirname, "dist"),
    }
};

module.exports = config; 