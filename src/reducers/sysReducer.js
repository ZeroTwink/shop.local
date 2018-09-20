import * as types from '../actions/types/sysActionTypes';

let initState = {
    activeView: "mainView",
    activePanel: "",
    popout: null, refresh: ""
};

export default function sysReducer(state = initState, action) {
    switch (action.type) {
        case types.SYS_SET_ACTIVE_VIEW:
            return Object.assign({}, state, {activeView: action.payload});
        case types.SYS_SET_POPOUT:
            return Object.assign({}, state, {popout: action.payload});
        case types.SYS_SET_REFRESH:
            return Object.assign({}, state, {refresh: action.payload});
        default:
            return state;
    }
}