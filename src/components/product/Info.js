import React, {Component} from 'react';
import {connect} from 'react-redux';
import Moment from 'react-moment';
import axios from '../../utils/axios';
import categories from '../../utils/categories';
import Toasts from '../Toasts';
import * as UI from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Phone from '@vkontakte/icons/dist/24/phone';
import Icon24helpOutline from '@vkontakte/icons/dist/24/help_outline';
import Icon24LinkCircle from '@vkontakte/icons/dist/24/link_circle';
import Icon24Copy from '@vkontakte/icons/dist/24/copy';
import Icon24LogoVk from '@vkontakte/icons/dist/24/logo_vk';
import Icon24Mention from '@vkontakte/icons/dist/24/mention';
import Icon16Dropdown from '@vkontakte/icons/dist/16/dropdown';
import Icon24Delete from '@vkontakte/icons/dist/24/delete';
import Icon24LikeOutline from '@vkontakte/icons/dist/24/like_outline';
import Icon24Like from '@vkontakte/icons/dist/24/like';
import Icon24Share from '@vkontakte/icons/dist/24/share';
import Icon24LogoLivejournal from '@vkontakte/icons/dist/24/logo_livejournal';

import getCurrencyCode from '../../helpers/getCurrencyCode';

import VKConnect from '../../utils/VKConnect';

import * as vkActions from '../../actions/vk';
import * as userActions from '../../actions/user';
import * as sysActions from '../../actions/sys';
import * as gdsActions from '../../actions/gds';

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
            requestFavorites: false,

            contextOpened: false
        };
    }

    componentDidMount() {
        let element = this.props.user.favorites.filter(id => +id === +this.props.match.params.pId);
        if(element.length) {
            this.setState({
                addedToFavorites: true
            });
        }

         // Поиск продукта в уже загружженных с сервера
         // Загруженные в PageLoad компоненте

        // let productForState = null;
        // for (const key of Object.keys(this.props.gds)) {
        //     productForState = this.props.gds[key].find((e) => (+e.id === +this.props.match.params.pId));
        //
        //     if(productForState !== null) {
        //         break;
        //     }
        // }
        //
        // if(productForState) {
        //     let params = {user_ids: productForState['id_vk'], fields: "photo_50,city"};
        //     vkActions.apiRequest("users.get", params, this.props.vk.accessToken, res => {
        //         this.setState({
        //             seller: res[0]
        //         });
        //     });
        //
        //     this.setState({
        //         product: productForState,
        //         waitLoadProduct: false
        //     });
        //
        //     return;
        // }

        let isProductOpen = null;
        for(let i = 0; i < this.props.gds.open.length; i++) {
            if(+this.props.gds.open[i]['id'] === +this.props.match.params['pId']) {
                isProductOpen = this.props.gds.open[i];

                break;
            }
        }

        if(isProductOpen) {
            let params = {user_ids: isProductOpen['id_vk'], fields: "photo_50,city"};
            vkActions.apiRequest("users.get", params, this.props.vk.accessToken, res => {
                this.setState({
                    seller: res[0]
                });
            });

            this.setState({
                product: isProductOpen,
                waitLoadProduct: false
            });

            return;
        }

        axios.get("/api/get_product_for_id.php", {
            params: {
                id: this.props.match.params['pId']
            }
        }).then(res => {
            if(res.data.error) {
                this.displayError(res.data.error.message);

                return;
            }

            let params = {user_ids: res.data.response.product['id_vk'], fields: "photo_50,city"};
            vkActions.apiRequest("users.get", params, this.props.vk.accessToken, res => {
                this.setState({
                    seller: res[0]
                });
            });

            this.setState({
                product: res.data.response.product,
                waitLoadProduct: false
            });

            let gdsOpen = [...this.props.gds['open']];
            gdsOpen.push(res.data.response.product);

            this.props.gdsUpdate({
                "open": gdsOpen
            });
        }).catch(error => {
            console.log(error);
        });
    }

    displayError(message, title) {
        this.props.setPopout(
            <UI.Alert
                actions={[{
                    title: 'OK',
                    autoclose: true,
                    style: 'destructive'
                }]}
                onClose={() => this.props.setPopout(null)}
            >
                <h2><div style={{color: "#ff473d", textAlign: "center"}}>{title? title : "Ошибка"}</div></h2>
                <div style={{textAlign: "center"}}>{message}</div>
            </UI.Alert>
        );
    }

    displayToasts(text) {
        this.props.setPopout(
            <Toasts>
                {text}
            </Toasts>
        );
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

    toggleContext() {
        this.setState({
            contextOpened: !this.state.contextOpened
        });
    }

    onClickDeleteGds(confirm) {
        if(!confirm) {
            this.props.setPopout(
                <UI.Alert
                    actions={[{
                        title: 'Отменить',
                        autoclose: true,
                        style: 'cancel'
                    }, {
                        title: 'Удалить',
                        autoclose: true,
                        style: 'destructive',
                        action: () => this.onClickDeleteGds({}, true)
                    }]}
                    onClose={() => this.props.setPopout(null)}
                >
                    <h2><div style={{color: "#ff473d", textAlign: "center"}}>Удаление</div></h2>
                    <div style={{textAlign: "center"}}>Вы уверены, что хотите удалить объявление?</div>
                </UI.Alert>
            );

            return;
        }

        this.props.setPopout(<UI.ScreenSpinner />);

        axios.get("/api/remove_product.php", {
            params: {
                id: this.props.match.params.pId
            }
        }).then(res => {
            if(res.data.error) {
                this.displayError(res.data.error.message);

                return;
            }


            let gdsNew = [...this.props.gds['gds_new']];

            let indexOnArr = null;
            gdsNew.filter((e, i) => {
                if(+e.id === +this.props.match.params.pId) {
                    indexOnArr = i;
                    return true;
                }

                return false;
            });

            if(indexOnArr !== null) {
                gdsNew.splice(indexOnArr, 1);

                this.props.gdsUpdate({
                    "gds_new": gdsNew
                });
            }

            this.props.setPopout(null);

            this.props.history.replace("/main");
        }).catch(error => {
            this.props.setPopout(null);
            console.log(error);
        });
    }

    share() {
        let clb = (e) => {
            // let data = e.detail['data'];
            let type = e.detail['type'];

            if("VKWebAppShareResult" === type) {
                this.displayToasts("Ссылка отправлена");
            }

            // if("VKWebAppShareFailed" === type) {
            //     this.displayError("Поделится ссылкой не вышло, внутренняя ошибка");
            // }
        };

        VKConnect.unsubscribe(clb);
        VKConnect.subscribe(clb);
        VKConnect.send("VKWebAppShare", {"link": "https://vk.com/app6689902#product/" + this.props.match.params.pId});
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
                    <UI.Div>
                        <UI.Spinner/>
                    </UI.Div>
                </UI.Panel>
            );
        }

        const product = this.state.product;

        let allImages = [];

        if(product["images"] !== "") {
            allImages = product["images"].split(",");
        }

        let access = +product['id_vk'] === +this.props.vk.user.id || this.props.user['access'] > 6;

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader
                    left={<UI.HeaderButton onClick={() => this.props.history.goBack()}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    {access? (
                        <UI.PanelHeaderContent aside={<Icon16Dropdown />} onClick={this.toggleContext.bind(this)}>
                            Объявление
                        </UI.PanelHeaderContent>
                    ) : ("Объявление")}
                </UI.PanelHeader>

                {access? (
                    <UI.HeaderContext opened={this.state.contextOpened} onClose={this.toggleContext.bind(this)}>
                        <UI.List>
                            <UI.Cell
                                before={<Icon24Delete />}
                                onClick={this.onClickDeleteGds.bind(this, false)}
                            >
                                Удалить объявление
                            </UI.Cell>
                            <UI.Cell
                                before={<Icon24LogoLivejournal />}
                                onClick={() => this.props.history.push('/edit_product/' + this.props.match.params['pId'])}
                            >
                                Измненить объявление
                            </UI.Cell>
                        </UI.List>
                    </UI.HeaderContext>
                ) : null}

                <UI.Group title="Фотографии">
                    <UI.Gallery
                        slideWidth="100%"
                        style={{ height: 230 }}
                        bullets="dark"
                    >
                        {allImages.length? allImages.map((e, i) => {
                            let style = {
                                backgroundImage: 'url('+window.location.protocol + "//" + window.location.hostname +
                                "/sys/files/gds/" + e + "?v=" + product['time_update'] + ')',
                                backgroundSize: "cover"
                            };

                            return (
                                <div key={i} className="img_gallery" style={style}>
                                    <div className="price_product_img_wrap">
                                        <UI.Tooltip
                                            text="Цена на товар"
                                            isShown={this.state.tooltipPrice}
                                            onClose={() => this.setState({ tooltipPrice: false })}
                                            offsetX={10}
                                        >
                                            <div className="price_product_img"
                                                 onClick={() => this.setState({ tooltipPrice: !this.state.tooltipPrice })}>
                                                {product["price"] + " " + getCurrencyCode(product['country_id'])}
                                            </div>
                                        </UI.Tooltip>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="img_gallery"
                                 style={{backgroundImage: 'url(/images/no_photo_info.png)', backgroundSize: "cover"}}>
                                <div className="price_product_img_wrap">
                                    <div className="price_product_img">
                                        {product["price"] + " " + getCurrencyCode(product['country_id'])}
                                    </div>
                                </div>
                            </div>
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
                        <div style={{display: 'flex'}}>
                            <UI.Button
                                style={{ marginRight: 8 }}
                                onClick={this.toggleFavorites.bind(this)}
                                level={this.state.addedToFavorites? "2" : "buy"}
                                size="xl" before={this.state.addedToFavorites? <Icon24Like fill={UI.colors.red_light}/> : <Icon24LikeOutline/>}>
                                {this.state.addedToFavorites? "Убрать из избранного" : "В избранное"}
                            </UI.Button>
                            <UI.Button onClick={this.share.bind(this)} size="m" stretched level="secondary">
                                <Icon24Share/>
                            </UI.Button>
                        </div>
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
                                            text="Состояние товара: Б/у оценивает продавец по 5 бальной системе.
                                            У новых товаров всегда 5 баллов"
                                            isShown={this.state.tooltipHelp}
                                            onClose={() => this.setState({ tooltipHelp: false })}
                                            offsetX={16}
                                            offsetY={10}
                                            alignX="right"
                                        >
                                            <Icon24helpOutline fill={UI.colors.blue_400}
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
                                        <UI.InfoRow title="Страна">
                                            {product['country_title']}
                                        </UI.InfoRow>
                                    </UI.Cell>
                                    <UI.Cell>
                                        <UI.InfoRow title="Город">
                                            {product['city_title']}
                                        </UI.InfoRow>
                                    </UI.Cell>
                                    <UI.Cell multiline>
                                        <UI.InfoRow title="Вид товара">
                                            <div style={{display: "inline-block",
                                                background: "#ebf1f5",
                                                borderRadius: 4,
                                                margin: "4px 8px 4px 0",
                                                padding: "4px 8px"}}>
                                                {categories[product.category]['title']}
                                            </div>
                                            <div style={{display: "inline-block",
                                                background: "#ebf1f5",
                                                borderRadius: 4,
                                                padding: "4px 8px"}}>
                                                {categories[product.category]["sub"][product.subcategory]['title']}
                                            </div>
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
                                    {product['phone_number']? (
                                        <CopyToClipboard text={product['phone_number']}>
                                            <UI.Cell onClick={this.displayToasts.bind(this, "Номер скопирован")}
                                                     before={<Icon24Phone fill={UI.colors.azure_A400}/>}
                                                     asideContent={<Icon24Copy/>}>
                                                {product['phone_number']}
                                            </UI.Cell>
                                        </CopyToClipboard>
                                    ) : (
                                        <UI.Cell before={<Icon24Phone/>}>
                                            Не указан
                                        </UI.Cell>
                                    )}
                                    {product['email']? (
                                        <CopyToClipboard text={product['email']}>
                                            <UI.Cell onClick={this.displayToasts.bind(this, "E-mail скопирован")}
                                                     before={<Icon24Mention fill={UI.colors.azure_A400}/>}
                                                     asideContent={<Icon24Copy/>}>
                                                {product['email']}
                                            </UI.Cell>
                                        </CopyToClipboard>
                                    ) : (
                                        <UI.Cell before={<Icon24Mention/>}>
                                            Не указан
                                        </UI.Cell>
                                    )}
                                </UI.List>

                                <UI.Div>
                                    <UI.Link style={{color: "#fff"}}
                                             href={"https://vk.com/im?sel=" + this.state.seller['id']}>
                                        <UI.Button before={<Icon24LogoVk fill="#fff"/>} size="xl">
                                            Написать продавцу
                                        </UI.Button>
                                    </UI.Link>
                                </UI.Div>
                            </div>
                        )
                    }
                </UI.Group>

                <UI.Group>
                    <UI.Cell before={<Icon24LinkCircle/>}
                             onClick={() => (this.props.history.push("/gds_user_id/" + product['id_vk']))}>
                        <UI.Link>Все объявления продавца</UI.Link>
                    </UI.Cell>
                </UI.Group>

                <UI.Group>
                    <CopyToClipboard text={"https://vk.com/app6689902#product/" + this.props.match.params.pId}>
                        <UI.Cell onClick={this.displayToasts.bind(this, "Ссылка скопирована")}
                                 before={<Icon24Copy/>}>
                            <UI.Link>Копировать ссылку объявления</UI.Link>
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
        },
        setPopout: function (name) {
            dispatch(sysActions.setPopout(name))
        },
        gdsUpdate: function (name) {
            dispatch(gdsActions.gdsUpdate(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Info);