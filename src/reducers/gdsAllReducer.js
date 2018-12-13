let initState = {
    items: [],
    hasMore: true,
    page: 0,
    type: '' // пустая чтобы первый запрос сработал
};

export default function gdsAllReducer(state = initState, action) {
    switch (action.type) {
        case 'gdsAll.set':
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}