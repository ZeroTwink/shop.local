import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from '../utils/axios';
import * as UI from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';

import categories from '../utils/categories';

import '@vkontakte/vkui/dist/vkui.css';

// import InfiniteScroll from 'react-infinite-scroll-component';

import InfiniteScroll from './InfiniteScroll';
import * as vkActions from "../actions/vk";


class Info extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gds: [],
            hasMore: true,
            seller: {}
        };

        this.page = 0;
    }

    componentDidMount() {
        this.loadNextItems();

        if(+this.props.vk.user.id === +this.props.match.params['pId']) {
            this.setState({
                seller: this.props.vk.user
            });

            return;
        }

        let params = {user_ids: this.props.match.params['pId'], fields: "photo_50,photo_100,city"};
        vkActions.apiRequest("users.get", params, this.props.vk.accessToken, res => {
            this.setState({
                seller: res[0]
            });
        });
    }

    loadNextItems() {
        axios.get("/api/gds_user_id.php", {
            params: {
                id: this.props.match.params.pId,
                page: this.page
            }
        }).then(res => {
            this.setState({
                gds: [...this.state.gds, ...res.data.response.gds],
                hasMore: res.data.response.gds.length? true : false
            });

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
                                 <div style={{color: "#fff"}}>{e.price} ₽</div>
                             </div>
                         }
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

                <UI.Group>
                    <UI.Cell
                        size="l"
                        description="Продавец"
                        before={<UI.Avatar size={40} src={this.state.seller['photo_100']}/>}
                    >
                        {this.state.seller['first_name'] + " " + this.state.seller['last_name']}
                    </UI.Cell>
                </UI.Group>

                <UI.Group>
                    <UI.List className="new_gds">
                        <InfiniteScroll
                            dataLength={items.length}
                            loadMore={this.loadNextItems.bind(this)}
                            hasMore={this.state.hasMore}
                            loader={<div className="loader_infinite_scroll">
                                Загрузка...
                            </div>}>
                            {items.length? items : (<div className="message_empty">Нет объявлений</div>)}
                        </InfiniteScroll>
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

export default connect(mapStateToProps)(Info);