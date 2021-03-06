import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';

import GalleryItem from '../components/Main/GalleryItem';

import categories from '../utils/categories';

import getCurrencyCode from '../helpers/getCurrencyCode';

import '@vkontakte/vkui/dist/vkui.css';

import * as sysActions from '../actions/sys';

import '../components/main.scss';

import Icon16Like from '@vkontakte/icons/dist/16/like';

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab4: "dial"
        };
    }


    componentDidMount() {
        window.scroll(0, this.props.sys['scroll']['main']);
        // if(this.lastTabbar === pageId) {
        //     window.scrollTo({
        //         top: 0,
        //         behavior: "smooth"
        //     });
        // }

        if(this.props.sys.refresh) {
            this.props.history.push(decodeURIComponent(this.props.sys.refresh));

            this.props.setRefresh("");
        }
    }

    componentWillUnmount() {
        this.props.setScroll({
            main: window.pageYOffset
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
        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader>
                    <img className={UI.getClassName("logo_header")} src="/images/logo_header3.png" alt="" />
                </UI.PanelHeader>

                <div>
                    <UI.Group>
                        <UI.Gallery
                            slideWidth="100%"
                            style={{ height: 190 }}
                            bullets="light"
                            className="main_gallery_wrapper"
                        >
                            {this.props.gds.gds_city.length? this.props.gds.gds_city.map((e, i) => (
                                <GalleryItem key={e.id}
                                             ad={e}
                                             price={this.getPrice(e.price, e.country_id)}
                                             history={this.props.history} />
                            )) : null}
                        </UI.Gallery>
                    </UI.Group>

                    <UI.Group>
                        <UI.Header onClick={() => (this.props.history.push("/all/new"))} level="2"
                                   aside={<UI.Link>Показать все</UI.Link>}>
                            НОВЫЕ
                        </UI.Header>
                        <UI.List className="new_gds">
                            {this.props.gds.gds_new.length? this.props.gds.gds_new.map((e, i) => {
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

                                return(
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
                            }) : null}
                        </UI.List>
                    </UI.Group>

                    {Object.keys(this.props.gds.categories).map((key, i) => (
                        this.props.gds.categories[key].length? (
                            <UI.Group key={key} style={{ paddingBottom: 16 }}>
                                <UI.Header level="2"
                                           onClick={() => this.props.gds.categories[key].length > 9? this.props.history.push("/all/" + key) : null}
                                           aside={this.props.gds.categories[key].length > 9? <UI.Link>Все</UI.Link> : null}>
                                    {categories[key]['title']}
                                </UI.Header>
                                <UI.HorizontalScroll>
                                    <div className="h_scroll_items_wrap">
                                        {this.props.gds.categories[key].map((e, i) => {
                                            let image = "";
                                            if(e['images'] !== "") {
                                                image = e["images"].split(",")[e['image_preview']];

                                                image = window.location.protocol + "//" + window.location.hostname +
                                                    "/sys/files/gds/" + image + "?v=" + e['time_update'];
                                            } else {
                                                image = "/images/no_photo_info.png";
                                            }
                                            return (
                                                <div className="h_scroll_item" key={e.id}
                                                     onClick={() => (this.props.history.push("/product/" + e.id))}>
                                                    <div className="price">
                                                        {this.getPrice(e.price, e.country_id)}
                                                    </div>
                                                    <img className="img_avatar"
                                                         style={{backgroundImage: "url("+image+")" }} alt="" />
                                                    <div className="text">
                                                        {e.title}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </UI.HorizontalScroll>
                            </UI.Group>
                        ) : null
                    ))}
                </div>
            </UI.Panel>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        gds: state.gds,
        vk: state.vk,
        sys: state.sys
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setRefresh: function (name) {
            dispatch(sysActions.setRefresh(name))
        },
        setScroll: function (name) {
            dispatch(sysActions.setScroll(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);