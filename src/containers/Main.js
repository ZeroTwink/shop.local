import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';

import GalleryItem from '../components/Main/GalleryItem';

import categories from '../utils/categories';

import '@vkontakte/vkui/dist/vkui.css';

import * as sysActions from '../actions/sys';

import '../components/main.scss';

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab4: "dial"
        };
    }


    componentDidMount() {
        if(this.props.sys.refresh) {
            this.props.history.push(decodeURIComponent(this.props.sys.refresh));

            this.props.setRefresh("");
        }
    }

    componentWillMount() {
        // TODO убрать перед финальным
        // if(process.env.NODE_ENV !== 'production' && !this.props.gds['gds_new']) {
        //     this.props.history.push("/");
        //
        // }
    }


    render() {
        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader>
                    <img className={UI.getClassName("logo_header")} src="/images/logo_header.png" alt="" />
                </UI.PanelHeader>

                <div>
                    <UI.Group title="То что нужно">
                        <UI.Gallery
                            slideWidth="100%"
                            style={{ height: 170 }}
                            bullets="dark"
                            className="main_gallery_wrapper"
                        >
                            {this.props.gds.gds_new.length? this.props.gds.gds_new.map((e, i) => (
                                <GalleryItem key={e.id} ad={e} history={this.props.history} />
                            )) : null}
                        </UI.Gallery>
                    </UI.Group>

                    <UI.Group style={{ paddingBottom: 16 }}>
                        <UI.Header level="2">
                            Рекомендуемые
                        </UI.Header>
                        <UI.HorizontalScroll>
                            <div className="h_scroll_items_wrap">
                                {this.props.gds.gds_city.length? this.props.gds.gds_city.map((e, i) => {
                                    let image = "";
                                    if(e['images'] !== "") {
                                        image = e["images"].split(",")[0];

                                        image = window.location.protocol + "//" + window.location.hostname +
                                            "/sys/files/gds/" + image;
                                    } else {
                                        image = "/images/no_photo_info.png";
                                    }
                                    return (
                                        <div className="h_scroll_item" key={e.id}
                                             onClick={() => (this.props.history.push("/product/" + e.id))}>
                                            <div className="price">
                                                {e.price} ₽
                                            </div>
                                            <img className="img_avatar"
                                                 style={{backgroundImage: "url("+image+")" }} alt="" />
                                            <div className="text">
                                                {e.title}
                                            </div>
                                        </div>
                                    );
                                }) : null}
                            </div>
                        </UI.HorizontalScroll>
                    </UI.Group>

                    <UI.Group>
                        <UI.Header level="2" aside={<UI.Link
                            onClick={() => (this.props.history.push("/all/new"))}>Показать все</UI.Link>}>
                            НОВЫЕ ТОВАРЫ
                        </UI.Header>
                        <UI.List className="new_gds">
                            {this.props.gds.gds_new.length? this.props.gds.gds_new.map((e, i) => {
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

                                return(
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
                            }) : null}
                        </UI.List>
                    </UI.Group>
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
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);