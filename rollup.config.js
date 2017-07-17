import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
    entry: 'src/index.js',
    plugins: [
        commonjs(),
        resolve({
            customResolveOptions: {
                moduleDirectory: 'node_modules',
            }
        }),
        babel({
            exclude: 'node_modules/**'
        })
    ],
    external: ['knockout', 'react'],
    globals: {
        knockout: 'ko',
        react: 'React'
    },
    moduleName: 'komx-react',
    targets: [
        { dest: 'dist/komx-react.umd.js', format: 'umd' },
        { dest: 'dist/komx-react.es.js', format: 'es' }
    ],
};
