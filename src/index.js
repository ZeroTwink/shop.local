import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import {HashRouter, Route, Switch} from 'react-router-dom';

import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';

import rootReducer from './reducers/index';

import PageLoader from './components/PageLoader';
import App from './components/App';
import AdminRouters from './components/AdminPanel/AdminRouters';

import './index.scss';

const logger = store => next => action => {
    // console.log('dispatching', action);
    return next(action);
};

const store = createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk, logger));

ReactDOM.render(
    <Provider store={store}>
        <HashRouter>
            <Switch>
                <Route exact path="/" component={PageLoader}/>
                <Route exact path="/admin" component={AdminRouters}/>
                <Route path="/:pageId?/:pId?" component={App}/>
            </Switch>
        </HashRouter>
    </Provider>,
    document.getElementById('root'));