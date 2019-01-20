import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from '../../utils/axios';
import Toasts from '../Toasts';
import * as UI from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24LinkCircle from '@vkontakte/icons/dist/24/link_circle';
import Icon24Copy from '@vkontakte/icons/dist/24/copy';
import Icon16Dropdown from '@vkontakte/icons/dist/16/dropdown';
// import Icon24Delete from '@vkontakte/icons/dist/24/delete';
import Icon24LikeOutline from '@vkontakte/icons/dist/24/like_outline';
import Icon24Like from '@vkontakte/icons/dist/24/like';
import Icon24Share from '@vkontakte/icons/dist/24/share';
// import Icon24LogoLivejournal from '@vkontakte/icons/dist/24/logo_livejournal';
import Icon16Like from '@vkontakte/icons/dist/16/like';

import getCurrencyCode from '../../helpers/getCurrencyCode';

import VKConnect from '../../utils/VKConnect';

import * as vkActions from '../../actions/vk';
import * as userActions from '../../actions/user';
import * as sysActions from '../../actions/sys';
import * as gdsActions from '../../actions/gds';
import * as gdsFavoritesActions from "../../actions/gdsFavorites";

import {CopyToClipboard} from 'react-copy-to-clipboard';

import '@vkontakte/vkui/dist/vkui.css';
import './info.scss';
import * as gdsUserIdActions from "../../actions/gdsUserId";

import GalleryImages from '../GalleryImages';
import InfoViewArchive from './InfoViewArchive';
import InfoTabContacts from './InfoTabContacts';
import InfoItemsInfo from './InfoItemsInfo';
import InfoContextMenu from './InfoContextMenu';


class Info extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab4: "dial",
            tooltipPrice: false,

            waitLoadProduct: true,

            product: {},

            seller: {},

            addedToFavorites: false,
            // Идет запрос на сервер, не делать повторных действий
            requestFavorites: false,

            contextOpened: false
        };

        this.toggleContext = this.toggleContext.bind(this);
    }

    componentDidMount() {
        window.scrollTo(0, 0);

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
            let params = {user_ids: isProductOpen['id_vk'], fields: "photo_50,city,can_write_private_message"};
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
                this.displayError(res.data.error.message, '', res.data.error['importance']);

                return;
            }

            let params = {user_ids: res.data.response.product['id_vk'], fields: "photo_50,city,can_write_private_message"};
            vkActions.apiRequest("users.get", params, this.props.vk.accessToken, dataVK => {
                this.setState({
                    seller: dataVK[0]
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

    componentWillUnmount() {
        this.props.setPopout(null);
    }

    displayError(message, title, importance) {
        this.props.setPopout(
            <UI.Alert
                actions={[{
                    title: 'OK',
                    autoclose: true,
                    style: 'destructive'
                }]}
                onClose={() => {
                    this.props.setPopout(null);

                    if(importance) {
                        this.props.history.replace("/main");
                    }
                }}
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

        let gdsNew = [...this.props.gds['gds_new']];
        let gdsOpen = [...this.props.gds['open']];

        let indexOnArr = null;
        gdsNew.filter((e, i) => {
            if(+e.id === +this.props.match.params.pId) {
                indexOnArr = i;
                return true;
            }

            return false;
        });

        let indexOnArrOpen = null;
        gdsOpen.filter((e, i) => {
            if(+e.id === +this.props.match.params.pId) {
                indexOnArrOpen = i;
                return true;
            }

            return false;
        });

        if(indexOnArrOpen !== null) {
            if(type === "add") {
                gdsOpen[indexOnArrOpen]['favorites'] = +gdsOpen[indexOnArrOpen]['favorites'] + 1;
            } else {
                gdsOpen[indexOnArrOpen]['favorites'] = +gdsOpen[indexOnArrOpen]['favorites'] - 1;
            }

            this.props.gdsUpdate({
                "open": gdsOpen
            });
        }

        if(indexOnArr !== null) {
            if(type === "add") {
                gdsNew[indexOnArr]['favorites'] = +gdsNew[indexOnArr]['favorites'] + 1;
            } else {
                gdsNew[indexOnArr]['favorites'] = +gdsNew[indexOnArr]['favorites'] - 1;
            }

            this.props.gdsUpdate({
                "gds_new": gdsNew
            });
        }

        // let product = {...this.state.product};
        // if(type === "add") {
        //     product['favorites'] = +product['favorites'] + 1;
        // } else {
        //     product['favorites'] = +product['favorites'] - 1;
        // }
        //
        // this.setState({
        //     product: product
        // });

        // Обнуляем кэш избранного, чтобы подгрузить заново с сервера
        this.props.gdsFavoritesSet({
            items: [],
            hasMore: true,
            page: 0
        });

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
            contextOpened: !this.state.contextOpened,
            tooltipPrice: false
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


    restoreArchiveGds() {
        this.props.setPopout(<UI.ScreenSpinner />);

        axios.get("/api/archive.php", {
            params: {
                id: this.props.match.params.pId
            }
        }).then(res => {
            console.log(res);

            this.setState({
                product: res.data.response['product']
            });

            let gdsOpen = [...this.props.gds['open']];
            let upOpen = gdsOpen.map((e, i) => {
                if(+e['id'] === +res.data.response['product']['id']) {
                    return res.data.response['product'];
                }

                return e;
            });

            this.props.gdsUpdate({
                "open": upOpen
            });

            this.props.setPopout(null);

        }).catch(error => {
            console.log(error);
        });
    }

    getPrice(price, country_id) {
        if(+price === 0) {
            return (
                <span style={{fontSize: 12}}>Бесплатно</span>
            );
        }

        return (
            <React.Fragment>
                {price + " "}
                <span style={{fontSize: 11}}>{getCurrencyCode(country_id)}</span>
            </React.Fragment>
        );
    }

    viewGalleryImages(image, allImages, timeUpdate, activeImage, product) {
        // this.props.history.push("/product/" + this.props.match.params.pId + '/gallery');

        this.props.setPopout(<GalleryImages activeImage={activeImage}
                                            timeUpdate={timeUpdate}
                                            allImages={allImages}
                                            product={product}
                                            {...this.props}
                                            urlChange={"/product/" + this.props.match.params.pId}/>);
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
                        <UI.PanelHeaderContent aside={<Icon16Dropdown />} onClick={this.toggleContext}>
                            Объявление
                        </UI.PanelHeaderContent>
                    ) : ("Объявление")}
                </UI.PanelHeader>

                {access? (
                    <InfoContextMenu opened={this.state.contextOpened}
                                     product={product}
                                     history={this.props.history}
                                     match={this.props.match}
                                     close={this.toggleContext.bind(this)}
                                     displayError={this.displayError.bind(this)}
                                     lastPathname={this.props.lastPathname}/>
                ) : null}

                {+product['archive']? (
                    <InfoViewArchive product={product}
                                     vkUser={this.props.vk.user}
                                     restoreArchiveGds={this.restoreArchiveGds.bind(this)}/>
                ) : null}

                <UI.Group title="Фотографии">
                    <div style={{position: "relative"}}>
                        <div className="price_product_img_wrap">
                            <UI.Tooltip
                                text="Цена на товар"
                                isShown={this.state.tooltipPrice}
                                onClose={() => this.setState({ tooltipPrice: false })}
                                offsetX={10}
                            >
                                <div className="price_product_img"
                                     onClick={() => this.setState({ tooltipPrice: !this.state.tooltipPrice })}>
                                    {this.getPrice(product["price"], product['country_id'])}
                                </div>
                            </UI.Tooltip>
                        </div>

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
                                    <div onClick={this.viewGalleryImages.bind(this, window.location.protocol
                                        + "//" + window.location.hostname +
                                        "/sys/files/gds/" + e + "?v=" + product['time_update'], allImages, product['time_update'], i, product)}
                                         key={i} className="img_gallery" style={style}>

                                    </div>
                                );
                            }) : (
                                <div className="img_gallery"
                                     style={{backgroundImage: 'url(/images/no_photo_info.png)', backgroundSize: "cover"}}>
                                </div>
                            )}
                        </UI.Gallery>
                    </div>

                    <UI.Cell
                        bottomContent={
                            <div style={{display: "flex", fontSize: 13, color: "#909399"}}>
                                <Icon16Like fill="#fb7788"/>
                                <div style={{width: 30, margin: "-1px 4px 0 6px"}}>{product.favorites}</div>
                                <img style={{width: 16, height: 16, opacity: 0.4, marginLeft: "auto"}}
                                     src="/images/view32.png" alt="" />
                                <div style={{margin: "-1px 0 0 6px"}}>{product.views}</div>
                            </div>
                        }
                        size="l" />
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
                                {this.state.addedToFavorites? "В избранном" : "В избранное"}
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
                            <InfoItemsInfo product={product} seller={this.state.seller}/>
                        ) : (
                            <InfoTabContacts product={product} seller={this.state.seller}/>
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
        },
        gdsFavoritesSet: function (name) {
            dispatch(gdsFavoritesActions.gdsFavoritesSet(name))
        },
        gdsUserIdSet: function (name) {
            dispatch(gdsUserIdActions.gdsUserIdSet(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Info);