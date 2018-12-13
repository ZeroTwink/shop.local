import React, { Component } from 'react';
import {connect} from 'react-redux';

import * as UI from '@vkontakte/vkui';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Done from '@vkontakte/icons/dist/24/done';

import * as sysActions from '../actions/sys';
import * as addProductActions from '../actions/addProduct';


class SelectCountries extends Component {
    constructor(props) {
        super(props);

        this.state = {
            vkCountries: {
                "items": [{
                    "id": 1,
                    "title": "Россия"
                }, {
                    "id": 2,
                    "title": "Украина"
                }, {
                    "id": 3,
                    "title": "Беларусь"
                }, {
                    "id": 4,
                    "title": "Казахстан"
                }]
            }
        };

        this.popstateHandler = this.popstateHandler.bind(this);
    }

    componentDidMount() {
        window.removeEventListener('hashchange', this.popstateHandler, false);
        window.addEventListener('hashchange', this.popstateHandler, false);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.popstateHandler, false);
    }

    popstateHandler(e) {
        let self = this;

        window.removeEventListener('hashchange', this.popstateHandler, false);

        if(self.props.sys.active['view'] === "choose") {
            self.props.history.push("/add_product");
            self.props.setActive({view: "mainView", panel: ""});
        }
    }

    onChangeCountry(e) {
        let city = null;
        if(this.props.vk.user['city'] && +this.props.vk.user['country']['id'] === +e.id) {
            city = this.props.vk.user['city'];
        }

        this.props.setValues({
            country: e,
            city: city
        });

        this.props.setActive({view: "mainView", panel: ""});
    }

    getSelectedCountryId() {
        let id = null;

        if(this.props.vk.user['country']) {
            id = this.props.vk.user['country']['id'];
        }

        if(this.props.addProduct.country) {
            id = this.props.addProduct.country.id
        }

        return id;
    }

    render() {
        const osname = UI.platform();

        return (
            <UI.Panel id="addProductCountry">
                <UI.PanelHeader
                    left={<UI.HeaderButton
                        onClick={() => this.props.setActive({view: "mainView", panel: ""})}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    Выбор страны
                </UI.PanelHeader>
                <UI.Group>
                    <UI.List>
                        {this.state.vkCountries.items? this.state.vkCountries.items.map((e, i) => (
                            <UI.Cell key={e.id}
                                onClick={this.onChangeCountry.bind(this, e)}
                                asideContent={e.id === this.getSelectedCountryId() ? <Icon24Done fill="#4caf50" /> : null}
                            >
                                {e.title}
                            </UI.Cell>
                        )) : null}
                    </UI.List>
                </UI.Group>
            </UI.Panel>
        )
    }
}

function mapStateToProps(state) {
    return {
        sys: state.sys,
        vk: state.vk,
        addProduct: state.addProduct
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setActive: function (name) {
            dispatch(sysActions.setActive(name))
        },
        setValues: function (name) {
            dispatch(addProductActions.setValues(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectCountries);
