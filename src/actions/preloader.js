
export const showPreloader = () => {
    if(window.SpinnerDialog) {
        window.SpinnerDialog.show(undefined, undefined, true);
    }

    return { type: 'SHOW_PRELOADER' };
};

export const hidePreloader = () => {
    if(window.SpinnerDialog) {
        window.SpinnerDialog.hide();
    }

    return { type: 'HIDE_PRELOADER' };
};