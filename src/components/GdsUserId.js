import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from '../utils/axios';
import * as UI from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';

import '@vkontakte/vkui/dist/vkui.css';

import InfiniteScroll from 'react-infinite-scroll-component';


class Info extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gds: [],
            hasMore: true,
            requestSend: false
        };

        this.page = 0;
    }

    componentDidMount() {
        this.loadNextItems();
    }

    loadNextItems() {
        if(this.state.requestSend) {
            return;
        }

        this.setState({
            requestSend: true
        });

        axios.get("/api/gds_user_id.php", {
            params: {
                id: this.props.match.params.pId,
                page: this.page
            }
        }).then(res => {
            this.setState({
                gds: [...this.state.gds, ...res.data.response.gds],
                hasMove: !res.data.response.gds.length,
                requestSend: false
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
                         description="Компьютеры"
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
                        before={<UI.Avatar size={40} src={this.props.vk.user['photo_100']}/>}
                    >
                        {this.props.vk.user['first_name'] + " " + this.props.vk.user['last_name']}
                    </UI.Cell>
                </UI.Group>

                <UI.Group>
                    <UI.List className="new_gds">
                        <InfiniteScroll
                            dataLength={items.length}
                            next={this.loadNextItems.bind(this)}
                            hasMore={this.state.hasMore}
                            refreshFunction={this.loadNextItems.bind(this)}
                            pullDownToRefresh
                            pullDownToRefreshContent={
                                <div className="pull_down">
                                    <div className="img_one" />
                                </div>
                            }
                            releaseToRefreshContent={
                                <div className="pull_down">
                                    <div className="img_two" />
                                </div>
                            }>
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