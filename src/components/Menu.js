import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';
// import Icon24Add from '@vkontakte/icons/dist/24/add';
// import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
// import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24List from '@vkontakte/icons/dist/24/list';
// import Icon24Favorite from '@vkontakte/icons/dist/24/favorite';
import Icon24About from '@vkontakte/icons/dist/24/about';
import Icon24User from '@vkontakte/icons/dist/24/user';
import Icon24Help from '@vkontakte/icons/dist/24/help';
// import Icon24Filter from '@vkontakte/icons/dist/24/filter';
import Icon24Notification from '@vkontakte/icons/dist/24/notification';
import Icon24Replay from '@vkontakte/icons/dist/24/replay';
import Icon24Like from '@vkontakte/icons/dist/24/like';
import Icon24Document from '@vkontakte/icons/dist/24/document';
import axios from "../utils/axios";


class Menu extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };

    }

    componentDidMount() {
        window.scroll(0, 0);
    }

    sendToArchive() {
        axios.get("/api/send_to_archive.php", {
            params: {

            }
        }).then(res => {
            console.log(res);

        }).catch(error => {
            console.log(error);
        });
    }

    deleteFromArchive() {
        axios.get("/api/delete_from_archive.php", {
            params: {

            }
        }).then(res => {
            console.log(res);

        }).catch(error => {
            console.log(error);
        });
    }


    render() {
        // const osname = UI.platform();

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader>
                    Меню
                </UI.PanelHeader>

                <UI.Group>
                    <UI.Cell
                        size="l"
                        description="Покупатель / Продавец"
                        before={<UI.Avatar size={40} src={this.props.vk.user['photo_100']}/>}
                    >
                        {this.props.vk.user['first_name'] + " " + this.props.vk.user['last_name']}
                    </UI.Cell>
                </UI.Group>

                <UI.Group>
                    <UI.List>
                        {/*<UI.Cell before={<Icon24Add/>}*/}
                                 {/*onClick={() => (this.props.history.push("/add_product"))}>*/}
                            {/*Добавить объявление*/}
                        {/*</UI.Cell>*/}
                        <UI.Cell before={<Icon24List/>}
                                 onClick={() => (this.props.history.push("/gds_user_id/" + this.props.vk.user.id))}>
                            Мои объявления
                        </UI.Cell>
                        <UI.Cell before={<Icon24Like/>}
                                 onClick={() => (this.props.history.push("/favorites"))}>
                            Избранное
                        </UI.Cell>
                        <UI.Cell before={<Icon24Replay/>}
                                 onClick={() => (this.props.history.push("/archive"))}>
                            Архивные
                        </UI.Cell>
                        {/*<UI.Cell before={<Icon24Filter/>}*/}
                                 {/*onClick={() => (this.props.history.push("/filters"))}>*/}
                            {/*Фильтры (поиск)*/}
                        {/*</UI.Cell>*/}
                        <UI.Cell before={<Icon24Notification/>}
                                 onClick={() => (this.props.history.push("/set_notifications"))}>
                            Настроить уведомления
                        </UI.Cell>
                        {/*<UI.Cell before={<Icon24Notification/>}*/}
                                 {/*onClick={() => (this.props.history.push("/admin"))}>*/}
                            {/*Админ панель*/}
                        {/*</UI.Cell>*/}
                        {/*<UI.Cell before={<Icon24Settings/>}*/}
                                 {/*onClick={() => (this.props.history.push("/product/1"))}>*/}
                            {/*Настройки*/}
                        {/*</UI.Cell>*/}
                    </UI.List>
                </UI.Group>

                <UI.Group>
                    <UI.List>
                        <UI.Cell before={<Icon24About/>}
                                 onClick={() => (this.props.history.push("/about"))}>
                            Информация
                        </UI.Cell>
                        <UI.Cell before={<Icon24Document/>}
                                 onClick={() => (this.props.history.push("/about_service"))}>
                            Сведения о сервисе
                        </UI.Cell>
                        <UI.Cell before={<Icon24User/>}>
                            <UI.Link style={{display: "block", color: "inherit"}} href="https://vk.com/club171573725">
                                Наша группа
                            </UI.Link>
                        </UI.Cell>
                        <UI.Cell before={<Icon24Help/>}
                                 onClick={() => (this.props.history.push("/rules"))}>
                            Правила
                        </UI.Cell>
                        {this.props.user['access'] > 14? (
                            <React.Fragment>
                                <UI.Cell before={<Icon24Help/>}
                                         onClick={this.sendToArchive.bind(this)}>
                                    Отправка в архив
                                </UI.Cell>
                                <UI.Cell before={<Icon24Help/>}
                                         onClick={this.deleteFromArchive.bind(this)}>
                                    Удалить из архива
                                </UI.Cell>
                            </React.Fragment>
                        ) : null}
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