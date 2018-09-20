import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import {HashRouter, Route, Switch} from 'react-router-dom';

import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';

import rootReducer from './reducers/index';

import PageLoader from './components/PageLoader';
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
        <HashRouter>
            <div id="wrapper">
                <div id="game">
                    <Switch>
                        <Route exact path="/" component={PageLoader}/>
                        <Route path="/:pageId?/:pId?" component={App}/>
                    </Switch>
                </div>
            </div>
        </HashRouter>
    </Provider>,
    document.getElementById('root'));