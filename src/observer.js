import React, { Component } from 'react';
import ko from 'knockout';

const reactiveMixin = {
    componentWillMount() {
        const initialName = this.displayName
              || this.name
              || (this.constructor && (this.constructor.displayName || this.constructor.name))
              || "<component>";

        const baseRender = this.render.bind(this);
        const self = this;
        self.$ko = {};

        this.render = function () {
            return ko.ignoreDependencies(function () {
                let hasRendered = false;
                let rendering;

                self.$ko.computed = ko.computed(function () {
                    if (!hasRendered) {
                        hasRendered = true;
                        rendering = baseRender();
                    }
                    else {
                        // Component has already unmounted
                        if (!self.$ko) {
                            return;
                        }

                        self.$ko.computed.dispose();

                        if (typeof self.componentWillReact === 'function') {
                            self.componentWillReact();
                        }

                        React.Component.prototype.forceUpdate.call(self);
                    }
                });

                return rendering;
            }, self);
        };
    },

    componentWillUnmount() {
        if (this.$ko.computed) {
            this.$ko.computed.dispose();
            this.$ko = null;
        }
    },

    shouldComponentUpdate(nextProps, nextState) {
        // update on any state changes (as is the default)
        if (this.state !== nextState) {
            return true;
        }

        return isObjectShallowModified(this.props, nextProps);
    }
};

function isObjectShallowModified(prev, next) {
    if (null == prev || null == next || typeof prev !== "object" || typeof next !== "object") {
        return prev !== next;
    }
    const keys = Object.keys(prev);
    if (keys.length !== Object.keys(next).length) {
        return true;
    }
    let key;
    for (let i = keys.length - 1; i >= 0, key = keys[i]; i--) {
        if (next[key] !== prev[key]) {
            return true;
        }
    }
    return false;
}

function patch(target, funcName) {
    const base = target[funcName];
    const mixinFunc = reactiveMixin[funcName];
    if (!base) {
        target[funcName] = mixinFunc;
    }
    else {
        target[funcName] = function() {
            base.apply(this, arguments);
            mixinFunc.apply(this, arguments);
        };
    }
}

export default function observer(componentClass) {
    const isStatelessFunction = typeof componentClass === 'function' &&
          (!componentClass.prototype || !componentClass.prototype.render) &&
          !componentClass.isReactClass &&
        !React.Component.isPrototypeOf(componentClass);

    if (isStatelessFunction) {
        return observer(class extends Component {
            static displayName = componentClass.displayName || componentClass.name;
            static contextTypes = componentClass.contextTypes;
            static propTypes = componentClass.propTypes;
            static defaultProps = componentClass.defaultProps;
            render() { return componentClass.call(this, this.props, this.context); }
        });
    }

    const target = componentClass.prototype || componentClass;

    ['componentWillMount', 'componentWillUnmount']
        .forEach(funcName => { patch(target, funcName); });

    if (!target.shouldComponentUpdate) {
        target.shouldComponentUpdate = reactiveMixin.shouldComponentUpdate;
    }

    return componentClass;
}
