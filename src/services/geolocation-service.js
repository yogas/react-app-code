import {showNotify} from "../actions"
import {get} from 'lodash';
import askPermission from '../utils/ask-permisson';
import MobileDetect from 'mobile-detect';

/**
 * Класс GeolocationService
 * Предназначен для работы с геолокацией пользователя
 */
export default class GeolocationService {

    constructor(store = null) {
        this.store = store;
    }

    withCordovaInit = (callback) => (...args) => {
        const androidCordovaTry = 100;
        let tryCount = 0;

        const IID = setInterval(() => {
            if(window.isDeviceReady || tryCount >= androidCordovaTry) {
                callback(...args);
                clearInterval(IID);
            }

            tryCount++;

        }, 100);

    }

    /**
     * Запрос положения через плагин GPSLocation
     * @param params
     * @private
     */
    getCurrentPositionAndroid_ = (params) => {
        const {permissions} = window.cordova.plugins;

        const list = [
            permissions.ACCESS_COARSE_LOCATION,
            permissions.ACCESS_FINE_LOCATION
        ];

        if(get(window, 'cordova.plugins.permissions', false)) {
            askPermission(list[0], () => {
                askPermission(list[1], () => {

                    if(window.GPSLocation) {
                        window.GPSLocation.getCurrentPosition(...params);
                        alert('test');
                    } else {
                        window.navigator.geolocation.getCurrentPosition(...params);
                    }

                }, () => params.onError({message: list[1]}))
            }, () => params.onError( {message: list[0]}))
        }
    }

    /**
     * Запрос положения через плагин Cordova
     * @param params
     */
    getCurrentPositionAndroid = (params) => {
        window.navigator.geolocation.getCurrentPosition(...params);
    };

    getCurrentPositionPromise = (resolve, reject) => {

        const onSuccess = (position) => {
            resolve(position);
            console.log('geolocation Success:', position);
        };

        const onError =  (error) => {
            reject(error);
            console.log('geolocation Error:', error.message);
            this.store.dispatch(showNotify({
                message: 'GPS не работает',
                desc: `Функционал приложения ограничен. Включите GPS в настройках. \n${error.message}`
            }));
        };

        const options = {maximumAge: 300000, timeout: 5000, enableHighAccuracy: true};

        const params = [onSuccess, onError, options];
        const md = new MobileDetect(window.navigator.userAgent);

        this.withCordovaInit(() => {
            switch(md.os()) {
                case 'AndroidOS':
                    this.getCurrentPositionAndroid(params);
                    break;
                case 'iOS':
                    // для того, что бы не появлялось два запроса на геопозицию
                    // от приложения и от страницы для iOS
                    if(window.navigator.geolocation.getCurrentPositionCordova) {
                        window.navigator.geolocation.getCurrentPositionCordova(...params);
                    } else {
                        window.navigator.geolocation.getCurrentPosition(...params);
                    }
                    break;
                default:
                    window.navigator.geolocation.getCurrentPosition(...params);

            }
        })();

    };

    getCurrentPosition = () => {
        const md = new MobileDetect(window.navigator.userAgent);
        if(md.tablet() === 'iPad') {
            return new Promise((resolve, reject) => {
               reject('GPS не поддерживается на данном устроействе.');
                this.store.dispatch(showNotify({
                    message: 'Поодержка GPS отключена',
                    desc: 'GPS не поддерживается на данном устройстве.'
                }));
            });
        } else {
            return new Promise((resolve, reject) => {
                this.getCurrentPositionPromise(resolve, reject);
            });
        }
    }
}
