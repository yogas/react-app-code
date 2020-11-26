const updateUserAuth = ({
    authorized = false,
    phone = '',
    client_id = null,
    access_token = null,
    refresh_token = null,
    expires_in = null,
    auth_time = null,
    confirm = false,
    doc1 = false,
    doc2 = false,
    doc3 = false,
    doc4 = false,
    rerequest = null,
    email = null,
    instruction = true
} = {}) => {
    return {
        authorized,
        phone,
        client_id,
        access_token,
        refresh_token,
        expires_in,
        auth_time,
        confirm,
        doc1,
        doc2,
        doc3,
        doc4,
        rerequest,
        email,
        instruction
    };
};

const updateUser = (state, action) => {

    if(state === undefined) {
        return updateUserAuth();
    }

    switch(action.type) {
        case 'UPDATE_USER_AUTH':
            return updateUserAuth({...state.user, ...action.payload});

        case 'RESET_STORE':
            return updateUserAuth({
                ...state.user,
                authorized: false,
                client_id: null,
                access_token: null,
                refresh_token: null,
                rerequest: null,
                confirm: false,
                doc1: false,
                doc2: false,
                doc3: false,
                doc4: false
            });

        default:
            return state.user;
    }
};

export default updateUser;
