import React, { Component } from 'react';
import {connect} from 'react-redux';

import * as UI from '@vkontakte/vkui';

import Main from '../containers/Main';
import Filters from '../containers/Filters';
import SelectCityFilters from '../containers/SelectCityFilters';
import SelectCountryFilters from '../containers/SelectCountryFilters';
import Info from './product/Info';
import AddProduct from './product/AddProduct';
import SelectCountries from './SelectCountries';
import SelectCity from './SelectCity';
import Menu from './Menu';
import GdsUserId from './GdsUserId';
import Favorites from './Favorites';
import About from './About';

import * as sysActions from '../actions/sys';

import '@vkontakte/vkui/dist/vkui.css';

import Icon24Home from '@vkontakte/icons/dist/24/home';
import Icon24Filter from '@vkontakte/icons/dist/24/filter';
import Icon24Add from '@vkontakte/icons/dist/24/add';
import Icon28Menu from '@vkontakte/icons/dist/28/menu';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            renderer: false
        };
    }

    componentDidMount() {
        if(!this.props.vk.accessToken) {
            this.props.setRefresh(this.props.location.pathname);

            this.setState({
                renderer: true
            });

            this.props.history.replace("/");

            return;
        }

        this.setState({
            renderer: true
        });
    }

    render() {
        const pageId = this.props.match.params.pageId || 'main';

        if(!this.state.renderer) {
            return <div></div>
        }

        return (
            <div>
                <UI.Epic activeStory={this.props['sys']['active']['view']} tabbar={
                    <UI.Tabbar>
                        <UI.TabbarItem
                            onClick={() => this.props.history.push("/main")}
                            selected={pageId === 'main'}
                        ><Icon24Home /></UI.TabbarItem>
                        <UI.TabbarItem
                            onClick={() => this.props.history.push("/filters")}
                            selected={pageId === 'filters'}
                        ><Icon24Filter /></UI.TabbarItem>
                        <UI.TabbarItem
                            onClick={() => this.props.history.push("/add_product")}
                            selected={pageId === 'add_product'}
                        ><Icon24Add /></UI.TabbarItem>
                        <UI.TabbarItem
                            onClick={() => this.props.history.push("/menu")}
                            selected={pageId === 'menu'}
                        ><Icon28Menu /></UI.TabbarItem>
                    </UI.Tabbar>
                }>
                    <UI.View popout={this.props.sys.popout} id="mainView" activePanel={pageId}>
                        <Main id="main" {...this.props}/>
                        <Info id="product" {...this.props}/>
                        <AddProduct id="add_product" {...this.props}/>
                        <Menu id="menu" {...this.props}/>
                        <GdsUserId id="gds_user_id" {...this.props}/>
                        <Favorites id="favorites" {...this.props}/>
                        <Filters id="filters" {...this.props}/>
                        <About id="about" {...this.props}/>
                    </UI.View>

                    <UI.View id="choose" activePanel={this.props['sys']['active']['panel']}>
                        <SelectCountries id="addProductCountry" {...this.props} />
                        <SelectCity id="addProductCity" {...this.props} />
                        <SelectCountryFilters id="filtersCountry" {...this.props} />
                        <SelectCityFilters id="filtersCity" {...this.props} />
                    </UI.View>
                </UI.Epic>

                {/*<UI.Root activeView={this.props['sys']['active']['view']}>*/}
                    {/*<UI.View popout={this.props.sys.popout} id="mainView" activePanel={pageId}>*/}
                        {/*<Main id="main" {...this.props}/>*/}
                        {/*<Info id="product" {...this.props}/>*/}
                        {/*<Search id="search" {...this.props}/>*/}
                        {/*<AddProduct id="add_product" {...this.props}/>*/}
                        {/*<Menu id="menu" {...this.props}/>*/}
                        {/*<GdsUserId id="gds_user_id" {...this.props}/>*/}
                        {/*<Favorites id="favorites" {...this.props}/>*/}
                        {/*<Filters id="filters" {...this.props}/>*/}
                    {/*</UI.View>*/}

                    {/*<UI.View id="choose" activePanel={this.props['sys']['active']['panel']}>*/}
                        {/*<SelectCountries id="addProductCountry" {...this.props} />*/}
                        {/*<SelectCity id="addProductCity" {...this.props} />*/}
                        {/*<SelectCountryFilters id="filtersCountry" {...this.props} />*/}
                        {/*<SelectCityFilters id="filtersCity" {...this.props} />*/}
                    {/*</UI.View>*/}
                {/*</UI.Root>*/}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        sys: state.sys,
        vk: state.vk
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setRefresh: function (name) {
            dispatch(sysActions.setRefresh(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
