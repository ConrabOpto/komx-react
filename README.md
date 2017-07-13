# komx-react
React bindings for komx.

## Installation
`npm install komx-react --save`

## Usage - with Komx decorators
```js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { observable, computed } from 'komx';
import { observer } from 'komx-react';

class Note {
    @observable message = 'Hej';
}

@observer
class NoteViewer extends Component {
    render() {
        return <div>{ this.props.note.message }</div>;
    }
}

const myNote = new Note();

ReactDOM.render(<NoteViewer note={ myNote }, document.getElementById('app'));
```

## Usage - with Knockout view models
```js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { observable, computed } from 'komx';
import { observer } from 'komx-react';
import ko from 'knockout';

function Note() {
    this.message = ko.observable('hej');
}

@observer
class NoteViewer extends Component {
    render() {
        const message = ko.unwrap(this.props.note.message);
        return <div>{ message }</div>;
    }
}

const myNote = new Note();

ReactDOM.render(<NoteViewer note={ myNote }, document.getElementById('app'));
```

## Currently included

`observer`, `inject`, `Provider`
