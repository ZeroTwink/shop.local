export default function gdsLoad(name) {
    return {
        type: "GDS_LOAD",
        payload: name
    }
}