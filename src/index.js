import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter, Route} from 'react-router-dom';

import {Provider} from 'react-redux';
import {createStore} from 'redux';

import rootReducer from './reducers/index';

import App from './components/App';

import './index.scss';


const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

ReactDOM.render(
    <Provider store={store}>
        <HashRouter>
            <div id="wrapper">
                <div id="game">
                    <Route path="/:pageId?/:pId?" component={App}/>
                </div>
            </div>
        </HashRouter>
    </Provider>,
    document.getElementById('root'));