module.exports = {
    entry: {
       'main-holy-persons' : `${__dirname}/public/main-holy-persons.js`,
       'main-churches' : `${__dirname}/public/main-churches.js`
    }
     
    ,
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
      filename: '[name].js',
    },
  };