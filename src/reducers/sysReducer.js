import * as types from '../actions/types/sysActionTypes';

let initState = {
    active: {
        view: "mainView",
        panel: ""
    },
    popout: null,
    refresh: "",
    scroll: {
        main: 0,
        filters: 0,
        addProduct: 0,
        notifications: 0,
        menu: 0,
        all: 0,
        gdsUserId: 0,
        favorites: 0
    }
};

export default function sysReducer(state = initState, action) {
    switch (action.type) {
        case types.SYS_SET_ACTIVE:
            return Object.assign({}, state, {active: action.payload});
        case types.SYS_SET_POPOUT:
            return Object.assign({}, state, {popout: action.payload});
        case types.SYS_SET_REFRESH:
            return Object.assign({}, state, {refresh: action.payload});
        case types.SYS_SET_SCROLL:
            let scroll = Object.assign({}, state['scroll'], action.payload);
            return Object.assign({}, state, {scroll: scroll});
        default:
            return state;
    }
}