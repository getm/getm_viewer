const path = require('path');

const config = {
    entry: ['./src/index.ts'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'map.bundle.js'
    },
    resolve: { extensions: ['.ts', '.js'] },
    module: {
        rules: [
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {test: /\.ts$/, use: 'awesome-typescript-loader'}
        ]
    },
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