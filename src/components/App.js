import React, { Component } from 'react';
import {connect} from 'react-redux';

import * as UI from '@vkontakte/vkui';

import Main from '../containers/Main';
import Filters from '../containers/Filters';
import SetNotifications from '../containers/SetNotifications';
import Notifications from '../containers/Notifications';
import SelectCityFilters from '../containers/SelectCityFilters';
import SelectCountryFilters from '../containers/SelectCountryFilters';
import Archive from '../containers/Archive';
import Info from './product/Info';
import AddProduct from './product/AddProduct';
import EditProduct from './product/EditProduct';
import SelectCountries from './SelectCountries';
import SelectCity from './SelectCity';
import Menu from './Menu';
import GdsUserId from './GdsUserId';
import Favorites from './Favorites';
import About from './About';
import All from './All';
import Rules from './Rules';

import * as sysActions from '../actions/sys';

import '@vkontakte/vkui/dist/vkui.css';

import Icon24Home from '@vkontakte/icons/dist/24/home';
import Icon24Filter from '@vkontakte/icons/dist/24/filter';
import Icon28AddOutline from '@vkontakte/icons/dist/28/add_outline';
import Icon28Menu from '@vkontakte/icons/dist/28/menu';
import Icon28Notification from '@vkontakte/icons/dist/28/notification';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            renderer: false
        };

        this.lastTabbar = 'main';
        this.lastLocation = null;
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

    componentWillReceiveProps(nextProps) {
        if (this.props.location === nextProps.location) {
            return;
        }

        if (this.props.location.pathname === nextProps.location.pathname) {
            return;
        }

        this.lastLocation = {
            ...this.props.location
        };
    }

    onTransition() {
        // console.log(this.props.match.params.pageId, this.props.sys['scroll'][this.props.match.params.pageId]);
        // if(this.props.sys['scroll'][this.props.match.params.pageId]) {
        //     window.scrollTo({left: 0, top: this.props.sys['scroll'][this.props.match.params.pageId], behavior: "auto"});
        // } else {
        //     window.scrollTo(0, 0);
        // }
    }

    render() {
        console.log(this.lastLocation);
        const pageId = this.props.match.params.pageId || 'main';

        const epics = {main: true, filters: true, add_product: true, notifications: true, menu: true};

        let activeStory = pageId;

        if(this.props.sys.active.view === 'choose') {
            activeStory = this.props.sys.active.view;
        }

        if(epics[pageId]) {
            this.lastTabbar = pageId;
        }

        let subprops = {
            lastPathname: this.lastLocation? this.lastLocation.pathname : null
        };

        if(!this.state.renderer) {
            return null;
        }

        return (
            <div>
                <UI.Epic activeStory={activeStory} tabbar={
                    <UI.Tabbar>
                        <UI.TabbarItem
                            onClick={() => this.props.history.push("/main")}
                            selected={this.lastTabbar === 'main'}
                        ><Icon24Home /></UI.TabbarItem>
                        <UI.TabbarItem
                            onClick={() => this.props.history.push("/filters")}
                            selected={this.lastTabbar === 'filters'}
                        ><Icon24Filter /></UI.TabbarItem>
                        <UI.TabbarItem
                            onClick={() => this.props.history.push("/add_product")}
                            selected={this.lastTabbar === 'add_product'}
                        ><Icon28AddOutline /></UI.TabbarItem>
                        <UI.TabbarItem
                            onClick={() => this.props.history.push("/notifications")}
                            selected={this.lastTabbar === 'notifications'}
                            label={this.props.user['notifications']['new']? this.props.user['notifications']['new'] : ""}
                        ><Icon28Notification /></UI.TabbarItem>
                        <UI.TabbarItem
                            onClick={() => this.props.history.push("/menu")}
                            selected={this.lastTabbar === 'menu'}
                        ><Icon28Menu /></UI.TabbarItem>
                    </UI.Tabbar>
                }>
                    <UI.View popout={this.props.sys.popout} id="main" activePanel="main">
                        <Main id="main" {...this.props} {...subprops}/>
                    </UI.View>
                    <UI.View popout={this.props.sys.popout} id="filters" activePanel="filters">
                        <Filters id="filters" {...this.props} {...subprops}/>
                    </UI.View>
                    <UI.View popout={this.props.sys.popout} id="add_product" activePanel="add_product">
                        <AddProduct id="add_product" {...this.props} {...subprops}/>
                    </UI.View>
                    <UI.View popout={this.props.sys.popout} id="notifications" activePanel="notifications">
                        <Notifications id="notifications" {...this.props} {...subprops}/>
                    </UI.View>
                    <UI.View popout={this.props.sys.popout} id="menu" activePanel="menu">
                        <Menu id="menu" {...this.props} {...subprops}/>
                    </UI.View>


                    <UI.View popout={this.props.sys.popout} id="product" activePanel="product">
                        <Info id="product" {...this.props} {...subprops}/>
                    </UI.View>
                    <UI.View popout={this.props.sys.popout} id="all" activePanel="all">
                        <All id="all" {...this.props} {...subprops}/>
                    </UI.View>
                    <UI.View popout={this.props.sys.popout} id="gds_user_id" activePanel="gds_user_id">
                        <GdsUserId id="gds_user_id" {...this.props} {...subprops}/>
                    </UI.View>
                    <UI.View popout={this.props.sys.popout} id="edit_product" activePanel="edit_product">
                        <EditProduct id="edit_product" {...this.props} {...subprops}/>
                    </UI.View>
                    <UI.View popout={this.props.sys.popout} id="favorites" activePanel="favorites">
                        <Favorites id="favorites" {...this.props} {...subprops}/>
                    </UI.View>
                    <UI.View popout={this.props.sys.popout} id="about" activePanel="about">
                        <About id="about" {...this.props} {...subprops}/>
                    </UI.View>
                    <UI.View popout={this.props.sys.popout} id="rules" activePanel="rules">
                        <Rules id="rules" {...this.props} {...subprops}/>
                    </UI.View>
                    <UI.View popout={this.props.sys.popout} id="set_notifications" activePanel="set_notifications">
                        <SetNotifications id="set_notifications" {...this.props} {...subprops}/>
                    </UI.View>
                    <UI.View popout={this.props.sys.popout} id="archive" activePanel="archive">
                        <Archive id="archive" {...this.props} {...subprops}/>
                    </UI.View>


                    {/*<UI.View onTransition={this.onTransition.bind(this)}*/}
                             {/*popout={this.props.sys.popout} id="mainView" activePanel={pageId}>*/}
                    {/*</UI.View>*/}

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
        user: state.user,
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
