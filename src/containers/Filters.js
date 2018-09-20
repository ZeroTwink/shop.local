import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';



class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: "filters"
        };
    }


    componentDidMount() {

    }


    render() {
        const osname = UI.platform();

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader
                    left={<UI.HeaderButton onClick={() => this.props.history.goBack()}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    Фильтры
                </UI.PanelHeader>

                <UI.Search />

                <UI.Group>
                    <UI.Tabs>
                        <UI.TabsItem className="tabsl"
                                     onClick={() => this.setState({ activeTab: 'filters' })}
                                     selected={this.state.activeTab === 'filters'}
                        >
                            Фильтры
                        </UI.TabsItem>
                        <UI.TabsItem className="tabsl"
                                     onClick={() => this.setState({ activeTab: 'result' })}
                                     selected={this.state.activeTab === 'result'}
                        >
                            Результат
                        </UI.TabsItem>
                    </UI.Tabs>
                </UI.Group>

                <UI.Group>
                    {this.state.activeTab === 'filters'? (
                        <UI.FormLayout>
                            <UI.Input type="number" top={<span>Цена ₽ <span style={{color: "#4CAF50"}}>*</span></span>}/>
                        </UI.FormLayout>
                    ) : (
                        <div></div>
                    )}
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

export default connect(mapStateToProps)(Main);