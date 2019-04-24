let path = require('path')

let conf = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: 'dist/'
    },
    module: {
        rules: [
            // {
            //     test: /\.(png|jpg|gif|svg)$/,
            //     use: [
            //         {
            //             loader: 'file-loader',
            //             options: {
            //                 name: '[name].[ext]',
            //                 outputPath: 'assets/cursors/',
            //             },
            //         },
            //     ],
            // },
            {
                test: /\.(png|jpg|gif|svg|cur)$/i,
                use: [
                    {
                        loader: 'url-loader',
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
};

module.exports = conf;