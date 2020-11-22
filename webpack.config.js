module.exports = {
    entry: [
        `${__dirname}/public/main-holy-persons.js`
    ],
    mode: 'development',
    module: {
        rules: [
          {
            test: /\.(js)$/,
            exclude: /node_modules/,
            use: ['babel-loader']
          }
        ]
      },
    resolve: {
        extensions: ['*', '.js']
    },
    output: {
      path: `${__dirname}/public/libs`,
      filename: 'bundle.js',
    },
  };