import {combineReducers} from 'redux';

import userReducer from './userReducer';
import gdsReducer from './gdsReducer';
import vkReducer from './vkReducer';

const rootReducer = combineReducers({
    user: userReducer,
    gds: gdsReducer,
    vk: vkReducer
});

export default rootReducer;