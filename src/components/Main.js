import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';
import Icon24Search from '@vkontakte/icons/dist/24/search';
import Icon24Filter from '@vkontakte/icons/dist/24/filter';
import Icon24Add from '@vkontakte/icons/dist/24/add';

import axios from '../utils/axios';

import gdsLoad from '../actions/gdsLoad';

import '@vkontakte/vkui/dist/vkui.css';

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activePanel: "p1",
            activeTab4: "dial",
            showSearch: UI.platform() === UI.IOS,
            search: ''
        };

        this.toggleSearch = this.toggleSearch.bind(this);

        this.onChange = this.onChange.bind(this);
    }

    toggleSearch() {
        this.setState({
            search: '',
            showSearch: !this.state.showSearch
        });
    }

    onChange(search) {
        this.setState({ search });
    }

    componentDidMount() {
        axios.get("/api/test.php", {
            params: {
                level: 0
            }
        }).then(res => {
            this.props.gdsLoad(res.data.response.gds);

            console.log(this.props);
        }).catch(error => {
            console.log(error);
        });

        console.log(window.location);
    }


    render() {
        const osname = UI.platform();

        const itemStyle = {
            flexShrink: 0,
            width: 80,
            height: 94,
            display: 'flex',
            flexDirection:
                'column',
            alignItems: 'center',
            fontSize: 12
        };

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader
                    left={osname === UI.ANDROID && <UI.HeaderButton onClick={this.toggleSearch}><Icon24Search /></UI.HeaderButton>}>
                    {this.state.showSearch ?
                        <UI.Search
                            theme="header"
                            value={this.state.search}
                            onChange={this.onChange}
                            onClose={this.toggleSearch}
                        /> : 'Поиск'
                    }
                </UI.PanelHeader>

                {this.state.search.length > 2? (
                    <UI.Group title="Результат поиска">
                        <UI.List>
                            <UI.Cell before={<UI.Avatar type="app" src="/images/ava.jpg" />}
                                     asideContent={<span style={{color: UI.colors.blue}}>300 ₽</span>}
                                     description="Компьютеры"
                                     onClick={() => (this.props.history.push("/product/1"))}>
                                Корпус для ПК
                            </UI.Cell>
                            <UI.Cell before={<UI.Avatar type="app" src="/images/ava.jpg" />}
                                     asideContent={<span style={{color: UI.colors.blue}}>300 ₽</span>}
                                     description="Компьютеры"
                                     onClick={() => (this.props.history.push("/product/1"))}>
                                Шарики крутые
                            </UI.Cell>
                        </UI.List>
                    </UI.Group>
                ) : (
                    <div>
                        <UI.FixedLayout vertical="bottom">
                            <div style={{display: 'flex', background: '#4CAF50'}}>
                                <UI.Button size="l" level="3" stretched style={{ marginRight: 8 }}><Icon24Search fill="#fff"/></UI.Button>
                                <UI.Button size="l" stretched level="3"
                                           onClick={() => (this.props.history.push("/add_product"))}>
                                    <Icon24Filter fill="#fff"/>
                                </UI.Button>
                                <UI.Button size="l" stretched level="3"
                                           onClick={() => (this.props.history.push("/add_product"))}>
                                    <Icon24Add fill="#fff"/>
                                </UI.Button>
                            </div>
                        </UI.FixedLayout>

                        <UI.Group title="Новые товары">
                            <UI.Gallery
                                slideWidth="100%"
                                style={{ height: 150 }}
                                bullets="dark"
                            >
                                <div style={{ height: 150, backgroundColor: UI.colors.red }} />
                                <div style={{ height: 150, backgroundColor: UI.colors.green }} />
                                <div style={{ height: 150, backgroundColor: UI.colors.blue }} />
                            </UI.Gallery>
                        </UI.Group>

                        {this.props.vk.accessToken}

                        <UI.Group title="Новые товары">
                            <UI.List>
                                {this.props.gds.length? this.props.gds.map((e, i) => (
                                    <UI.Cell key={e.id} before={<UI.Avatar type="app" src="/images/ava.jpg" />}
                                             asideContent={<span style={{color: UI.colors.blue}}>300 ₽</span>}
                                             description="Компьютеры"
                                             onClick={() => (this.props.history.push("/product/" + e.id))}>
                                        {e.title}
                                    </UI.Cell>
                                )) : null}
                            </UI.List>
                        </UI.Group>
                    </div>
                )}

                <UI.Footer style={{marginBottom: 50}}>
                    <UI.Div>
                        <UI.Link style={{marginRight: 30}} onClick={() => (this.props.history.push("/about"))}>О нас </UI.Link>
                        <UI.Link>Правила</UI.Link>
                    </UI.Div>
                </UI.Footer>
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

function mapDispatchToProps(dispatch) {
    return {
        gdsLoad: function (name) {
            dispatch(gdsLoad(name));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);