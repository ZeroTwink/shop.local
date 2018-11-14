import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from '../utils/axios';
import * as UI from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';

import * as userActions from "../actions/user";
import * as vkActions from '../actions/vk';


class SetNotifications extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };

    }

    componentDidMount() {
        vkActions.apiRequest("apps.isNotificationsAllowed", {}, this.props.vk.accessToken, res => {
            let is_allowed = 0;
            if(res['is_allowed']) {
                is_allowed = 1;
            }

            if(this.props.user['set_notifications'] !== is_allowed) {
                this.setNotifications('all', is_allowed);
            }
        });
    }

    setNotifications(type, set) {
        let update = {};

        switch (type) {
            case "all" :
                update['set_notifications'] = set;
                break;
            case "delete" :
                update['set_notifi_delete'] = set;
                break;
            case "edit" :
                update['set_notifi_edit'] = set;
                break;
            case "archive" :
                update['set_notifi_archive'] = set;
                break;
            case "system" :
                update['set_notifi_system'] = set;
                break;
            default:
                // nop
        }

        if(!update) {
            return;
        }

        this.props.userUpdate(update);

        axios.get("/api/set_notifications.php", {
            params: {
                type: type,
                set: set
            }
        }).then(res => {
            console.log(res);
        }).catch(error => {
            console.log(error);
            // this.displayError("Возникла серверная ошибка, перезапустите сервис");
        });
    }

    // checkAllNotifications() {
    //     if(+!this.props.user['set_notifi_delete']
    //         && +!this.props.user['set_notifi_edit']
    //         && +!this.props.user['set_notifi_archive']
    //         && +!this.props.user['set_notifi_system']) {
    //
    //         this.setNotifications('all', 0);
    //     }
    // }

    notifications() {
        if(this.props.user['set_notifications']) {
            vkActions.denyNotifications();
        } else {
            vkActions.allowNotifications();
        }
    }

    deleteNotification(e) {
        if(!this.props.user['set_notifications']) {
            return;
        }

        this.setNotifications('delete', +!this.props.user['set_notifi_delete']);
    }

    editNotification(e) {
        if(!this.props.user['set_notifications']) {
            return;
        }

        this.setNotifications('edit', +!this.props.user['set_notifi_edit']);
    }

    archiveNotification(e) {
        if(!this.props.user['set_notifications']) {
            return;
        }

        this.setNotifications('archive', +!this.props.user['set_notifi_archive']);
    }

    systemNotification(e) {
        if(!this.props.user['set_notifications']) {
            return;
        }

        this.setNotifications('system', +!this.props.user['set_notifi_system']);
    }

    render() {
        const osname = UI.platform();

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader
                    left={<UI.HeaderButton onClick={() => this.props.history.goBack()}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    Уведомления
                </UI.PanelHeader>

                <UI.Group>
                    <UI.Cell onClick={this.notifications.bind(this)}
                             asideContent={<UI.Switch
                                 onChange={() => (null)}
                                 checked={this.props.user['set_notifications']} />}
                    >
                        Уведомления
                    </UI.Cell>
                </UI.Group>

                <UI.Group>
                    <UI.List>
                        <UI.Cell onClick={this.deleteNotification.bind(this)}
                                 multiline
                                 description="Если администрации или по истичению срока давноесте объявление будет удалено"
                                 asideContent={<UI.Switch
                                     onChange={() => (null)}
                                     disabled={!this.props.user['set_notifications']}
                                     checked={this.props.user['set_notifi_delete']}/>}
                        >
                            {this.props.user['set_notifications']? "Удаление" : <span style={{color: "#b1b1b1"}}>Удаление</span>}
                        </UI.Cell>
                        <UI.Cell onClick={this.editNotification.bind(this)}
                                 multiline
                                 description="Если администрации отредактирует объявление"
                                 asideContent={<UI.Switch
                                     onChange={() => (null)}
                                     disabled={!this.props.user['set_notifications']}
                                     checked={this.props.user['set_notifi_edit']}/>}
                        >
                            {this.props.user['set_notifications']? "Редактирование" : <span style={{color: "#b1b1b1"}}>Редактирование</span>}
                        </UI.Cell>
                        <UI.Cell onClick={this.archiveNotification.bind(this)}
                                 multiline
                                 description="Объявление по истечению срока, перемещено в архи"
                                 asideContent={<UI.Switch
                                     onChange={() => (null)}
                                     disabled={!this.props.user['set_notifications']}
                                     checked={this.props.user['set_notifi_archive']}/>}
                        >
                            {this.props.user['set_notifications']? "Архив" : <span style={{color: "#b1b1b1"}}>Архив</span>}
                        </UI.Cell>
                        <UI.Cell onClick={this.systemNotification.bind(this)}
                                 multiline
                                 description="Акции, скиндки, важные события"
                                 asideContent={<UI.Switch
                                     onChange={() => (null)}
                                     disabled={!this.props.user['set_notifications']}
                                     checked={this.props.user['set_notifi_system']}/>}
                        >
                            {this.props.user['set_notifications']? "Системные" : <span style={{color: "#b1b1b1"}}>Системные</span>}
                        </UI.Cell>
                    </UI.List>
                </UI.Group>
            </UI.Panel>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        vk: state.vk
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userUpdate: function (name) {
            dispatch(userActions.userUpdate(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SetNotifications);