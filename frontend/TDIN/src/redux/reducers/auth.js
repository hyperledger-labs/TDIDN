const initState = {
    loading: false,
    user: null,
}

export default (state = initState, action) => {
    switch (action.type) {
        case 'CHANGE_LOADING_STATE':

            return {
                ...state,
                loading: !state.loading,
            }
        case 'SET_USER':
            return {
                ...state,
                user: action.payload
            }
        default:
            return state;

    }
}