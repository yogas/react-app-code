import {reactLocalStorage} from 'reactjs-localstorage';
import {updateDevice} from "./index";
import {appVersion} from "../settings";
import queryString from 'query-string';
import {get} from 'lodash';

/**
 * Обновить данные об авторизации пользователя
 * @param user
 * @returns {{type: string, payload: *}}
 */
export const updateUserAuth = (user) => {
    // запись информации о пользователе в localStorage
    reactLocalStorage.setObject('auth', {
        ...reactLocalStorage.getObject('auth'),
        ...user
    });

    return {
        type: 'UPDATE_USER_AUTH',
        payload: user
    }
};

export const userLogout = () => {
    const auth = reactLocalStorage.getObject('auth');
    reactLocalStorage.setObject('auth', {phone: auth.phone});

    return {type: 'USER_LOGOUT'}
};

export const getAppVersion = (clientService) => ({confirm}={confirm:false}) => (dispatch) => {
    clientService.getAppVersion()
        .then((data) => {
            if(data.version.toString() !== appVersion.toString()) {
                const p = queryString.parse(document.location.href.split('?')[1]);
                //const v = get(p,'v', undefined);
                const c = get(p,'cordova', 'n');

                //if(v === undefined || v !== data.version.toString()) {
                    const href = `?cordova=${c}&v=${data.version}`;
                    if(!confirm) {
                        document.location = href;
                    } else {
                        dispatch(updateDevice({update_notify: true, update_url: href, update_version: data.version}))
                    }
                //}
            }
        });
}
