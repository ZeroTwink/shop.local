import React, { Component } from 'react';

import * as UI from '@vkontakte/vkui';
import * as VKConnect from '@vkontakte/vkui-connect';

import Main from './Main';
import Info from './product/Info';

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
        VKConnect.send('VKWebAppInit', {'no_toolbar': true});
    }

    render() {
        const pageId = this.props.match.params.pageId || 'main';

        return (
            <UI.Root activeView="mainView">
                <UI.View id="mainView" activePanel={pageId}>
                    <Main id="main" {...this.props}/>
                    <Info id="product" {...this.props}/>
                </UI.View>
            </UI.Root>
        )
    }
}

export default App;
