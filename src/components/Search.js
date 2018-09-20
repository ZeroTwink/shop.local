import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';

import gdsLoad from '../actions/gdsLoad';

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    render() {
        const osname = UI.platform();

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader
                    left={<UI.HeaderButton onClick={() => this.props.history.goBack()}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    Поиск
                </UI.PanelHeader>

                <UI.Search />

                dfsdfs
            </UI.Panel>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        gds: state.gds,
        vk: state.vk
    }
}

function mapDispatchToProps(dispatch) {
    return {
        gdsLoad: function (name) {
            dispatch(gdsLoad(name));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);