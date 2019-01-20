import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from '../utils/axios';
import * as UI from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon16Like from '@vkontakte/icons/dist/16/like';

import categories from '../utils/categories';

import '@vkontakte/vkui/dist/vkui.css';

// import InfiniteScroll from 'react-infinite-scroll-component';

import InfiniteScroll from './InfiniteScroll';
import * as vkActions from "../actions/vk";

import getCurrencyCode from '../helpers/getCurrencyCode';
import * as sysActions from "../actions/sys";
import * as gdsUserIdActions from "../actions/gdsUserId";


class Info extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gds: [],
            hasMore: true,
            seller: {},
            waitingContent: true // Ждем первый запрос контента, крутим спиннер
        };
    }

    componentDidMount() {
        window.scroll(0, this.props.sys['scroll']['gdsUserId']);

        if(+this.props.vk.user.id === +this.props.match.params['pId']) {
            this.setState({
                seller: this.props.vk.user
            });
        } else {
            let params = {user_ids: this.props.match.params['pId'], fields: "photo_50,photo_100,city"};
            vkActions.apiRequest("users.get", params, this.props.vk.accessToken, res => {
                this.setState({
                    seller: res[0]
                });
            });
        }

        if(this.props.gdsUserId.idUser !== this.props.match.params.pId) {
            this.props.gdsUserIdSet({
                items: [],
                hasMore: true,
                page: 0,
                idUser: this.props.match.params.pId
            });

            window.scroll(0, 0);

            this.loadNextItems(0);
        }

        if(this.props.gdsUserId.items.length && this.props.gdsUserId.idUser === this.props.match.params.pId) {
            this.setState({
                waitingContent: false
            });
        }

        if(!this.props.gdsUserId.items.length && this.props.gdsUserId.idUser === this.props.match.params.pId) {
            this.setState({
                waitingContent: false
            });
        }
    }

    componentWillUnmount() {
        this.props.setPopout(null);

        this.props.setScroll({
            gdsUserId: window.pageYOffset
        });
    }

    displayActionSheet() {
        const osname = UI.platform();

        if(+this.props.vk.user.id === +this.props.match.params['pId']) {
            return;
        }

        this.props.setPopout(
            <UI.ActionSheet
                onClose={() => this.props.setPopout(null)}
                title="Действие"
                text="Выберите подходящий пункт"
            >
                <UI.ActionSheetItem
                    autoclose
                    onClick={() => {
                        let a = document.createElement('a');
                        a.title = "my title text";
                        a.href = "https://vk.com/id" + this.props.match.params['pId'];
                        a.click();
                    }}>
                    Открыть профиль
                </UI.ActionSheetItem>
                <UI.ActionSheetItem
                    autoclose
                    onClick={() => {
                        let a = document.createElement('a');
                        a.title = "my title text";
                        a.href = "https://vk.me/id" + this.props.match.params['pId'];
                        a.click();
                    }}>
                    Написать сообщение
                </UI.ActionSheetItem>
                {osname === UI.IOS && <UI.ActionSheetItem autoclose theme="cancel">Отменить</UI.ActionSheetItem>}
            </UI.ActionSheet>
        );
    }

    loadNextItems(page) {
        axios.get("/api/gds_user_id.php", {
            params: {
                id: this.props.match.params.pId,
                page: page || page === 0? page : this.props.gdsUserId.page
            }
        }).then(res => {
            if(this.state.waitingContent) {
                this.setState({
                    waitingContent: false
                });
            }

            let hasMore = true;
            if(res.data.response.gds.length < 10) {
                hasMore = false;
            }

            this.props.gdsUserIdSet({
                items: [...this.props.gdsUserId.items, ...res.data.response.gds],
                hasMore: hasMore,
                page: this.props.gdsUserId.page + 1
            });
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

    render() {
        const osname = UI.platform();


        let items = [];
        this.props.gdsUserId.items.map((e, i) => {
            let image = "";
            if(e['images'] !== "") {
                image = e["images"].split(",")[e['image_preview']];

                image = window.location.protocol + "//" + window.location.hostname +
                    "/sys/files/gds/" + image + "?v=" + e['time_update'];
            } else {
                image = "/images/no_photo_info.png";
            }

            let style = {
                backgroundSize: "cover",
                backgroundImage: "url("+image+")",
                backgroundPosition: "center 35%"
            };

            items.push(
                <UI.Cell key={e.id}
                         before={<UI.Avatar type="image" style={style} size={64} />}
                         asideContent={
                             <div className="price" style={{color: UI.colors.blue}}>
                                 <div style={{color: "#fff"}}>
                                     {this.getPrice(e.price, e.country_id)}
                                 </div>
                             </div>
                         }
                         bottomContent={
                             <div style={{display: "flex", fontSize: 13, color: "#909399"}}>
                                 <Icon16Like fill="#fb7788"/>
                                 <div style={{width: 30, margin: "-1px 4px 0 6px"}}>{e.favorites}</div>
                                 <img style={{width: 16, height: 16, opacity: 0.4}}
                                      src="/images/view32.png" alt="" />
                                 <div style={{margin: "-1px 0 0 6px"}}>{e.views}</div>
                             </div>
                         }
                         size="l"
                         description={categories[e.category]['title']}
                         onClick={() => (this.props.history.push("/product/" + e.id))}>
                    {e.title}
                </UI.Cell>
            );

            return true;
        });

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader
                    left={<UI.HeaderButton onClick={() => this.props.history.goBack()}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    Объявления
                </UI.PanelHeader>

                {this.state.seller['first_name']? (
                    <UI.Group>
                        <UI.Cell
                            onClick={+this.props.vk.user.id !== +this.props.match.params['pId']
                                ? this.displayActionSheet.bind(this) : null}
                            before={<UI.Avatar size={40} src={this.state.seller['photo_100']}/>}
                        >
                            {this.state.seller['first_name'] + " " + this.state.seller['last_name']}
                        </UI.Cell>
                    </UI.Group>
                ) : null}

                <UI.Group>
                    <UI.List className="new_gds">
                        <InfiniteScroll
                            dataLength={items.length}
                            loadMore={this.loadNextItems.bind(this)}
                            hasMore={this.props.gdsUserId.hasMore}
                            loader={<UI.Div>
                                <UI.Spinner size={20} strokeWidth={2}/>
                            </UI.Div>}>
                            {items.length? items : null}
                            {!this.state.waitingContent && !items.length? <div className="message_empty">Нет объявлений</div> : null}
                        </InfiniteScroll>
                    </UI.List>
                </UI.Group>

                {this.state.waitingContent? (
                    <UI.Div>
                        <UI.Spinner/>
                    </UI.Div>
                ) : null }
            </UI.Panel>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        gds: state.gds,
        vk: state.vk,
        sys: state.sys,
        gdsUserId: state.gdsUserId
    }
}

function mapDispatchToProps(dispatch) {
    return {
        gdsUserIdSet: function (name) {
            dispatch(gdsUserIdActions.gdsUserIdSet(name))
        },
        setScroll: function (name) {
            dispatch(sysActions.setScroll(name))
        },
        setPopout: function (name) {
            dispatch(sysActions.setPopout(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Info);