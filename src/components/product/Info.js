import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Phone from '@vkontakte/icons/dist/24/phone';
import Icon24Music from '@vkontakte/icons/dist/24/music';

import '@vkontakte/vkui/dist/vkui.css';

class Info extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activePanel: "p1",
            activeTab4: "dial",
            displayAllText: false,
            tooltipPrice: false
        };
    }

    componentDidMount() {

    }

    strLol(text) {
        if(this.state.displayAllText) {
            return text;
        }

        let t = text;
        if(text.length > 20) {
            t = text.slice(0, 120);
        }

        return (
            <div>
                {t}
                <UI.Link onClick={() => this.setState({displayAllText: true})}>...Читать дальше</UI.Link>
            </div>
        );
    }


    render() {
        const osname = UI.platform();

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader
                    left={<UI.HeaderButton onClick={() => this.props.history.goBack()}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    Товары
                </UI.PanelHeader>

                <UI.Group title="Фотографии">
                    <UI.Gallery
                        slideWidth="100%"
                        style={{ height: 230 }}
                        bullets="dark"
                    >
                        <div style={{ height: 230, backgroundColor: UI.colors.red, backgroundImage: 'url(/images/q1.jpg)', backgroundSize: "cover", position: "relative" }}>
                            <div className="price_product_img_wrap">
                                <UI.Tooltip
                                    text="Цена на продоваймы товар"
                                    isShown={this.state.tooltipPrice}
                                    onClose={() => this.setState({ tooltipPrice: false })}
                                    offsetX={10}
                                >
                                    <div className="price_product_img" onClick={() => this.setState({ tooltipPrice: !this.state.tooltipPrice })}>
                                        3500 ₽
                                    </div>
                                </UI.Tooltip>
                            </div>
                        </div>
                        <div style={{ height: 230, backgroundColor: UI.colors.green, backgroundImage: 'url(/images/q2.jpg)', backgroundSize: "cover", position: "relative" }}>
                            <div className="price_product_img_wrap">
                                <div className="price_product_img">
                                    3500 ₽
                                </div>
                            </div>
                        </div>
                        <div style={{ height: 230, backgroundColor: UI.colors.blue, backgroundImage: 'url(/images/q3.jpg)', backgroundSize: "cover", position: "relative" }}>
                            <div className="price_product_img_wrap">
                                <div className="price_product_img">
                                    3500 ₽
                                </div>
                            </div>
                        </div>
                        <div style={{ height: 230, backgroundColor: UI.colors.blue, backgroundImage: 'url(/images/q4.jpg)', backgroundSize: "cover", position: "relative" }}>
                            <div className="price_product_img_wrap">
                                <div className="price_product_img">
                                    3500 ₽
                                </div>
                            </div>
                        </div>
                        <div style={{ height: 230, backgroundColor: UI.colors.blue, backgroundImage: 'url(/images/q5.jpg)', backgroundSize: "cover", position: "relative" }}>
                            <div className="price_product_img_wrap">
                                <div className="price_product_img">
                                    3500 ₽
                                </div>
                            </div>
                        </div>
                    </UI.Gallery>
                </UI.Group>

                <UI.Group>
                    <UI.Div>
                        Название товара тут
                    </UI.Div>
                </UI.Group>

                <UI.Group>
                    <UI.Tabs>
                        <UI.TabsItem className="tabsl"
                                     onClick={() => this.setState({ activeTab4: 'dial' })}
                                     selected={this.state.activeTab4 === 'dial'}
                        >
                            Информация
                        </UI.TabsItem>
                        <UI.TabsItem className="tabsl"
                                     onClick={() => this.setState({ activeTab4: 'messages' })}
                                     selected={this.state.activeTab4 === 'messages'}
                        >
                            Контакты
                        </UI.TabsItem>
                    </UI.Tabs>

                    {
                        this.state.activeTab4 === 'dial' ? (
                            <UI.List>
                                <UI.Cell>
                                    <UI.InfoRow title="Дата публикации">
                                        30 января 1993 в 12:30
                                    </UI.InfoRow>
                                </UI.Cell>
                                <UI.Cell>
                                    <UI.InfoRow title="Состояние товара">
                                        Б/у
                                        <div style={{width: 90}}>
                                            <img src="/images/stars3.png" alt="" />
                                        </div>
                                    </UI.InfoRow>
                                </UI.Cell>
                                <UI.Cell>
                                    <UI.InfoRow title="Вид товара">
                                        Компьютеры
                                    </UI.InfoRow>
                                </UI.Cell>
                                <UI.Cell multiline>
                                    <UI.InfoRow title="Описание" />
                                    {this.strLol("Тут много текста типа оно тго стоило или нет возможно да Тут много текста типа\n" +
                                        "оно тго стоило или нет возможно да Тут много текста типа оно тго стоило\n" +
                                        "или нет возможно да Тут много текста типа оно тго стоило или нет возможно да")}
                                </UI.Cell>
                            </UI.List>
                        ) : (
                            <UI.Group title="Контакты">
                                <UI.List>
                                    <UI.Cell before={<UI.Avatar src="../../images/ava.jpg" size={32} />}description="Продавец">
                                        Просто Человек
                                    </UI.Cell>
                                    <UI.Cell before={<Icon24Phone fill="#4CAF50"/>}>
                                        Не указан
                                    </UI.Cell>
                                    <UI.Cell before={<Icon24Music fill="#4CAF50"/>}>
                                        Не указан
                                    </UI.Cell>
                                </UI.List>
                            </UI.Group>
                        )
                    }
                </UI.Group>

                <UI.Group>
                    <UI.Div>
                        Все товары продовца
                    </UI.Div>
                </UI.Group>
            </UI.Panel>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
    }
}

export default connect(mapStateToProps)(Info);