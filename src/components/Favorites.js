import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from '../utils/axios';
import * as UI from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';

import categories from '../utils/categories';

import InfiniteScroll from 'react-infinite-scroll-component';


class Favorites extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gds: [],
            hasMore: true
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
                hasMove: !res.data.response.gds.length
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
                    Избранное
                </UI.PanelHeader>

                <UI.Group>
                    <UI.List className="new_gds">
                        <InfiniteScroll
                            dataLength={items.length}
                            next={this.loadNextItems.bind(this)}
                            hasMore={this.state.hasMore}>
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
        vk: state.vk
    }
}

export default connect(mapStateToProps)(Favorites);