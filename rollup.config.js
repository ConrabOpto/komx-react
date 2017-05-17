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
    external: ['knockout', 'react', 'prop-types', 'create-react-class'],
    globals: {
        knockout: 'ko',
        react: 'React',
        'prop-types': 'PropTypes',
        'create-react-class': 'createReactClass'
    },
    moduleName: 'komx-react',
    targets: [
        { dest: 'dist/komx-react.umd.js', format: 'umd' },
        { dest: 'dist/komx-react.es.js', format: 'es' }
    ],
};
