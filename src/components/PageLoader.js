import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as UI from '@vkontakte/vkui';

import axios from '../utils/axios';
import $_GET from '../helpers/getParams';

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
        this.props.initApp();

        this.step0();
    }

    displayError(message) {
        this.props.setPopout(
            <UI.Alert
                // actions={[{
                //     title: 'OK',
                //     autoclose: true,
                //     style: 'destructive'
                // }]}
                onClose={() => this.props.setPopout(null)}
            >
                <h2><div style={{color: "#ff473d", textAlign: "center"}}>Ошибка</div></h2>
                <div style={{textAlign: "center"}}>{message}</div>
            </UI.Alert>
        );
    }

    step0() {
        let clb = (e) => {
            let data = e.detail['data'];
            let type = e.detail['type'];

            if("VKWebAppGetClientVersionResult" === type) {

                let version = data.version.match(/[0-9]+\.[0-9]+/)[0].split(".");

                if((data.platform === 'android' && ((+version[0] === 5 && +version[1] < 19) || +version[0] < 5))
                    || (data.platform === 'ios' && +version[0] < 5)) {
                    this.displayError("Для работы сервиса необходимо обновить официальное приложение VK");

                    return false;
                }

                VKConnect.unsubscribe(clb);

                this.step1();
            }
        };

        VKConnect.subscribe(clb);

        VKConnect.send('VKWebAppGetClientVersion', {});
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
        axios.defaults.params = {
            access_token: this.state.accessToken,
            ...$_GET
        };

        let params = {};
        if(this.state.user.city) {
            params["city_id"] = this.state.user.city.id;
        }
        if(this.state.user.country) {
            params["country_id"] = this.state.user.country.id;
        }

        if(this.state.user.sex) {
            params["sex"] = this.state.user.sex;
        } else {
            params["sex"] = 0;
        }

        axios.get("/api/first_request.php", {
            params: params
        }).then(res => {
            if(res.data.error) {
                this.displayError(res.data.error.message);

                return;
            }

            this.props.gdsLoad({
                gds_new: res.data.response['gds_new'],
                gds_city: res.data.response['gds_city'],
                categories: res.data.response['categories'],
            });

            res.data.response.user['favorites'] = String(res.data.response.user['favorites']).split(",");

            if(res.data.response.user['notifications']) {
                res.data.response.user['notifications'] = JSON.parse(res.data.response.user['notifications']);
            } else {
                res.data.response.user['notifications'] = {};
            }

            this.props.userLoad(res.data.response.user);

            this.props.history.replace("/main");

            // goToMain();
        }).catch(error => {
            console.log(error);
            this.displayError("Возникла серверная ошибка, перезапустите сервис");
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
                    <UI.View activePanel="load">
                        <UI.Panel id="load">
                            <UI.PanelHeader>
                                Ваш аккаунт
                            </UI.PanelHeader>
                            <UI.Group>
                                <UI.Div style={{textAlign: "center"}}>
                                    Чтобы получить доступ к личнему кабинету вам необходимо подтверлить аккаунт
                                    <br /><br />
                                    Для этого нажмите на кнопку "Подтвердить аккаунт" и разрешите приложению
                                    получить информацию о вас
                                    <br /><br />
                                    <UI.Button onClick={this.step1.bind(this)} level="buy" size="xl">
                                        Подтвердить аккаунт
                                    </UI.Button>
                                </UI.Div>
                            </UI.Group>
                            {/*<div style={{borderBottom: "1px solid #000"}}>*/}
                                {/*Консоль*/}
                            {/*</div>*/}
                            {/*<div style={{width: 300, wordWrap: "break-word"}}>*/}
                            {/*<pre>*/}
                                {/*{JSON.stringify(this.state.accessTokenFailed, undefined, 2)}*/}
                                {/*<div>*/}
                                    {/*{JSON.stringify(window.location, undefined, 2)}*/}
                                {/*</div>*/}
                            {/*</pre>*/}
                            {/*</div>*/}
                        </UI.Panel>
                    </UI.View>
                ) : (
                    <UI.View activePanel="load" popout={this.props.sys.popout}>
                        <UI.Panel id="load">
                            <div style={{position: "absolute", top: 0, width: "100%", height: "100vh"}}>
                            <div id="world_load">
                                {/*<div style={{width: 300, wordWrap: "break-word"}}>*/}
                                {/*{this.state.accessToken? JSON.stringify(this.state.accessToken) : null}*/}
                                {/*</div>*/}
                                <div className="img" />
                            </div>
                            </div>
                        </UI.Panel>
                    </UI.View>
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
        },
        setPopout: function (name) {
            dispatch(sysActions.setPopout(name))
        }
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(PageLoader);