const updateDatePopup = (state, action) => {
    if(state === undefined) {
        return {
            opened: false,
            error: null,
            date: ''
        }
    }

    switch(action.type) {
        case 'UPDATE_DATE_POPUP':
            return {
                ...state.date_popup,
                ...action.payload
            };
        default:
            return state.date_popup;
    }
};

export default updateDatePopup;