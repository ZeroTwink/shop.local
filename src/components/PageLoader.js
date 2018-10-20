import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as UI from '@vkontakte/vkui';

import axios from '../utils/axios';

import * as types from '../actions/types/vkActionTypes';

import VKConnect from '../utils/VKConnect';
import * as VKActions from '../actions/vk';
import * as userActions from '../actions/user';
import * as sysActions from '../actions/sys';
import * as gdsActions from '../actions/gds';



class PageLoader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accessToken: "",
            accessTokenFailed: "",
            user: {}
        };
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
                    accessTokenFailed: data
                });
            }
        };

        this.setState({
            accessTokenFailed: ""
        });

        VKConnect.unsubscribe(clb);
        VKConnect.subscribe(clb);

        this.props.initApp();

        VKConnect.send('VKWebAppGetAuthToken', {'app_id': '6689902'});
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

        VKConnect.send('VKWebAppGetUserInfo', {});
    }

    step3() {
        // let countLoaders = 0;
        //
        // let goToMain = () => {
        //     countLoaders++;
        //
        //     if(countLoaders >= 2) {
        //         // if(this.props.sys.refresh) {
        //         //     this.props.history.replace("/main");
        //         //
        //         //     // this.props.setRefresh("");
        //         //
        //         //     return;
        //         // }
        //         //
        //         // // TODO Это чисто чтобы можно было назат вернутся при разработке, оставить replace, а push убрать
        //         // if(process.env.NODE_ENV === 'production') {
        //         //     this.props.history.replace("/main");
        //         // } else {
        //         //     this.props.history.push("/main");
        //         // }
        //
        //         this.props.history.replace("/main");
        //     }
        // };

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
            this.props.gdsLoad({
                gds_new: res.data.response['gds_new'],
                gds_city: res.data.response['gds_city']
            });

            res.data.response.user['favorites'] = res.data.response.user['favorites'].split(",");

            this.props.userLoad(res.data.response.user);

            this.props.history.replace("/main");

            // goToMain();
        }).catch(error => {
            console.log(error);
        });

        // axios.get("/api/get_user.php").then(res => {
        //     res.data.response.user['favorites'] = res.data.response.user['favorites'].split(",");
        //
        //     this.props.userLoad(res.data.response.user);
        //
        //     goToMain();
        // }).catch(error => {
        //     console.log(error);
        // });
    }

    render() {
        return (
            <div>
                {this.state.accessTokenFailed? (
                    <UI.View>
                        <UI.Panel>
                            <UI.PanelHeader>
                                Ваш аккаунт
                            </UI.PanelHeader>
                            <UI.Group>
                                <UI.Div style={{textAlign: "center"}}>
                                    Чтобы получить доступ к личнему кабинету вам необходимо подтверлить аккаунт
                                    <br /><br />
                                    Для этого нажмите на кнопку "Подтвердить аккаунт" и разрешите приложению
                                    получить информацию о вас
                                    {/*<div style={{width: 300, wordWrap: "break-word"}}>*/}
                                    {/*/!*{JSON.stringify(this.state.accessTokenFailed)}*!/*/}
                                    {/*{JSON.stringify(window.location)}*/}
                                    {/*</div>*/}
                                    <br /><br />
                                    <UI.Button onClick={this.step1.bind(this)} level="buy" size="xl">
                                        Подтвердить аккаунт
                                    </UI.Button>
                                </UI.Div>
                            </UI.Group>
                        </UI.Panel>
                    </UI.View>
                ) : (
                    <div id="world_load">
                        {/*<div style={{width: 300, wordWrap: "break-word"}}>*/}
                        {/*{this.state.accessToken? JSON.stringify(this.state.accessToken) : null}*/}
                        {/*</div>*/}
                        <div className="img" />
                    </div>
                )}
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
            dispatch(gdsActions.gdsLoad(name));
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