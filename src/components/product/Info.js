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
import Icon24LinkCircle from '@vkontakte/icons/dist/24/link_circle';
import Icon24Copy from '@vkontakte/icons/dist/24/copy';

import * as vkActions from '../../actions/vk';
import * as userActions from '../../actions/user';

import {CopyToClipboard} from 'react-copy-to-clipboard';

import '@vkontakte/vkui/dist/vkui.css';
import './info.scss';


class Info extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab4: "dial",
            displayAllText: false,
            tooltipPrice: false,
            tooltipHelp: false,

            waitLoadProduct: true,

            product: {},

            seller: {},

            addedToFavorites: false,
            // Идет запрос на сервер, не делать повторных действий
            requestFavorites: false
        };
    }

    componentDidMount() {
        console.log(categories);

        console.log(this.props.user);

        let element = this.props.user.favorites.filter(id => +id === +this.props.match.params.pId);
        if(element.length) {
            this.setState({
                addedToFavorites: true
            });
        }


        let params = {user_ids: "30333918", fields: "photo_50,city"};
        vkActions.apiRequest("users.get", params, this.props.vk.accessToken, res => {
            this.setState({
                seller: res[0]
            });
        });

        /**
         * Поиск продукта в уже загружженных с сервера
         * Загруженные в PageLoad компоненте
         * @type {T|*|{}}
         */
        let productForState = null;
        for (const key of Object.keys(this.props.gds)) {
            productForState = this.props.gds[key].find((e) => (+e.id === +this.props.match.params.pId));

            if(productForState !== null) {
                break;
            }
        }

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

    substr(text) {
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

    toggleFavorites() {
        if(this.state.requestFavorites) {
            return;
        }

        let id = this.props.match.params.pId;
        let type = "add";
        let indexElement = null;
        let element = this.props.user.favorites.filter((id, i) => {
            if(+id === +this.props.match.params.pId) {
                indexElement = i;

                return true;
            }

            return false;
        });
        if(element.length) {
            id = element[0];
            type = "remove";

            let arr = [...this.props.user.favorites];

            arr.splice(indexElement, 1);

            this.props.userUpdate({
                favorites: arr
            });

            this.setState({
                addedToFavorites: false,
                requestFavorites: true
            });
        } else {
            let arr = [...this.props.user.favorites];
            arr.push(this.props.match.params.pId);

            this.props.userUpdate({
                favorites: arr
            });

            this.setState({
                addedToFavorites: true,
                requestFavorites: true
            });
        }


        axios.get("/api/favorites.php", {
            params: {
                id: id,
                type: type
            }
        }).then(res => {
            this.setState({
                requestFavorites: false
            });
        }).catch(error => {
            console.log(error);
        });
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
                                                {product["price"]} ₽
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
                    <UI.Div>
                        <UI.Button
                            onClick={this.toggleFavorites.bind(this)}
                            level={this.state.addedToFavorites? "2" : "buy"}
                            size="xl">
                            {this.state.addedToFavorites? "Убрать из избранного" : "В избранное"}
                        </UI.Button>
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
                                            {product["state"]? "Новый" : "Б/у"}
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
                                        {this.substr(product.description)}
                                    </UI.Cell>
                                </UI.List>
                            </div>
                        ) : (
                            <div>
                                <UI.Header level="2">Контаткты</UI.Header>
                                <UI.List>
                                    <UI.Cell before={<UI.Avatar src={this.state.seller['photo_50']} size={40} />}
                                             description="Продавец">
                                        {this.state.seller['first_name'] + " " + this.state.seller['last_name']}
                                    </UI.Cell>
                                    <UI.Cell before={<Icon24Phone fill="#4CAF50"/>}>
                                        {product['phone_number']? product['phone_number'] : "Не указан"}
                                    </UI.Cell>
                                    <UI.Cell before={<Icon24Music fill="#4CAF50"/>}>
                                        {product['email']? product['email'] : "Не указан"}
                                    </UI.Cell>
                                </UI.List>

                                <UI.Div>
                                    <UI.Link style={{color: "#fff"}}
                                             href={"https://vk.com/im?sel=" + this.state.seller['id']}>
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
                    <UI.Cell before={<Icon24LinkCircle fill="#4CAF50"/>}
                             onClick={() => (this.props.history.push("/gds_user_id/" + this.props.vk.user.id))}>
                        <UI.Link>Все объявления продавца</UI.Link>
                    </UI.Cell>
                </UI.Group>

                <UI.Group>
                    <CopyToClipboard text={"https://vk.com/app6689902#product/" + this.props.match.params.pId}>
                        <UI.Cell before={<Icon24Copy fill="#4CAF50"/>}>
                            <UI.Link>Копировать ссылку</UI.Link>
                        </UI.Cell>
                    </CopyToClipboard>
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

function mapDispatchToProps(dispatch) {
    return {
        userUpdate: function (name) {
            dispatch(userActions.userUpdate(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Info);