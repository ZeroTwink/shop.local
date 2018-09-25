import * as types from '../actions/types/filtersActionTypes';

let initState = {
    search: "",
    sorting: 0
};

export default function filtersReducer(state = initState, action) {
    switch (action.type) {
        case types.FILTERS_SET_VALUES:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}