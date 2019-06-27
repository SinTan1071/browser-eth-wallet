const webpack = require('webpack')
const path = require('path')
module.exports = {
    entry: './src/entry.build.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'browser-eth-wallet.min.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['babel-preset-env']
                }
            }
        }]
    }
}