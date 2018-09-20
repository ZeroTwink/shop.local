import React, {Component} from 'react';
import {connect} from 'react-redux';

import axios from '../utils/axios';

import * as types from '../actions/types/vkActionTypes';

import gdsLoad from '../actions/gdsLoad';

import VKConnect from '../utils/VKConnect';
import * as VKActions from '../actions/vk';
import * as userActions from '../actions/user';
import * as sysActions from '../actions/sys';



class PageLoader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accessToken: "",
            user: {}
        };

        console.log(props);
    }

    componentDidMount() {
        this.step1();
    }

    step1() {
        let clb = (e) => {
            let data = e.detail['data'];
            let type = e.detail['type'];

            if("VKWebAppAccessTokenReceived" === type) {

                this.props.setAccessToken(data['access_token']);

                this.setState({
                    accessToken: data['access_token']
                }, () => {
                    this.step2();
                });

                VKConnect.unsubscribe(clb);
            }

            if("VKWebAppAccessTokenFailed" === type) {
                this.setState({
                    accessToken: data
                });
            }
        };

        VKConnect.subscribe(clb);

        this.props.initApp();

        VKConnect.send('VKWebAppGetAuthToken', {'app_id': 6689902});
    }

    step2() {
        let clb = (e) => {
            let data = e.detail['data'];
            let type = e.detail['type'];

            if("VKWebAppGetUserInfoResult" === type) {

                this.props.fetchUserInfo(data);

                this.setState({
                    user: data
                }, () => {
                    this.step3();
                });

                VKConnect.unsubscribe(clb);
            }
        };



        VKConnect.subscribe(clb);

        VKConnect.send('VKWebAppGetUserInfo', {'app_id': 6689902, "scope": "offline"});
    }

    step3() {
        let countLoaders = 0;

        let goToMain = () => {
            countLoaders++;

            if(countLoaders >= 2) {
                if(this.props.sys.refresh) {
                    this.props.history.replace(decodeURIComponent(this.props.sys.refresh));

                    this.props.setRefresh("");

                    return;
                }

                // TODO Это чисто чтобы можно было назат вернутся при разработке
                if(process.env.NODE_ENV === 'production') {
                    this.props.history.replace("/main");
                } else {
                    this.props.history.push("/main");
                }
            }
        };

        axios.defaults.params = {
            viewer_id: this.state.user.id,
            access_token: this.state.accessToken
        };

        let params = {};
        if(this.state.user.city) {
            params["city_id"] = this.state.user.city.id;
        }
        if(this.state.user.country) {
            params["country_id"] = this.state.user.country.id;
        }

        axios.get("/api/first_request.php", {
            params: params
        }).then(res => {
            this.props.gdsLoad(res.data.response);

            goToMain();
        }).catch(error => {
            console.log(error);
        });

        axios.get("/api/get_user.php").then(res => {
            res.data.response.user['favorites'] = res.data.response.user['favorites'].split(",");

            this.props.userLoad(res.data.response.user);

            goToMain();
        }).catch(error => {
            console.log(error);
        });
    }

    render() {
        return (
            <div>
                <div id="world_load">
                    {/*{this.state.accessToken? JSON.stringify(this.state.accessToken) : null}*/}
                    <div className="img" />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        vk: state.vk,
        sys: state.sys
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setAccessToken: function (name) {
            dispatch({
                type: types.VK_GET_ACCESS_TOKEN_FETCHED,
                payload: name
            });
        },
        fetchUserInfo: function (user) {
            dispatch({
                type: types.VK_USER_INFO_FETCHED,
                payload: user
            });
        },
        gdsLoad: function (name) {
            dispatch(gdsLoad(name));
        },
        initApp: function (name) {
            dispatch(VKActions.initApp())
        },
        userLoad: function (name) {
            dispatch(userActions.userLoad(name))
        },
        setRefresh: function (name) {
            dispatch(sysActions.setRefresh(name))
        }
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(PageLoader);