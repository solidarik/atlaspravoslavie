import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const params = {
  entry: {
    'main-holy-persons': `${__dirname}/public/main-holy-persons.js`,
    'main-temples': `${__dirname}/public/main-temples.js`,
    'main-video': `${__dirname}/public/main-video.js`,
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
}

export default params