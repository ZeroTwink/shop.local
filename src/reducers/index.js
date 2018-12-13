import {combineReducers} from 'redux';

import userReducer from './userReducer';
import gdsReducer from './gdsReducer';
import vkReducer from './vkReducer';
import sysReducer from './sysReducer';
import addProductReducer from './addProductReducer';
import filtersReducer from './filtersReducer';
import gdsFiltersReducer from './gdsFiltersReducer';
import gdsAllReducer from './gdsAllReducer';
import gdsUserIdReducer from './gdsUserIdReducer';
import gdsFavoritesReducer from './gdsFavoritesReducer';

const rootReducer = combineReducers({
    user: userReducer,
    gds: gdsReducer,
    vk: vkReducer,
    sys: sysReducer,
    addProduct: addProductReducer,
    filters: filtersReducer,
    gdsFilters: gdsFiltersReducer,
    gdsAll: gdsAllReducer,
    gdsUserId: gdsUserIdReducer,
    gdsFavorites: gdsFavoritesReducer
});

export default rootReducer;