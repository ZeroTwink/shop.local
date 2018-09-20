import * as types from '../actions/types/addProductTypes';

let initState = {
    priceInputValue: "",
    titleInputValue: "",
    stateProductInputValue: 0,
    stateBallsInputValue: 3,
    arrImagesLoad: [],
    descriptionInputValue: ""
};

export default function addProductReducer(state = initState, action) {
    switch (action.type) {
        case types.ADD_PRODUCT_SET_VALUES:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}