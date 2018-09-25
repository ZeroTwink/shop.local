export default function gdsLoad(name) {
    return {
        type: "GDS_LOAD",
        payload: name
    }
}

export function gdsUpdate(name) {
    return {
        type: "GDS_UPDATE",
        payload: name
    }
}