let initState = {
    items: [],
    hasMore: true,
    page: 0
};

export default function gdsFiltersReducer(state = initState, action) {
    switch (action.type) {
        case 'gdsFilters.set':
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}