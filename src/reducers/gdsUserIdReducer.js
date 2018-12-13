let initState = {
    items: [],
    hasMore: true,
    page: 0,
    idUser: 0
};

export default function gdsUserIdReducer(state = initState, action) {
    switch (action.type) {
        case 'gdsUserId.set':
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}