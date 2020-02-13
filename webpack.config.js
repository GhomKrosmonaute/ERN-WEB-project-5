
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
            title: 'Webpack Teaching',
            template: 'src/index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/i,
                use: load('ts'),
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [
                    load('style'),
                    {
                        loader: load('css'),
                        options: {
                            sourceMap: true
                        }
                    }
                ]
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