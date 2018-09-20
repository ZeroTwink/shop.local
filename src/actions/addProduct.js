import * as types from './types/addProductTypes';

export function setValues(name) {
    return async (dispatch) => {
        dispatch({
            type: types.ADD_PRODUCT_SET_VALUES,
            payload: name,
        });
    }
}