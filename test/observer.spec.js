import React from 'react';
import ReactDOM from 'react-dom';
import observer from '../src/observer';
import { observable } from 'komx';
import $ from 'jquery';
import ko from 'knockout';

ko.options.deferUpdates = true;

const e = React.createElement;

// Store
class Todo {
    @observable completed = false;
    @observable title = 'a';

    constructor(params) {
        Object.assign(this, params);
    }
}

class Store {
    @observable todos = [];

    constructor() {
        this.todos = [new Todo()];
    }
}

// TodoItem
let todoItemRenderings = 0;

function TodoItem(props) {
    todoItemRenderings++;
    return e('li', {}, '|' + props.todo.title);
}
const todoItem = observer(TodoItem);

// TodoList
let todoListRenderings = 0;
let todoListWillReactCount = 0;

@observer
class TodoList extends React.Component {
    renderings = 0;

    componentWillReact() {
        todoListWillReactCount++;
    }

    render() {
        todoListRenderings++;
        const todos = this.props.store.todos;
        return e('div', {},
                e('h1', null, todos.length,
                 todos.map((todo, idx) => e(todoItem, { key: idx, todo }))));
    }
}

// App
class App extends React.Component {
    render() {
        return e(TodoList, { store: this.props.store });
    }
}

// Tests
describe('observer nested rendering', () => {
    let store;
    let testRoot;

    beforeAll((done) => {
        todoItemRenderings = 0;
        todoListRenderings = 0;
        todoListWillReactCount = 0;

        testRoot = document.createElement('div');
        window.document.body.appendChild(testRoot);

        store = new Store();
        ReactDOM.render(e(App, { store }), testRoot);

        setTimeout(done, 100);
    });

    test('should have rendered list once 1', () => {
        expect(todoListRenderings).toBe(1);
    });

    test('should not have reacted yet 1', () => {
        expect(todoListWillReactCount).toBe(0);
        expect($(testRoot).find('li').length).toBe(1);
        expect($(testRoot).find('li').text()).toBe('|a');
    });

    test('item1 should render once', () => {
        expect(todoItemRenderings).toBe(1);
    });

    test('observers count shouldnt change', () => {
        // this seems wrong, but decorators use one subscription on arrays internally
        expect(store.$rawObservables.todos.getSubscriptionsCount()).toBe(2);
        expect(store.todos[0].$rawObservables.title.getSubscriptionsCount()).toBe(1);
    });

    test('changes title of a todo', (done) => {
        store.todos[0].title += 'a';

        setTimeout(done, 100);
    });

    test('should have rendered list once 2', () => {
        expect(todoListRenderings).toBe(1);
    });

    test('should not have reacted yet 2', () => {
        expect(todoListWillReactCount).toBe(0);
    });

    test('item1 should have rendered twice', () => {
        expect(todoItemRenderings).toBe(2);
    });

    test('observers count shouldnt change', () => {
        expect(store.$rawObservables.todos.getSubscriptionsCount()).toBe(2);
        expect(store.todos[0].$rawObservables.title.getSubscriptionsCount()).toBe(1);
    });

    test('adds a todo', (done) => {
        store.todos.push(new Todo({
            title: 'b',
            completed: true
        }));

        setTimeout(done, 100);
    });

    test('should have two items in the list', () => {
        expect($(testRoot).find('li').length).toBe(2);
        expect($(testRoot).find('li').text()).toBe('|aa|b');
    });

    test('should have rendered list twice', () => {
        expect(todoListRenderings).toBe(2);
    });

    test('should have reacted', () => {
        expect(todoListWillReactCount).toBe(1);
    });

    test('item2 should have rendered as well', () => {
        expect(todoItemRenderings).toBe(3);
    });

    test('title observers should have increased', () => {
        expect(store.todos[1].$rawObservables.title.getSubscriptionsCount()).toBe(1);
    });

    test('completed observers should not have increased', () => {
        expect(store.todos[1].$rawObservables.completed.getSubscriptionsCount()).toBe(0);
    });

    let oldTodo;

    test('removes one todo', (done) => {
        oldTodo = store.todos.pop();

        setTimeout(done, 100);
    });

    test('should have rendered list another time', () => {
        expect(todoListRenderings).toBe(3);
    });

    test('should have reacted another time', () => {
        expect(todoListWillReactCount).toBe(2);
    });

    test('item1 should not have rerendered', () => {
        expect(todoItemRenderings).toBe(3);
    });

    test('title observers should have decreased', () => {
        expect(oldTodo.$rawObservables.title.getSubscriptionsCount()).toBe(0);
    });

    test('completed observers should not have decreased', () => {
        expect(oldTodo.$rawObservables.completed.getSubscriptionsCount()).toBe(0);
    });

    afterAll(() => {
        window.document.body.removeChild(testRoot);
    });
});

describe('observer keep views alive', () => {
    let yCalcCount;
    let data;
    let testRoot;

    const component = observer(() => e('div', {}, data.z() + data.y()));

    beforeAll((done) => {
        testRoot = document.createElement('div');
        window.document.body.appendChild(testRoot);

        yCalcCount = 0;
        data = {
            x: ko.observable(3),
            z: ko.observable('hi')
        };
        data.y = ko.computed(() => {
            yCalcCount++;
            return data.x() * 2;
        });

        ReactDOM.render(e(component), testRoot);

        setTimeout(done, 100);
    });

    test('test 1', () => {
        expect(yCalcCount).toBe(1);
        expect($(testRoot).text()).toBe('hi6');
    });

    test('changes z', (done) => {
        data.z('hello');

        setTimeout(done, 100);
    });

    test('test 2', () => {
        expect(yCalcCount).toBe(1);
        expect($(testRoot).text()).toBe('hello6');
        expect(yCalcCount).toBe(1);
    });

    test('test 3', () => {
        expect(yCalcCount).toBe(1);
        expect($(testRoot).text()).toBe('hello6');
        expect(yCalcCount).toBe(1);
    });

    test('test 4', () => {
        expect(data.y.getSubscriptionsCount()).toBe(1);
    });

    test('change test root', (done) => {
        ReactDOM.render(e('div'), testRoot);

        setTimeout(done, 100);
    });

    test('test 5', () => {
        expect(data.y.getSubscriptionsCount()).toBe(0);
    });

    afterAll(() => {
        window.document.body.removeChild(testRoot);
    });
});
