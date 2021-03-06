import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import { action, observable, computed } from 'komx';
import observer from '../src/observer';
import inject from '../src/inject';
import Provider from '../src/Provider';
import ko from 'knockout';

const testRoot = document.createElement('div');
testRoot.id = 'testroot';
window.document.body.appendChild(testRoot);

describe('inject based context', () => {
    test('basic context', () => {
        const C = inject('foo')(observer(createReactClass({
            render() {
                return <div>context:{ this.props.foo }</div>
            }
        })));
        const B = () => <C />;
        const A = () =>
            <Provider foo='bar'>
            <B />
            </Provider>;
        const wrapper = mount(<A />);
        expect(wrapper.find('div').text()).toBe('context:bar');
    });

    test('props override context', () => {
        const C = inject('foo')(createReactClass({
            render() {
                return <div>context:{ this.props.foo }</div>
            }
        }));
        const B = () => <C foo={ 42 } />
            const A = createReactClass({
                render: () =>
                    <Provider foo='bar'>
                    <B />
                    </Provider>
            });
        const wrapper = mount(<A />);
        expect(wrapper.find('div').text()).toBe('context:42');
    });

    test('overriding stores is supported', () => {
        const C = inject('foo', 'bar')(observer(createReactClass({
            render() {
                return <div>context:{ this.props.foo }{ this.props.bar }</div>
            }
        })));
        const B = () => <C />
            const A = createReactClass({
                render: () =>
                    <Provider foo='bar' bar={1337}>
                    <div>
                    <span>
                    <B />
                    </span>
                    <section>
                    <Provider foo={42}>
                    <B />
                    </Provider>
                    </section>
                    </div>
                    </Provider>
            });
        const wrapper = mount(<A />);
        expect(wrapper.find('span').text()).toBe('context:bar1337');
        expect(wrapper.find('section').text()).toBe('context:421337');
    });

    test('store should be available', () => {
        const C = inject('foo')(observer(createReactClass({
            render() {
                return <div>context:{ this.props.foo }</div>
            }
        })));
        const B = () => <C />
            const A = createReactClass({
                render: () =>
                    <Provider baz={42}>
                    <B />
                    </Provider>
            });
        expect(() => mount(<A />)).toThrow( /Store 'foo' is not available! Make sure it is provided by some Provider/);
    });

    test('store is not required if prop is available', () => {
        const C = inject('foo')(observer(createReactClass({
            render() {
                return <div>context:{ this.props.foo }</div>
            }
        })));
        const B = () => <C  foo='bar'/>;
        const wrapper = mount(<B />);
        expect(wrapper.find('div').text()).toBe('context:bar');
    });

    test('support static hoisting, wrappedComponent and wrappedInstance', () => {
        const B = createReactClass({
            render() {
                this.testField = 1;
                return null;
            },
            propTypes: {
                'x': PropTypes.object
            }
        })
        B.bla = 17;
        B.bla2 = {};
        const C = inject('booh')(B);

        expect(C.wrappedComponent).toBe(B);
        expect(B.bla).toBe(17);
        expect(C.bla).toBe(17);
        expect(C.bla2 === B.bla2).toBe(true);
        expect(Object.keys(C.wrappedComponent.propTypes)).toEqual(['x']);

        const wrapper = mount(<C booh={ 42 } />);
        expect(wrapper.root.nodes[0].wrappedInstance.testField).toBe(1);
    });

    test('warning is printed when attaching contextTypes to HOC', () => {
        const msg = [];
        const baseWarn = console.warn;
        console.warn = m => msg.push(m);
        const C = inject(['foo'])(createReactClass({
            displayName: 'C',
            render() {
                return <div>context:{ this.props.foo }</div>;
            }
        }));
        C.propTypes = {};
        C.defaultProps = {};
        C.contextTypes = {};

        const B = () => <C />;
        const A = () =>
              <Provider foo='bar'>
              <B />
              </Provider>;
        mount(<A />);
        expect(msg.length).toBe(1);
        expect(msg[0]).toBe("Injector: you are trying to attach `contextTypes` on an component decorated with `inject` (or `observer`) HOC. Please specify the contextTypes on the wrapped component instead. It is accessible through the `wrappedComponent`");
        console.warn = baseWarn;
    });

    test('warning is not printed when attaching propTypes to injected component', () => {
        let msg = [];
        const baseWarn = console.warn;
        console.warn = m => msg = m;

        const C = inject(["foo"])(createReactClass({
            displayName: 'C',
            render: () => <div>context:{ this.props.foo }</div>
        }));
        C.propTypes = {};

        expect(msg.length).toBe(0);
        console.warn = baseWarn;
    })

    test('warning is not printed when attaching propTypes to wrappedComponent', () => {
        let msg = [];
        const baseWarn = console.warn;
        console.warn = m => msg = m;
        const C = inject(["foo"])(createReactClass({
            displayName: 'C',
            render: () => <div>context:{ this.props.foo }</div>
        }))
        C.wrappedComponent.propTypes = {};

        expect(msg.length).toBe(0);
        console.warn = baseWarn;
    });
});
