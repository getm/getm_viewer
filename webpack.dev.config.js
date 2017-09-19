const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
    entry: ['whatwg-fetch', './src/index.tsx'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'map.bundle.js'
    },
    resolve: { 
        modules: [path.resolve('./'), 'node_modules', 'assests'],
        extensions: [
            '.js',
            '.jsx',
            '.ts',
            '.tsx'
        ] 
    },
    module: {
        rules: [
            {test: /\.css$/, use: ExtractTextPlugin.extract({fallback: "style-loader", use: "css-loader?-url"})},
            {test: /\.scss$/, use: ExtractTextPlugin.extract({fallback: "style-loader", use: ["css-loader?-url", "resolve-url-loader", "sass-loader?sourceMap"]})},
            {test: /\.(ts|tsx)$/, exclude: [/node_modules|lib|old/], use: 'awesome-typescript-loader'},
            {test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: "url-loader?limit=10000&mimetype=application/font-woff" },
            {test: /\.(ttf|svg|woff|woff2|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: "file-loader?name=[name].[ext]" }
        ]
    },
    plugins: [
        new ExtractTextPlugin('map.bundle.css'),
    ],

    devtool: 'cheap-module-source-map',
    devServer: {
        inline: true,
        hot: true,
        port: 9002,
        contentBase: path.join(__dirname, "dist"),
        stats: {
            chunks: false,
            colors: true,
            errorDetails: true
        },
        proxy: {
            '/GeoServerRest/**/*': {
                target: 'http://localhost:8080/',
                changeOrigin: true
            },
            '/product/**/*': {
                target: 'http://localhost:8080/',
                changeOrigin: true
            },
            '/geoserver/**/*': {
                target: 'http://localhost:8080/',
                changeOrigin: true
            }
        }
    }
};

module.exports = config;