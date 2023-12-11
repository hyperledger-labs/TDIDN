const initState = {
    url: null,
}

export default (state = initState, action) => {
    switch (action.type) {
        case 'UPDATE_URL':

            return {
                ...state,
                url: action.payload,
            }
        default:
            return state;

    }
}