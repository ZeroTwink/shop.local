import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as UI from "@vkontakte/vkui/dist/vkui";

import * as gdsUserIdActions from "../../actions/gdsUserId";
import * as userActions from "../../actions/user";
import * as sysActions from "../../actions/sys";
import * as gdsFavoritesActions from "../../actions/gdsFavorites";
import * as gdsActions from "../../actions/gds";

import Icon24Delete from '@vkontakte/icons/dist/24/delete';
import Icon24LogoLivejournal from '@vkontakte/icons/dist/24/logo_livejournal';
import axios from "../../utils/axios";


class InfoContextMenu extends Component {
    onClickDeleteGds(confirm) {
        if(!confirm) {
            this.props.setPopout(
                <UI.Alert
                    actions={[{
                        title: 'Отменить',
                        autoclose: true,
                        style: 'cancel'
                    }, {
                        title: 'Удалить',
                        autoclose: true,
                        style: 'destructive',
                        action: () => this.onClickDeleteGds(true)
                    }]}
                    onClose={() => this.props.setPopout(null)}
                >
                    <h2><div style={{color: "#ff473d", textAlign: "center"}}>Удаление</div></h2>
                    <div style={{textAlign: "center"}}>Вы уверены, что хотите удалить объявление?</div>
                </UI.Alert>
            );

            return;
        }

        this.props.setPopout(<UI.ScreenSpinner />);

        axios.get("/api/remove_product.php", {
            params: {
                id: this.props.match.params.pId
            }
        }).then(res => {
            if(res.data.error) {
                this.props.displayError(res.data.error.message);

                return;
            }


            let gdsNew = [...this.props.gds['gds_new']];
            let gdsOpen = [...this.props.gds['open']];

            let indexOnArr = null;
            gdsNew.filter((e, i) => {
                if(+e.id === +this.props.match.params.pId) {
                    indexOnArr = i;
                    return true;
                }

                return false;
            });

            if(indexOnArr !== null) {
                gdsNew.splice(indexOnArr, 1);

                this.props.gdsUpdate({
                    "gds_new": gdsNew
                });
            }

            let indexOnArrOpen = null;
            gdsOpen.filter((e, i) => {
                if(+e.id === +this.props.match.params.pId) {
                    indexOnArrOpen = i;
                    return true;
                }

                return false;
            });

            if(indexOnArrOpen !== null) {
                gdsOpen.splice(indexOnArrOpen, 1);

                this.props.gdsUpdate({
                    "open": gdsOpen
                });
            }

            this.props.gdsUserIdSet({
                items: [],
                hasMore: true,
                page: 0,
                idUser: 0
            });

            this.props.gdsFavoritesSet({
                items: [],
                hasMore: true,
                page: 0
            });

            this.props.setPopout(null);

            if(this.props.lastPathname && this.props.lastPathname.indexOf('edit_product') === -1) {
                this.props.history.replace(this.props.lastPathname);
            } else {
                this.props.history.replace("/main");
            }
        }).catch(error => {
            this.props.setPopout(null);
        });
    }

    onClickBannedUser(id) {
        axios.get("/api/banned.php", {
            params: {
                id: id
            }
        }).then(res => {
            console.log(res);
        }).catch(error => {
            console.log(error);
        });
    }

    render() {
        return (
            <UI.HeaderContext opened={this.props.opened} onClose={this.props.close}>
                <UI.List>
                    <UI.Cell
                        before={<Icon24Delete />}
                        onClick={this.onClickDeleteGds.bind(this, false)}
                    >
                        Удалить объявление
                    </UI.Cell>
                    <UI.Cell
                        before={<Icon24LogoLivejournal />}
                        onClick={() => this.props.history.push('/edit_product/' + this.props.match.params['pId'])}
                    >
                        Изменить объявление
                    </UI.Cell>
                    {this.props.user['access'] > 6? (
                        <UI.Cell
                            before={<Icon24Delete />}
                            onClick={this.onClickBannedUser.bind(this, this.props.product['id_vk'])}
                        >
                            Забанить юзера
                        </UI.Cell>
                    ) : null}
                </UI.List>
            </UI.HeaderContext>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        gds: state.gds,
        vk: state.vk
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userUpdate: function (name) {
            dispatch(userActions.userUpdate(name))
        },
        setPopout: function (name) {
            dispatch(sysActions.setPopout(name))
        },
        gdsUpdate: function (name) {
            dispatch(gdsActions.gdsUpdate(name))
        },
        gdsFavoritesSet: function (name) {
            dispatch(gdsFavoritesActions.gdsFavoritesSet(name))
        },
        gdsUserIdSet: function (name) {
            dispatch(gdsUserIdActions.gdsUserIdSet(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(InfoContextMenu);