import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';

import axios from '../utils/axios';

import categories from '../utils/categories';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';

import Icon16Like from '@vkontakte/icons/dist/16/like';

// import InfiniteScroll from 'react-infinite-scroll-component';

import InfiniteScroll from '../components/InfiniteScroll';

import getCurrencyCode from '../helpers/getCurrencyCode';

class All extends Component {
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
        axios.get("/api/archive.php", {
            params: {
                // id: this.props.match.params.pId,
                page: this.page
            }
        }).then(res => {
            this.setState({
                gds: [...this.state.gds, ...res.data.response.gds],
                hasMore: res.data.response.gds.length? true : false,
                waitingContent: false
            });

            this.page++;

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
        this.state.gds.map((e, i) => {
            let image = "";
            if(e['images'] !== "") {
                image = e["images"].split(",")[e['image_preview']];

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
                    Архивные
                </UI.PanelHeader>

                <UI.Group>
                    <UI.List className="new_gds">
                        <InfiniteScroll
                            dataLength={items.length}
                            loadMore={this.loadNextItems.bind(this)}
                            hasMore={this.state.hasMore}
                            loader={<UI.Div>
                                <UI.Spinner size={20} strokeWidth={2}/>
                            </UI.Div>}>
                            {items.length? items : null}
                            {!this.state.waitingContent && !items.length? <div className="message_empty">Архив пуст</div> : null}
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

export default connect(mapStateToProps)(All);