import React, {Component} from 'react';
import {connect} from 'react-redux';
import Moment from 'react-moment';
import axios from '../../utils/axios';
import categories from '../../utils/categories';
import * as UI from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Phone from '@vkontakte/icons/dist/24/phone';
import Icon24Music from '@vkontakte/icons/dist/24/music';
import Icon24helpOutline from '@vkontakte/icons/dist/24/help_outline';

import '@vkontakte/vkui/dist/vkui.css';
import './info.scss';

class Info extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activePanel: "p1",
            activeTab4: "dial",
            displayAllText: false,
            tooltipPrice: false,
            tooltipHelp: false,

            waitLoadProduct: true,

            product: {}
        };
    }

    componentDidMount() {
        console.log(categories);
        /**
         * Поиск продукта в уже загружженных с сервера
         * Загруженные в Main компоненте
         * @type {T|*|{}}
         */

        let productForState = this.props.gds.find((e) => (+e.id === +this.props.match.params.pId));

        if(productForState) {
            this.setState({
                product: productForState,
                waitLoadProduct: false
            });

            return;
        }

        axios.get("/api/get_product_for_id.php", {
            params: {
                id: this.props.match.params.pId
            }
        }).then(res => {
            this.setState({
                product: res.data.response.product[0],
                waitLoadProduct: false
            });
        }).catch(error => {
            console.log(error);
        });
    }

    strLol(text) {
        if(this.state.displayAllText) {
            return text;
        }

        let title = "";

        let t = text;
        if(text.length > 120) {
            t = text.slice(0, 120);

            title = "...Читать дальше";
        }

        if(t.length < 1) {
            title = "Без описания";
        }

        return (
            <div>
                {t}
                <UI.Link onClick={() => this.setState({displayAllText: true})}>{title}</UI.Link>
            </div>
        );
    }


    render() {
        const osname = UI.platform();

        if(this.state.waitLoadProduct) {
            return (
                <UI.Panel id={this.props.id}>
                    <UI.PanelHeader
                        left={<UI.HeaderButton onClick={() => this.props.history.goBack()}>{osname === UI.IOS ?
                            <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                    >
                        Товары
                    </UI.PanelHeader>
                    <UI.Group>
                        <UI.Div>
                            Загрузка...
                        </UI.Div>
                    </UI.Group>
                </UI.Panel>
            );
        }

        const product = this.state.product;

        let allImages = [];

        if(product["images"] !== "") {
            allImages = product["images"].split(",");
        }

        console.log(allImages);

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
                        {allImages.length? allImages.map((e, i) => {
                            let style = {
                                backgroundImage: 'url('+window.location.protocol + "//" + window.location.hostname +
                                "/sys/files/gds/" + e + ')',
                                backgroundSize: "cover"
                            };
                            return (
                                <div key={i} className="img_gallery" style={style}>
                                    <div className="price_product_img_wrap">
                                        <UI.Tooltip
                                            text="Цена на продоваймы товар"
                                            isShown={this.state.tooltipPrice}
                                            onClose={() => this.setState({ tooltipPrice: false })}
                                            offsetX={10}
                                        >
                                            <div className="price_product_img"
                                                 onClick={() => this.setState({ tooltipPrice: !this.state.tooltipPrice })}>
                                                3500 ₽
                                            </div>
                                        </UI.Tooltip>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="img_gallery"
                                 style={{backgroundImage: 'url(/images/no_photo_info.png)', backgroundSize: "cover"}} />
                        )}
                    </UI.Gallery>
                </UI.Group>

                <UI.Group>
                    <UI.Div>
                        {product.title}
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
                            <div>
                                <UI.List>
                                    <UI.Cell>
                                        <UI.InfoRow title="Дата публикации">
                                            <Moment format="DD.MM.YYYY в H:mm" unix>
                                                {product.time}
                                            </Moment>
                                        </UI.InfoRow>
                                    </UI.Cell>
                                    <UI.Cell asideContent={
                                        <UI.Tooltip
                                            text="Состояние товара: Б/у или новый. Та же состояние оценино
                                            по пяти балльной системе. У новых товаров всего 5 баллов"
                                            isShown={this.state.tooltipHelp}
                                            onClose={() => this.setState({ tooltipHelp: false })}
                                            offsetX={16}
                                            offsetY={10}
                                            alignX="right"
                                        >
                                            <Icon24helpOutline fill="#4CAF50"
                                                               onClick={() => this.setState({
                                                                   tooltipHelp: !this.state.tooltipHelp
                                                               })} />
                                        </UI.Tooltip>
                                    }>
                                        <UI.InfoRow title="Состояние товара">
                                            Б/у
                                            <div style={{width: 90}}>
                                                <img src={"/images/stars/stars" + product["state_balls"] + ".png"}
                                                     alt="" />
                                            </div>
                                        </UI.InfoRow>
                                    </UI.Cell>
                                    <UI.Cell>
                                        <UI.InfoRow title="Вид товара">
                                            {categories[product.category]['title'] + " / " +
                                            categories[product.category]["sub"][product.subcategory]['title']}
                                        </UI.InfoRow>
                                    </UI.Cell>
                                    <UI.Cell multiline>
                                        <UI.InfoRow title="Описание" />
                                        {this.strLol(product.description)}
                                    </UI.Cell>
                                </UI.List>
                            </div>
                        ) : (
                            <div>
                                <UI.Header level={2}>Контаткты</UI.Header>
                                <UI.List>
                                    <UI.Cell before={<UI.Avatar src="../../images/ava.jpg" size={32} />}
                                             description="Продавец">
                                        Просто Человек
                                    </UI.Cell>
                                    <UI.Cell before={<Icon24Phone fill="#4CAF50"/>}>
                                        Не указан
                                    </UI.Cell>
                                    <UI.Cell before={<Icon24Music fill="#4CAF50"/>}>
                                        Не указан
                                    </UI.Cell>
                                </UI.List>

                                <UI.Div>
                                    <UI.Link style={{color: "#fff"}} href="https://vk.com/im?sel=377622871">
                                        <UI.Button level="buy" size="xl">
                                            Написать продавцу
                                        </UI.Button>
                                    </UI.Link>
                                </UI.Div>
                            </div>
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
        gds: state.gds
    }
}

export default connect(mapStateToProps)(Info);