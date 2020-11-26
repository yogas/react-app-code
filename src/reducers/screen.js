const updateScreen = (state, action) => {

    if(state === undefined) {
        return 'auth';
    }

    switch(action.type) {
        case 'SET_SCREEN':
            return action.payload;
        default:
            return state.screen;
    }
};

export default updateScreen;