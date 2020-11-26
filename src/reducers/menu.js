const updateMenu = (state, action) => {
    if(state === undefined) {
        return {
            hidden: true,
            opened: false,
            screen: '',
            screenOpened: false
        }
    }

    switch (action.type) {
        case 'UPDATE_MENU':
            return {
                ...state.menu,
                ...action.payload
            };

        default:
            return state.menu;
    }

};

export default updateMenu;