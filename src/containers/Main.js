import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';
import Icon24Search from '@vkontakte/icons/dist/24/search';
import Icon24Filter from '@vkontakte/icons/dist/24/filter';
import Icon24Add from '@vkontakte/icons/dist/24/add';
import Icon28Menu from '@vkontakte/icons/dist/28/menu';

import GalleryItem from '../components/Main/GalleryItem';

import '@vkontakte/vkui/dist/vkui.css';

import '../components/main.scss';

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab4: "dial"
        };
    }


    componentDidMount() {

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
                    <img className="logo_header" src="/images/logo_header.png" alt="" />
                </UI.PanelHeader>

                <div style={{marginBottom: 46}}>
                    <UI.FixedLayout vertical="bottom">
                        <div style={{display: 'flex', background: '#4CAF50'}}>
                            <UI.Button size="l" level="3" stretched
                                       onClick={() => (this.props.history.push("/search"))}>
                                <Icon24Search fill="#fff"/></UI.Button>
                            <UI.Button size="l" stretched level="3"
                                       onClick={() => (this.props.history.push("/filters"))}>
                                <Icon24Filter fill="#fff"/>
                            </UI.Button>
                            <UI.Button size="l" stretched level="3"
                                       onClick={() => (this.props.history.push("/add_product"))}>
                                <Icon24Add fill="#fff"/>
                            </UI.Button>
                            <UI.Button size="l" stretched level="3"
                                       onClick={() => (this.props.history.push("/menu"))}>
                                <Icon28Menu fill="#fff"/>
                            </UI.Button>
                        </div>
                    </UI.FixedLayout>

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

                    {/*{this.props.vk.accessToken}*/}

                    <UI.Group style={{ paddingBottom: 24 }}>
                        <UI.Header level="2" aside={<UI.Link>Показать все</UI.Link>}>
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
                        <UI.Header level="2" aside={<UI.Link>Показать все</UI.Link>}>
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
                                             description="Компьютеры"
                                             onClick={() => (this.props.history.push("/product/" + e.id))}>
                                        {e.title}
                                    </UI.Cell>
                                );
                            }) : null}
                        </UI.List>
                    </UI.Group>

                    <UI.Group style={{ paddingBottom: 24 }}>
                        <UI.Header level="2" aside={<UI.Link>Показать все</UI.Link>}>
                            Ваш город
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
                </div>
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

export default connect(mapStateToProps)(Main);