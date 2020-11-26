const updatePreloader = (state, action) => {
    if(state === undefined) {
        return false;
    }

    switch(action.type) {
        case 'SHOW_PRELOADER':
            return true;
        case 'HIDE_PRELOADER':
            return false;
        default:
            return state.loading;
    }
};

export default updatePreloader;