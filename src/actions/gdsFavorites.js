export function gdsFavoritesSet(name) {
    return {
        type: 'gdsFavorites.set',
        payload: name
    }
}