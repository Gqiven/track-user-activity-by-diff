import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    name: 'user_track_record',
    file: 'dist/user_track_record.js',
    format: 'umd'
  },
  plugins: [nodeResolve()]
};