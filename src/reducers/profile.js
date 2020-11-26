const updateProfile = (state, action) => {
    if(state === undefined) {
        return {
            loaded: false,
            id: null,
            first_name: '',
            middle_name: '',
            last_name: '',
            email: '',
            photo: null,
            phone: null,
            photoEdit: false
        }
    }

    switch(action.type) {
        case 'UPDATE_PROFILE':
            return {
                ...state.profile,
                ...action.payload
            };
        default:
            return state.profile;
    }

};

export default updateProfile;