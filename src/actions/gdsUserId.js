export function gdsUserIdSet(name) {
    return {
        type: 'gdsUserId.set',
        payload: name
    }
}