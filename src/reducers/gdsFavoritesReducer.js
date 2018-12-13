let initState = {
    items: [],
    hasMore: true,
    page: 0
};

export default function gdsFavoritesReducer(state = initState, action) {
    switch (action.type) {
        case 'gdsFavorites.set':
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}