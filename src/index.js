import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import {BrowserRouter, Route} from 'react-router-dom';

import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';

import rootReducer from './reducers/index';

import App from './components/App';

import './index.scss';

const logger = store => next => action => {
    console.log('dispatching', action);
    return next(action);
};

const store = createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk, logger));

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <div id="wrapper">
                <div id="game">
                    <Route path="/:pageId?/:pId?" component={App}/>
                </div>
            </div>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root'));