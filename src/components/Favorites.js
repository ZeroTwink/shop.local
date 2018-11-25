import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from '../utils/axios';
import * as UI from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon16Like from '@vkontakte/icons/dist/16/like';

import categories from '../utils/categories';

// import InfiniteScroll from 'react-infinite-scroll-component';
import InfiniteScroll from '../components/InfiniteScroll';
import getCurrencyCode from "../helpers/getCurrencyCode";
import * as userActions from "../actions/user";


class Favorites extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gds: [],
            hasMore: true,
            waitingContent: true // Ждем первый запрос контента, крутим спиннер
        };

        this.page = 0;
    }

    componentDidMount() {
        this.loadNextItems();
    }

    loadNextItems() {
        axios.get("/api/get_favorites.php", {
            params: {
                page: this.page
            }
        }).then(res => {
            this.setState({
                gds: [...this.state.gds, ...res.data.response.gds],
                hasMore: res.data.response.gds.length? true : false,
                waitingContent: false
            });

            if(res.data.response['remove_arr'].length) {
                let arr = [...this.props.user.favorites];

                let arrNew = arr.filter((e) => {
                    return res.data.response['remove_arr'].indexOf(e) === -1;
                });

                this.props.userUpdate({
                    favorites: arrNew
                });
            }

            this.page++;
        }).catch(error => {
            console.log(error);
        });
    }


    render() {
        const osname = UI.platform();

        let items = [];
        this.state.gds.map((e, i) => {
            let image = "";
            if(e['images'] !== "") {
                image = e["images"].split(",")[0];

                image = window.location.protocol + "//" + window.location.hostname +
                    "/sys/files/gds/" + image;
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
                                     {e.price + " "}
                                     <span style={{fontSize: 11}}>{getCurrencyCode(e.country_id)}</span>
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
                    Избранное
                </UI.PanelHeader>

                <UI.Group title="Избранное">
                    <UI.List className="new_gds">
                        <InfiniteScroll
                            dataLength={items.length}
                            loadMore={this.loadNextItems.bind(this)}
                            hasMore={this.state.hasMore}
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

export default connect(mapStateToProps, mapDispatchToProps)(Favorites);