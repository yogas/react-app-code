const updatePanel = (state, action) => {
    if(state === undefined) {
        return {
            opened: false
        };
    }

    switch(action.type) {
        case 'UPDATE_PANEL': {
            return {
                ...state.panel,
                ...action.payload
            };
        }
        default: {
            return state.panel;
        }
    }
};

export default updatePanel;