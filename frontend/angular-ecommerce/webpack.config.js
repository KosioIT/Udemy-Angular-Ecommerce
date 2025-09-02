import { merge } from 'webpack-merge';
import Dotenv from 'dotenv-webpack';

export default (config) => {
  return merge(config, {
    plugins: [
      new Dotenv()
    ]
  });
};
