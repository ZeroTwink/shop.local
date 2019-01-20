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
import * as gdsAllActions from "../actions/gdsAll";
import * as sysActions from "../actions/sys";

class All extends Component {
    constructor(props) {
        super(props);

        this.state = {
            waitingContent: true, // Ждем первый запрос контента, крутим спиннер
            title: "НОВЫЕ ТОВАРЫ",
            headerTitle: "Новые"
        };

        this.scrolling = 0;

        this.idTimer = null;

        this.handleScroll = this.handleScroll.bind(this);
    }


    componentDidMount() {
        window.scroll(0, this.props.sys['scroll']['all']);
        // window.addEventListener('scroll', this.handleScroll, false);

        if(!categories[this.props.match.params.pId] && this.props.match.params.pId !== 'new') {
            this.setState({
                waitingContent: false
            });

            return;
        }

        let title = this.props.match.params.pId === 'new'? "НОВЫЕ ТОВАРЫ" : categories[this.props.match.params.pId]['title'];
        let headerTitle = this.props.match.params.pId === 'new'? "Новые" : "Категория";

        this.setState({
            title: title,
            headerTitle: headerTitle
        });

        if(this.props.gdsAll.type !== this.props.match.params.pId) {
            this.props.gdsAllSet({
                items: [],
                hasMore: true,
                page: 0,
                type: this.props.match.params.pId
            });

            window.scroll(0, 0);

            this.loadNextItems(0);
        }

        if(this.props.gdsAll.items.length && this.props.gdsAll.type === this.props.match.params.pId) {
            this.setState({
                waitingContent: false
            });
        }
    }

    // componentDidUpdate(props, state) {
    //     window.scroll(0, this.props.sys['scroll']['all']);
    // }

    componentWillUnmount() {
        // clearTimeout(this.idTimer);
        // window.removeEventListener('scroll', this.handleScroll, false);
        //
        // console.log("lolaaa");

        // window.scrollTo(0, 0);

        this.props.setScroll({
            all: window.pageYOffset
        });
    }

    handleScroll() {
        // clearTimeout(this.idTimer);
        // this.idTimer = setTimeout(() => {
        //     this.props.setScroll({
        //         all: window.pageYOffset
        //     });
        //     console.log(window.pageYOffset);
        // }, 50);
    }

    clickProduct(id, e) {
        this.props.history.push("/product/" + id);
    }

    loadNextItems(page) {
        if(!this.props.gdsAll.hasMore && this.props.gdsAll.type === this.props.match.params.pId) {
            this.setState({
                waitingContent: false
            });

            return;
        }

        axios.get("/api/all.php", {
            params: {
                id: this.props.match.params.pId,
                page: page || page === 0? page : this.props.gdsAll.page
            }
        }).then(res => {
            this.setState({
                waitingContent: false
            });

            let hasMore = true;
            if(res.data.response.gds.length < 40) {
                hasMore = false;
            }

            this.props.gdsAllSet({
                items: [...this.props.gdsAll.items, ...res.data.response.gds],
                hasMore: hasMore,
                page: this.props.gdsAll.page + 1
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
        this.props.gdsAll.items.map((e, i) => {
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
                         onClick={this.clickProduct.bind(this, e.id)}>
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
                    {this.state.headerTitle}
                </UI.PanelHeader>

                <UI.Group>
                    <UI.Header level="2">
                        {this.state.title}
                    </UI.Header>
                    <UI.List className="new_gds">
                        <InfiniteScroll
                            dataLength={items.length}
                            loadMore={this.loadNextItems.bind(this)}
                            hasMore={this.props.gdsAll.hasMore}
                            initialScrollY={200}
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
        vk: state.vk,
        sys: state.sys,
        gdsAll: state.gdsAll
    }
}

function mapDispatchToProps(dispatch) {
    return {
        gdsAllSet: function (name) {
            dispatch(gdsAllActions.gdsAllSet(name))
        },
        setScroll: function (name) {
            dispatch(sysActions.setScroll(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(All);