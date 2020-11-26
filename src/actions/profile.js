import {showPreloader, hidePreloader} from './preloader';
import {userLogout} from './user';
import {hideMenuStatic} from './menu';

export const updateProfile = (payload) => {
    return { type: 'UPDATE_PROFILE', payload }
};

export const loadProfile = (clientService) => (callback=()=>{}) => (dispatch) => {
    dispatch(showPreloader());
    clientService.getProfile()
        .then((data) => {
            console.log(data);
            if(data.error === null) {
                dispatch(updateProfile({
                    loaded: true,
                    ...data.result
                }));

                callback();
            }
            dispatch(hidePreloader());
        })
        .catch((error) => {
            console.log(error);
            dispatch(hidePreloader());
        })
};

export const profileLogout = (clientService) => () => (dispatch) => {
    dispatch(showPreloader());
    clientService.logOut()
        .then((data) => {
            if(data.statusCode === 204) {
                hideMenuStatic()(dispatch);
                dispatch(userLogout());
            }
            dispatch(hidePreloader());
        })
        .catch((error) => {
            console.log(error);
            dispatch(hidePreloader());
        })
};

export const deleteProfilePhoto = (clientService) => (callback=()=>{}) => (dispatch) => {
    dispatch(showPreloader());
    clientService.deleteProfilePhoto()
        .then((data) => {
            console.log(data);
            dispatch(updateProfile({photoEdit: false}));
            dispatch(hidePreloader());
            callback();
        })
        .catch((error) => {
            console.log(error);
            dispatch(hidePreloader());
        })
};