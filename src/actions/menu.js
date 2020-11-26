export const updateMenu = (payload) => {
    return { type: 'UPDATE_MENU', payload };
};

export const showMenu = () => () => (dispatch) => {
    dispatch(updateMenu({hidden: false}));
    setTimeout(() => {
        dispatch(updateMenu({opened: true}));
    }, 10);
};

export const hideMenu = () => () => (dispatch) => {
    dispatch(updateMenu({opened: false}));
    setTimeout(() => {
        dispatch(updateMenu({hidden: true}));
    }, 250);
};

export const hideMenuStatic = () => (dispatch) => {
    dispatch(updateMenu({hidden: true, opened: false, screenOpened: false}));
};

export const showMenuScreen = () => (screen) => (dispatch) => {
    dispatch(updateMenu({screenOpened: true}));
    dispatch(updateMenu({screen}));
};

export const showMenuScreenAnimated = () => (screen) => (dispatch) => {
    dispatch(updateMenu({screen}));
    setTimeout(() => {
        dispatch(updateMenu({screenOpened: true}));
    }, 10);
};

export const hideMenuScreen = () => () => (dispatch) => {
    dispatch(updateMenu({screenOpened: false}));
    setTimeout(() => {
        dispatch(updateMenu({screen: false}));
    }, 250);
};