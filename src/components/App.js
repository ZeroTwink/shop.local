import React, { Component } from 'react';
import {connect} from 'react-redux';

import * as UI from '@vkontakte/vkui';
import * as VKActions from '../actions/vk';

import Main from './Main';
import Info from './product/Info';
import AddProduct from './product/AddProduct';

import '@vkontakte/vkui/dist/vkui.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            titleMessage: "Ошибка",
            showModalError: false,
            modalMessageError: ""
        };
    }

    componentDidMount() {
        this.props.initApp();

        this.props.fetchAccessToken();
    }

    render() {
        const pageId = this.props.match.params.pageId || 'main';

        return (
            <UI.Root activeView="mainView">
                <UI.View id="mainView" activePanel={pageId}>
                    <Main id="main" {...this.props}/>
                    <Info id="product" {...this.props}/>
                    <AddProduct id="add_product" {...this.props}/>
                </UI.View>
            </UI.Root>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initApp: function (name) {
            dispatch(VKActions.initApp())
        },
        fetchAccessToken: function (scope) {
            dispatch(VKActions.fetchAccessToken())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
