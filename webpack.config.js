module.exports = {
    entry: {
        'app': './js/game.js'
    },
    output: {
        path: './js/',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                //tell webpack to use jsx-loader for all *.jsx files
                test: /.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader?stage=0&optional[]=runtime&optional[]=es7.comprehensions&loose=all'
            },
            {
                test: /\.styl/,
                loader: "style-loader!css-loader!stylus-loader"
            },
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.styl']
    }
};