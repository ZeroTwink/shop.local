import * as types from '../actions/types/gdsActionTypes';

export default function gdsReducer(state = {}, action) {
    switch (action.type) {
        case types.GDS_LOAD:
            return action.payload;
        case types.GDS_UPDATE:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}