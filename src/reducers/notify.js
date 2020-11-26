const updateNotify = (state, action) => {
    if(state === undefined) {
        return {
            type: 'alert', // alert, attantion, okey
            message: '',
            desc: '',
            reload: false,
            show: false,
            callback: null
        }
    }

    switch(action.type) {
        case 'UPDATE_NOTIFY':
            return {
                ...state.notify,
                ...action.payload
            };

        default:
            return state.notify;
    }
};

export default updateNotify;
