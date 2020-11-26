export const updateNotify = (payload) => {
    return {type: 'UPDATE_NOTIFY', payload};
};

// Показать нотификацию
// type: alert | attantion | okey
export const showNotify = ({type='alert', message='', desc='', reload=false, showbtn=true, callback=null, buttons=[]}) => (dispatch) => {
    dispatch(updateNotify({type, message, desc, reload, callback, showbtn, buttons, show: true}))
};

export const hideNotify = () => (dispatch) => {
    dispatch(updateNotify({show: false}));
};
