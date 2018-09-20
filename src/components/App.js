import React, { Component } from 'react';
import {connect} from 'react-redux';

import * as UI from '@vkontakte/vkui';

import Main from '../containers/Main';
import Filters from '../containers/Filters';
import Info from './product/Info';
import AddProduct from './product/AddProduct';
import Search from './Search';
import SelectCountries from './SelectCountries';
import SelectCity from './SelectCity';
import Menu from './Menu';
import GdsUserId from './GdsUserId';
import Favorites from './Favorites';

import * as sysActions from '../actions/sys';

import '@vkontakte/vkui/dist/vkui.css';

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
            <UI.Root activeView={this.props['sys']['activeView']}>
                <UI.View popout={this.props.sys.popout} id="mainView" activePanel={pageId}>
                    <Main id="main" {...this.props}/>
                    <Info id="product" {...this.props}/>
                    <Search id="search" {...this.props}/>
                    <AddProduct id="add_product" {...this.props}/>
                    <Menu id="menu" {...this.props}/>
                    <GdsUserId id="gds_user_id" {...this.props}/>
                    <Favorites id="favorites" {...this.props}/>
                    <Filters id="filters" {...this.props}/>
                </UI.View>

                <UI.View id="selectCountries" activePanel="countries">
                    <SelectCountries id="countries" {...this.props} />
                </UI.View>

                <UI.View id="selectCity" activePanel="city">
                    <SelectCity id="city" {...this.props} />
                </UI.View>
            </UI.Root>
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
