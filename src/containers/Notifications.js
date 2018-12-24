import React, {Component} from 'react';
import {connect} from 'react-redux';
import Moment from 'react-moment';
import axios from '../utils/axios';
import * as UI from '@vkontakte/vkui';
// import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
// import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Notification from '@vkontakte/icons/dist/24/notification';

import * as userActions from "../actions/user";

import * as vkActions from '../actions/vk';
// import * as sysActions from "../actions/sys";


class Notifications extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };

    }

    componentDidMount() {
        window.scroll(0, 0);

        if(this.props.user['notifications']['new']) {

            let notifications = {...this.props.user['notifications']};
            notifications['new'] = 0;

            this.props.userUpdate({
                notifications: notifications
            });

            axios.get("/api/notifications.php", {
                params: {
                    type: "reset_new"
                }
            }).then(res => {
                console.log(res);
            }).catch(error => {
                console.log(error);
                // this.displayError("Возникла серверная ошибка, перезапустите сервис");
            });
        }
    }

    render() {
        // const osname = UI.platform();

        let countN = this.props.user['notifications']['items'] && this.props.user['notifications']['items'].length;

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader>
                    Уведомления
                </UI.PanelHeader>

                {!this.props.user['set_notifications']? (
                    <UI.Group>
                        <UI.Cell
                            size="l"
                            multiline
                            description="Мы не сможем присылать Вам уведомления о важных событиях"
                            before={
                                <UI.Avatar style={{ background: UI.colors.blue_overlight_3 }} size={32}>
                                    <Icon24Notification fill={UI.colors.white} />
                                </UI.Avatar>
                            }
                        >
                            {this.props.vk.user['first_name'] + ", у Вас отключены уведомления" }
                        </UI.Cell>

                        <UI.Div>
                            <UI.Button onClick={() => vkActions.allowNotifications()} size="xl">
                                Включить уведомления
                            </UI.Button>
                        </UI.Div>
                    </UI.Group>
                ) : null}

                <UI.Group>
                    {countN? this.props.user['notifications']['items'].map((e, i) => {
                        let before = (
                            <UI.Avatar style={{background: UI.colors.blue_300}} size={40}>
                                <Icon24Notification fill={UI.colors.white} />
                            </UI.Avatar>
                        );

                        // TODO

                        // if(e['avatar']) {
                        //     let image = window.location.protocol + "//" + window.location.hostname +
                        //         "/sys/files/gds/" + e['image'] + "?v=" + e['time_update'];
                        //
                        //     let style = {
                        //         backgroundSize: "cover",
                        //         backgroundImage: "url("+image+")",
                        //         backgroundPosition: "center 35%"
                        //     };
                        //
                        //     before = (
                        //         <UI.Avatar style={style} size={32} />
                        //     );
                        // }

                        let asideContent = null;
                        if(e['image']) {
                            let image = window.location.protocol + "//" + window.location.hostname +
                                "/sys/files/gds/" + e['image'] + "?v=" + e['time_update'];

                            let style = {
                                backgroundSize: "cover",
                                backgroundImage: "url("+image+")",
                                backgroundPosition: "center 35%"
                            };

                            asideContent = (
                                <UI.Avatar style={style} type="image" size={56}/>
                            );
                        }

                        let bottomContent = null;
                        if(e.button) {
                            bottomContent = (
                                <UI.Button onClick={() => this.props.history.push(e.url)}
                                           size="m"
                                           level="secondary">
                                    {e.button}
                                </UI.Button>
                            );
                        }

                        let description = null;
                        if(e.time) {
                            description = (
                                <Moment format="DD.MM.YYYY в H:mm" unix>
                                    {(e.time - 60*60*3) + (60*60*this.props.vk.user['timezone'])}
                                </Moment>
                            );
                        }

                        let name = e.name? (
                            <span style={{fontWeight: 600, color: "#1d1d1d"}}> {e.name}</span>
                        )  : "";

                        return(
                            <UI.Cell style={{borderBottom: "1px solid #f1f1f1"}} key={i}
                                     multiline
                                     before={before}
                                     bottomContent={bottomContent}
                                     asideContent={asideContent}
                                     size="l"
                                     description={description}>
                                {e.text}
                                {name}
                            </UI.Cell>
                        );
                    }) : (
                        <UI.Div>
                            <div style={{position: "relative", top: 0}} className="message_empty">
                                У Вас нет уведомлений
                            </div>
                        </UI.Div>)}
                </UI.Group>

            </UI.Panel>
        )
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
        userUpdate: function (name) {
            dispatch(userActions.userUpdate(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);