import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';
import Icon24Search from '@vkontakte/icons/dist/24/search';

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
        this.setState({ showSearch: !this.state.showSearch });
    }

    onChange(search) {
        this.setState({ search });
    }

    componentDidMount() {

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

                <UI.Group title="Рекомендованое" style={{ paddingBottom: 8 }}>
                    <UI.HorizontalScroll>
                        <div style={{ display: 'flex' }}>
                            <div style={{ ...itemStyle, paddingLeft: 4 }}>
                                <UI.Avatar size={64} style={{ marginBottom: 8 }}>f</UI.Avatar>
                                Элджей
                            </div>
                            <div style={itemStyle}>
                                <UI.Avatar size={64} style={{ marginBottom: 8 }}>fs</UI.Avatar>
                                Ольга
                            </div>
                            <div style={itemStyle}>
                                <UI.Avatar size={64} style={{ marginBottom: 8 }}>fs</UI.Avatar>
                                Ольга
                            </div>
                            <div style={itemStyle}>
                                <UI.Avatar size={64} style={{ marginBottom: 8 }}>fs</UI.Avatar>
                                Ольга
                            </div>
                            <div style={itemStyle}>
                                <UI.Avatar size={64} style={{ marginBottom: 8 }}>fs</UI.Avatar>
                                Ольга
                            </div>
                            <div style={itemStyle}>
                                <UI.Avatar size={64} style={{ marginBottom: 8 }}>fs</UI.Avatar>
                                Ольга
                            </div>
                        </div>
                    </UI.HorizontalScroll>
                </UI.Group>

                <UI.Group title="Новые товары">
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

                <UI.Footer>
                    <UI.Link style={{marginRight: 30}} onClick={() => (this.props.history.push("/about"))}>О нас </UI.Link>
                    <UI.Link>Правила</UI.Link>
                </UI.Footer>
            </UI.Panel>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
    }
}

export default connect(mapStateToProps)(Main);