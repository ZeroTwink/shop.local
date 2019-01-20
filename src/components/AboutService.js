import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';

// import VKConnect from '../utils/VKConnect';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';

import './aboutService.scss';

class AboutService extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }


    componentDidMount() {
        if(this.props.match.params.pId) {
            let id = document.getElementById(this.props.match.params.pId);

            if(!id) {
                return;
            }

            // VKConnect.send("VKWebAppScroll", {"top": id.offsetTop, "speed": 600});

            let timer = null;
            clearTimeout(timer);
            timer = setTimeout(() => {
                window.scrollTo(0, id.offsetTop);

                clearTimeout(timer);
            }, 500);
        }
    }

    render() {
        const osname = UI.platform();

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader
                    left={<UI.HeaderButton onClick={() => this.props.history.goBack()}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    Сведения
                </UI.PanelHeader>

                <UI.Group>
                    <UI.List>
                        <UI.Cell>
                            <UI.InfoRow title="Версия">
                                1.9.2
                            </UI.InfoRow>
                        </UI.Cell>
                        <UI.Cell>
                            <UI.Link href="https://vk.com/id30333918">
                                <UI.InfoRow title="Автор">
                                    Сергей Качалка
                                </UI.InfoRow>
                            </UI.Link>
                        </UI.Cell>
                        <UI.Cell>
                            <UI.InfoRow title="Работа сервиса">
                                <div className="workServiceWrap">
                                    <div className="leftItem">Добавить объявление</div>
                                    <div className="rightItem">On</div>
                                </div>
                                <div className="workServiceWrap">
                                    <div className="leftItem">Изменить объявление</div>
                                    <div className="rightItem">On</div>
                                </div>
                                <div className="workServiceWrap">
                                    <div className="leftItem">Избранное</div>
                                    <div className="rightItem">On</div>
                                </div>
                                <div className="workServiceWrap">
                                    <div className="leftItem">Уведомления</div>
                                    <div className="rightItem">On</div>
                                </div>
                                <div className="workServiceWrap">
                                    <div className="leftItem">Архив</div>
                                    <div className="rightItem">On</div>
                                </div>
                                <div className="workServiceWrap">
                                    <div className="leftItem">Фильтры</div>
                                    <div className="rightItem">On</div>
                                </div>
                                <div className="workServiceWrap">
                                    <div className="leftItem">Галерея фотографий</div>
                                    <div className="rightItem">On</div>
                                </div>
                            </UI.InfoRow>
                        </UI.Cell>
                        <UI.Cell>
                            <UI.InfoRow title="Последнее обновление">
                                <div style={{wordWrap: "break-word", whiteSpace: "pre-wrap", color: "#656565"}}>
                                1. Создана галерея для просмотра загруженных пользователями фотографий.
                                <br /><br />
                                2. Улучшена система добавления фотографий при создании / редактировании объявлений.
                                <br /><br />
                                3. Владельцам объявлений теперь доступны следующие функции при редактировании фотографий: поворот, удаление и установка превью.
                                <br /><br />
                                4. Исправлены грамматические ошибки.
                                <br /><br />
                                5. Проведена оптимизация кода для ускорения работы сервиса.
                                <br /><br />
                                6. В меню добавлен пункт, информирующий пользователей о работе сервиса и последних изменениях.
                                </div>
                            </UI.InfoRow>
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
        vk: state.vk
    }
}

export default connect(mapStateToProps)(AboutService);