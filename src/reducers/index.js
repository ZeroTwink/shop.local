import {combineReducers} from 'redux';

import userReducer from './userReducer';
import gdsReducer from './gdsReducer';
import vkReducer from './vkReducer';
import sysReducer from './sysReducer';
import addProductReducer from './addProductReducer';

const rootReducer = combineReducers({
    user: userReducer,
    gds: gdsReducer,
    vk: vkReducer,
    sys: sysReducer,
    addProduct: addProductReducer
});

export default rootReducer;