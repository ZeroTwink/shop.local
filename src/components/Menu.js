import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';
import Icon24Add from '@vkontakte/icons/dist/24/add';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24List from '@vkontakte/icons/dist/24/list';
import Icon24Notification from '@vkontakte/icons/dist/24/notification';
import Icon24Favorite from '@vkontakte/icons/dist/24/favorite';
import Icon24About from '@vkontakte/icons/dist/24/about';
import Icon24User from '@vkontakte/icons/dist/24/user';
import Icon24Help from '@vkontakte/icons/dist/24/help';


class Menu extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };

    }

    componentDidMount() {

    }


    render() {
        const osname = UI.platform();

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader
                    left={<UI.HeaderButton onClick={() => this.props.history.goBack()}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    Меню
                </UI.PanelHeader>

                <UI.Group>
                    <UI.Cell
                        size="l"
                        description="Это вы"
                        before={<UI.Avatar size={40} src={this.props.vk.user['photo_100']}/>}
                    >
                        {this.props.vk.user['first_name'] + " " + this.props.vk.user['last_name']}
                    </UI.Cell>
                </UI.Group>

                <UI.Group>
                    <UI.List>
                        <UI.Cell before={<Icon24Add/>}
                                 onClick={() => (this.props.history.push("/add_product"))}>
                            Добавить объявление
                        </UI.Cell>
                        <UI.Cell before={<Icon24List/>}
                                 onClick={() => (this.props.history.push("/gds_user_id/" + this.props.vk.user.id))}>
                            Мои объявления
                        </UI.Cell>
                        <UI.Cell before={<Icon24Notification/>}
                                 onClick={() => (this.props.history.push("/product/1"))}>
                            Уведомления
                        </UI.Cell>
                        <UI.Cell before={<Icon24Favorite/>}
                                 onClick={() => (this.props.history.push("/favorites"))}>
                            Избранное
                        </UI.Cell>
                    </UI.List>
                </UI.Group>

                <UI.Group>
                    <UI.List>
                        <UI.Cell before={<Icon24About/>}
                                 onClick={() => (this.props.history.push("/product/1"))}>
                            О программе
                        </UI.Cell>
                        <UI.Link href="https://vk.com/club171573725">
                            <UI.Cell before={<Icon24Help/>}>
                                Наша группа
                            </UI.Cell>
                        </UI.Link>
                        <UI.Cell before={<Icon24User/>}
                                 onClick={() => (this.props.history.push("/product/1"))}>
                            Правила
                        </UI.Cell>
                    </UI.List>
                </UI.Group>
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

export default connect(mapStateToProps)(Menu);