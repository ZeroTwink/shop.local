import * as types from './types/filtersActionTypes';

export function setValues(name) {
    return async (dispatch) => {
        dispatch({
            type: types.FILTERS_SET_VALUES,
            payload: name,
        });
    }
}