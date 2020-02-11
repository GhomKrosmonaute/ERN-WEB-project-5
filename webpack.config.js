
const {CleanWebpackPlugin:CLEAN} = require('clean-webpack-plugin')
const HTML = require('html-webpack-plugin')
const path = require('path')

const load = name => name + '-loader'

module.exports = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new CLEAN(),
        new HTML({
            title: 'Webpack Teaching'
        })
    ],
    module: {
        rules: [{
                test: /\.tsx?$/i,
                use: load('ts'),
                exclude: /node_modules/,
            },
            {
                test: /\.s(?:c|a)ss$/i,
                use: [
                    load('style'),
                    {
                        loader: load('css'),
                        options: {
                            sourceMap: true
                        }
                    },
                    load('sass')
                ]
            },
            {
                test: /\.jpe?g$/i,
                use: load('file')
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
}