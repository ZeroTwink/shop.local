import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as sysActions from "../../actions/sys";
import * as UI from "@vkontakte/vkui/dist/vkui";

import Toasts from '../Toasts';

import {CopyToClipboard} from 'react-copy-to-clipboard';


import Icon24Phone from '@vkontakte/icons/dist/24/phone';
import Icon24Copy from '@vkontakte/icons/dist/24/copy';
import Icon24LogoVk from '@vkontakte/icons/dist/24/logo_vk';
import Icon24Mention from '@vkontakte/icons/dist/24/mention';



class InfoTabContacts extends Component {
    displayToasts(text) {
        this.props.setPopout(
            <Toasts>
                {text}
            </Toasts>
        );
    }

    displayActionSheet() {
        const osname = UI.platform();

        // if(+this.props.vk.user.id === +this.props.seller['id']) {
        //     return;
        // }


        this.props.setPopout(
            <UI.ActionSheet
                onClose={() => this.props.setPopout(null)}
                title="Действие"
                text="Выберите подходящий пункт"
            >
                <UI.ActionSheetItem
                    autoclose
                    onClick={() => {
                        let a = document.createElement('a');
                        a.title = "my title text";
                        a.href = "https://vk.com/id" + this.props.seller['id'];
                        a.click();
                    }}>
                    Открыть профиль
                </UI.ActionSheetItem>
                {this.props.seller['can_write_private_message'] > 0? (
                    <UI.ActionSheetItem
                        autoclose
                        onClick={() => {
                            let a = document.createElement('a');
                            a.title = "my title text";
                            a.href = "https://vk.me/id" + this.props.seller['id'];
                            a.click();
                        }}>
                        Написать сообщение
                    </UI.ActionSheetItem>
                ) : null}
                {osname === UI.IOS && <UI.ActionSheetItem autoclose theme="cancel">Отменить</UI.ActionSheetItem>}
            </UI.ActionSheet>
        );
    }

    render() {
        return (
            <React.Fragment>
                <UI.Header level="2">Контакты</UI.Header>
                <UI.List>
                    <UI.Cell before={<UI.Avatar src={this.props.seller['photo_50']} size={40} />}
                             description="Продавец"
                             onClick={+this.props.vk.user.id !== +this.props.seller['id']
                                 ? this.displayActionSheet.bind(this) : null}>
                        {this.props.seller['first_name'] + " " + this.props.seller['last_name']}
                    </UI.Cell>
                    {this.props.product['phone_number']? (
                        <CopyToClipboard text={this.props.product['phone_number']}>
                            <UI.Cell onClick={this.displayToasts.bind(this, "Номер скопирован")}
                                     before={<Icon24Phone fill={UI.colors.azure_A400}/>}
                                     asideContent={<Icon24Copy/>}>
                                {this.props.product['phone_number']}
                            </UI.Cell>
                        </CopyToClipboard>
                    ) : (
                        <UI.Cell before={<Icon24Phone/>}>
                            Не указан
                        </UI.Cell>
                    )}
                    {this.props.product['email']? (
                        <CopyToClipboard text={this.props.product['email']}>
                            <UI.Cell onClick={this.displayToasts.bind(this, "E-mail скопирован")}
                                     before={<Icon24Mention fill={UI.colors.azure_A400}/>}
                                     asideContent={<Icon24Copy/>}>
                                {this.props.product['email']}
                            </UI.Cell>
                        </CopyToClipboard>
                    ) : (
                        <UI.Cell before={<Icon24Mention/>}>
                            Не указан
                        </UI.Cell>
                    )}
                </UI.List>

                <UI.Div>
                    {this.props.seller['can_write_private_message'] > 0? (
                        +this.props.vk.user.id !== +this.props.seller['id']? (
                            <UI.Link style={{color: "#fff"}}
                                     href={"https://vk.me/id" + this.props.seller['id']}>
                                <UI.Button before={<Icon24LogoVk fill="#fff"/>} size="xl">
                                    Написать продавцу
                                </UI.Button>
                            </UI.Link>
                        ) : null
                    ) : (
                        <React.Fragment>
                            <div style={{color: "#888888", textAlign: "center"}}>
                                У пользователя закрыты личные сообщения
                            </div>
                        </React.Fragment>
                    )}
                </UI.Div>
            </React.Fragment>
        );
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
        setPopout: function (name) {
            dispatch(sysActions.setPopout(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(InfoTabContacts);