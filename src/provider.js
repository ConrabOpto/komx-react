import React from 'react';
import PropTypes from 'prop-types';

const specialReactKeys = { children: true, key: true, ref: true };

export default class Provider extends React.Component {

    static contextTypes = {
        mobxStores: PropTypes.object,
    };

    static childContextTypes = {
        mobxStores: PropTypes.object.isRequired,
    };

    render() {
        return React.Children.only(this.props.children);
    }

    getChildContext() {
        const stores = {};
        // inherit stores
        const baseStores = this.context.mobxStores;
        if (baseStores) {
            for (let key in baseStores) {
                stores[key] = baseStores[key];
            }
        }
        // add own stores
        for (let key in this.props) {
            if (!specialReactKeys[key] && key !== 'suppressChangedStoreWarning') {
                stores[key] = this.props[key];
            }
        }
        return {
            mobxStores: stores
        };
    }

    componentWillReceiveProps(nextProps) {
        // Maybe this warning is too aggressive?
        if (Object.keys(nextProps).length !== Object.keys(this.props).length) {
            console.warn('Provider: The set of provided stores has changed. Please avoid changing stores as the change might not propagate to all children');
        }
        if (!nextProps.suppressChangedStoreWarning) {
            for (let key in nextProps) {
                if (!specialReactKeys[key] && this.props[key] !== nextProps[key]) {
                    console.warn('Provider: Provided store ' + key + 'has changed. Please avoid replacing stores as the change might not propagate to all children');
                }
            }
        }
    }
}
