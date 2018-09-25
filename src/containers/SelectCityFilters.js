import React, { Component } from 'react';
import {connect} from 'react-redux';

import * as UI from '@vkontakte/vkui';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Done from '@vkontakte/icons/dist/24/done';

import * as sysActions from '../actions/sys';
import * as filtersActions from '../actions/filters';

import * as vkActions from '../actions/vk';


class SelectCityFilters extends Component {
    constructor(props) {
        super(props);

        this.state = {
            vkCities: {},
            search: '',
            arrSearchCities: []
        };

        this.timerId = null;

        this.popstateHandler = this.popstateHandler.bind(this);
    }

    componentDidMount() {
        let idCountry = this.props.vk.user['country']? this.props.vk.user['country']['id'] : 1;
        if(this.props.filters['country']) {
            idCountry = this.props.filters['country']['id'];
        }

        let params = {
            country_id: idCountry,
            need_all: 0
        };
        vkActions.apiRequest("database.getCities", params, this.props.vk.accessToken, res => {
            this.setState({
                vkCities: res
            });
        });

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
            self.props.history.push("/filters");
            self.props.setActive({view: "mainView", panel: ""});
        }
    }

    onChangeCity(e) {
        this.props.setValues({
            city: e
        });

        this.props.setActive({view: "mainView", panel: ""});
    }

    getSelectedCityId() {
        let id = 1;

        if(this.props.vk.user['city']) {
            id = this.props.vk.user['city']['id'];
        }

        if(this.props.filters.city) {
            id = this.props.filters.city.id
        }

        return id;
    }

    onChangeSearch(search) {
        if(search === "") {
            clearTimeout(this.timerId);

            this.setState({
                search: "",
                arrSearchCities: []
            });

            return;
        }

        let idCountry = this.props.vk.user['country']? this.props.vk.user['country']['id'] : 1;
        if(this.props.filters['country']) {
            idCountry = this.props.filters['country']['id'];
        }

        let params = {
            country_id: idCountry,
            need_all: 0,
            q: search
        };

        clearTimeout(this.timerId);

        this.timerId = setTimeout(() => {
            vkActions.apiRequest("database.getCities", params, this.props.vk.accessToken, res => {
                this.setState({
                    arrSearchCities: res
                });

                clearTimeout(this.timerId);
            });
        }, 1000);

        this.setState({
            search
        });
    }

    get cities() {
        let cities = [];

        if(this.state.vkCities.items) {
            cities = this.state.vkCities.items;
        }

        if(this.state.arrSearchCities["items"]) {
            cities = this.state.arrSearchCities["items"];
        }

        return cities;
    }

    render() {
        const osname = UI.platform();

        return (
            <UI.Panel id="filtersCity">
                <UI.PanelHeader
                    left={<UI.HeaderButton
                        onClick={() => this.props.setActive({view: "mainView", panel: ""})}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    Выбор города
                </UI.PanelHeader>

                <UI.Search value={this.state.search} onChange={this.onChangeSearch.bind(this)}/>

                <UI.Group>
                    <UI.List>
                        <UI.Cell key="0"
                                 onClick={this.onChangeCity.bind(this, {id: 0, title: "Любой город"})}
                                 asideContent={0 === this.getSelectedCityId() ? <Icon24Done fill="#4caf50" /> : null}
                        >
                            Любой город
                        </UI.Cell>
                        {this.cities? this.cities.map((e, i) => (
                            <UI.Cell key={e.id}
                                     onClick={this.onChangeCity.bind(this, e)}
                                     asideContent={e.id === this.getSelectedCityId() ? <Icon24Done fill="#4caf50" /> : null}
                            >
                                {e.title}
                            </UI.Cell>
                        )) : (
                            <UI.Cell>
                                Нет результятов
                            </UI.Cell>
                        )}
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
        filters: state.filters
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setActive: function (name) {
            dispatch(sysActions.setActive(name))
        },
        setValues: function (name) {
            dispatch(filtersActions.setValues(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectCityFilters);
