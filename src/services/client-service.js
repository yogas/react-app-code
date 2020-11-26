import request from 'request';
import {formatPhone, null2undefined, nullToZero} from '../utils';
import {updateUserAuth, setScreen, userLogout} from '../actions';
import isString from 'is-string';
import * as settings from '../settings';
import moment from 'moment-with-locales-es6';

export default class ClientService {

    _baseHostUrl = settings._appBaseHostUrl;
    _baseApiUrl = `${this._baseHostUrl}/api/v1`;
    _appUrl = settings._appUrl;

    store = {};

    access_token = null;
    refresh_token = null;
    client_id = null;

    constructor(store) {
        this.store = store;
    }

    updateAuthInfo = () => {
        const {
            access_token = null,
            refresh_token = null,
            client_id = null
        } = this.store.getState().user;

        this.access_token = access_token;
        this.refresh_token = refresh_token;
        this.client_id = client_id;
    };

    /**
     * Обёртка для запроса к АПИ
     * @param options
     * @returns {Promise}
     */
    getRequest = (options = {}, dummy = false) => {
        const defOptions = {
            uri: '',
            method: 'GET',
            qs: {},
            json: true
        };
        const res = new Promise((resolve, reject) => {
            request(
                {...defOptions, ...options},
                (error, response, body) => {

                    if(!error) {
                        let data = body;
                        if(isString(body)) {
                            data = {};
                        }

                        resolve({...data, statusCode: response.statusCode});
                    } else {
                        reject(error);
                    }
                }
            )
        });

        return res;
    };

    /**
     * Запрос с авторизацие пользователя
     * @param options
     * @returns {Promise}
     */
    getRequestWithAuth = (options = {}) => {
        this.updateAuthInfo();

        let request = this.getRequest({
            ...options,
            headers: {
                'Authorization': `Bearer ${this.access_token}`,
                'Accept': 'application/json'
            }
        });

        // проверка на авторизацию
        request.then((data) => {
            if(data.statusCode === 401) {
                this.refreshToken()
                    .then((refreshData) => {
                        console.log(refreshData);
                        // Если обновился токен то повторить запрос
                        if(refreshData.statusCode === 200) {
                            request = this.getRequest(options);
                        }

                        // Если не удалось обновить токен то показать экран авторизации
                        if(refreshData.statusCode === 401) {
                            this.store.dispatch(updateUserAuth({
                                access_token: null,
                                refresh_token: null,
                                authorized: false,
                                confirm: false,
                                rerequest: null,
                                auth_time: null
                            }));
                            this.store.dispatch(userLogout());
                            this.store.dispatch(setScreen('phone'));
                        }
                    });
            }
        });

        return request;
    };

    /**
     * Запрос отправки кода подтверждения по СМС
     * На каждый номер телефона можно отправлять не более 3 смс в пять минут.
     * [GET]/client/authcode?phone={phone}
     * @param phone
     * @returns {Promise}
     */
    getAuthCode = (phone) => {
        const phoneFormated = formatPhone(phone);

        const res = this.getRequest({
            uri: `${this._baseApiUrl}/client/authcode`,
            method: 'GET',
            qs: {phone: phoneFormated},
            json: true
        });

        return res;
    };

    /**
     * Запросить токен
     * @param client_id
     * @param code
     * @returns {Promise}
     */
    getToken = (client_id, code) => {
        const {device_id, os, app_version, channel_id} = this.store.getState().device;

        const res = this.getRequest({
            uri: `${this._baseHostUrl}/oauth/client/token`,
            method: 'POST',
            form: {
                grant_type: 'client_credentials',
                client_id,
                code,
                device_token: device_id,
                os,
                app_version,
                channel_id
            }
        });

        return res;
    };

    /**
     * Обновление токена авторизации
     * @returns {Promise}
     */
    refreshToken = () => {
        const {device_id, os, app_version, channel_id} = this.store.getState().device;
        const {client_id, refresh_token} = this.store.getState().user;
        const res = this.getRequest({
            uri: `${this._baseHostUrl}/oauth/client/token`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.access_token}`,
                'Accept': 'application/json'
            },
            form: {
                grant_type: 'refresh_token',
                client_id,
                refresh_token: refresh_token,
                device_token: device_id,
                os,
                app_version,
                channel_id
            }
        });

        res
            .then((data) => {
                if(data.statusCode === 200) {
                    const { access_token, refresh_token, expires_in} = data;
                    this.store.dispatch(updateUserAuth({
                        access_token,
                        refresh_token,
                        expires_in,
                        auth_time: Math.round((new Date()).getTime()/1000)
                    }));
                }
            });

        return res;
    };

    /**
     * Получить текущий заказ клиента
     * @return {Promise}
     */
    getActiveOrder = () => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/order`,
            headers: {
                'Authorization': `Bearer ${this.access_token}`
            }
        });
    };

    /**
     * Получение адреса по координатам
     * @return {Promise}
     */
    getAddress = ([lat, lon]) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/geocode/address`,
            qs: { lat, lon }
        });
    };

    getAddressSugg = (query) => {
        return this.getRequest({
            uri: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Token -`
            },
            body: {
                query,
                count: 10
            }
        });
    };

    /**
     * Яндекс.Карты Геокодирование
     * Прямое кодирование:
     * https://geocode-maps.yandex.ru/1.x/?geocode=Москва,+Тверская+улица,+дом+7
     */
    ymapsGeocodeAddress = (geocode) => {
        return this.getRequest({
            uri: 'https://geocode-maps.yandex.ru/1.x/',
            qs: { geocode, format: 'json', apikey: settings.ymapsGeoCodeApiKey }
        });
    };

    /**
     * Яндекс.Карты Геокодирование
     * Обратное кодирование:
     * https://geocode-maps.yandex.ru/1.x/?geocode=E134.854,S25.828
     */
    ymapsGeocodeCoords = ([lat, lon]) => {
        const geocode = `${lat},${lon}`;
        return this.getRequest({
            uri: 'https://geocode-maps.yandex.ru/1.x/',
            qs: { geocode, format: 'json' }
        });
    };

    /**
     * Google.Maps Геокодирование
     */
    googleGeocodeCoords = ([lat, lon]) => {
        return this.getRequest({
            uri: 'https://maps.googleapis.com/maps/api/geocode/json',
            qs: {
                latlng:`${lat},${lon}`,
                sensor: 'false',
                language: 'ru',
                key: ''
            }
        });
    };

    /**
     * Получение списка тарифов
     * [GET] /api/v1/rates
     */
    getTarifs = () => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/rates`,
        })
    };

    /**
     * Получение списка дополнительных услгу
     * [GET] /api/v1/addition-services
     */
    getAdditionServices = () => {

        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/addition-services`,
        });
    };

    /**
     * Получение привязанных карт пользователя
     * [GET] /api/v1/client/paycards
     * @returns {Promise}
     */
    getPaycards = () => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/paycards`,
            method: 'GET'
        });
    };

    /**
     * Привязка карты
     */
    addPaycard = () => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/paycard`,
            method: 'POST',
            body: {
                event: null,
                payload: {
                    returnUrl: `${this._appUrl}?cardAdded=y`,
                    cardError: `${this._appUrl}?cardError=y`
                }
            }
        });
    };

    /**
     * Привязка карты
     */
    payByPaycard = () => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/paycard`,
            method: 'POST',
            body: {
                event: null,
                payload: {
                    returnUrl: `${this._appUrl}?cardPayed=y`,
                    cardError: `${this._appUrl}?cardPayedError=y`
                }
            }
        });
    };

    /**
     * Удаление карты
     */
    selectPaycard = (id) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/paycard-select/${id}`,
            method: 'POST'
        });
    };

    /**
     * Удаление карты
     */
    deletePaycard = (id) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/paycard/${id}`,
            method: 'DELETE'
        });
    };

    /**
     * Получение профиля пользователя
     */
    getProfile = () => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/profile`
        })
    };

    /**
     * Logout
     */
    logOut = () => {
       return this.getRequest({
            uri: `${this._baseApiUrl}/client/logout`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.access_token}`,
                'Accept': 'application/json'
            }
        });
    };

    /**
     * Редактирование профиля
     */
    editProfile = (fields) => {

        const {
            first_name='',
            email='',
            phone='',
            photo='',
            onProgress=()=>{}
        } = null2undefined(fields);

        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/profile`,
            method: 'POST',
            body: {
                event: "",
                payload: {
                    first_name,
                    middle_name: "-",
                    last_name: "-",
                    email,
                    phone,
                    photo
                }
            },
            onProgress
        });
    };

    /**
     * Удаление фотографии
     */
    deleteProfilePhoto = () => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/profile/photo`,
            method: 'DELETE'
        });
    };

    /**
     * Получить заказы
     */
    getOrders = (page=1, npagecount=10) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/orders/${page}`,
            method: 'GET',
            qs: {npagecount}
        });
    };

    /**
     * Удалить поездку из истории
     */
    deleteHistory = (id) => {
        /*
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    statusCode: 204
                })
            }, 500);
        });*/
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/order/${id}`,
            method: 'DELETE'
        });
    };

    /**
     * Создание заказа
     */
    createOrder = (order) => {
        /*return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    statusCode: 201,
                    error: "paycard.empty",
                    message: "Paycard was not found"
                })
            }, 500);
        });*/

        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/order`,
            method: 'PUT',
            body: order
        });
    };

    /**
     * Обновление заказа
     */
    updateOrder = (order) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/order`,
            method: 'POST',
            body: order
        });
    };

    /**
     * Отмена заказа
     */
    cancelOrder = () => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/order/cancel`,
            method: 'POST'
        });
    };

    /**
     * Продлить заказ
     */
    extendOrder = (hours) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/order/extend`,
            method: 'POST',
            body: {
                event: null,
                payload: {
                    hours
                }
            }
        });
    };

    /**
     * Заверишть заказ
     */
    stopOrder = () => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/order/stop`,
            method: 'POST'
        });
    };

    rateTrip = ({rating, id}) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/order/${id}/vote`,
            method: 'POST',
            body: {
                event: null,
                payload: {
                    rating
                }
            }
        });
    };

    commentTrip = ({review, id}) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/order/${id}/review`,
            method: 'POST',
            body: {
                event: null,
                payload: {
                    review
                }
            }
        });
    };

    /**
     * Получение текущих координат водителя
     * @param id
     * @returns {Promise}
     */
    getDriverCoords = (id) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/locations/driver/${id}`,
        });
    };
    
    /**
     * Отправка координат клиента
     * @param coords
     * @returns {Promise}
     */
    sendClientCoords = (coords) => {

        const position = {
            "location": {
                "coords": {
                    "speed": nullToZero(coords.speed),
                    "longitude": nullToZero(coords.longitude),
                    "floor": 0,
                    "latitude": nullToZero(coords.latitude),
                    "accuracy": nullToZero(coords.accuracy),
                    "altitude_accuracy": nullToZero(coords.altitudeAccuracy),
                    "altitude": nullToZero(coords.altitude),
                    "heading": nullToZero(coords.heading)
                },
                "extras": {
                    "token": this.access_token
                },
                "is_moving": true,
                "odometer": 0,
                "uuid": this.client_id,
                "activity": {
                    "type": "unknown",
                    "confidence": 100
                },
                "battery": {
                    "level": -1,
                    "is_charging": false
                },
                "timestamp": moment.utc().format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z'
            }
        };

        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/locations`,
            method: 'POST',
            body: position
        })
    }

    /**
     * Добавить водителя в Избранное
     * @param id
     * @returns {Promise}
     */
    addDriverToFavorite = (id) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/favorite-drivers/${id}`,
            method: 'POST'
        });
    }

    /**
     * Добавить водителя в Черный Список
     * @param id
     * @returns {Promise}
     */
    addDriverToBlackList = (id) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/banned-drivers/${id}`,
            method: 'POST'
        });
    }

    /**
     * Удалить водителя в Избранное
     * @param id
     * @returns {Promise}
     */
    deleteDriverFromFavorite = (id) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/favorite-drivers/${id}`,
            method: 'DELETE'
        });
    }

    /**
     * Удалить водителя в Черного Списока
     * @param id
     * @returns {Promise}
     */
    deleteDriverFromBlackList = (id) => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/banned-drivers/${id}`,
            method: 'DELETE'
        });
    }

    /**
     * Удаление водителя из Списка
     * @param id
     * @param list
     * @returns {Promise}
     */
    deleteDriverFromList = (id, list="favorite") => {
        switch(list) {
            case "favorite":
                return this.deleteDriverFromFavorite(id);
            case "banned":
                return this.deleteDriverFromBlackList(id);
            default:
                return new Promise((resolve) => {resolve('nothin to do')});
        }
    }

    /**
     * Получение избранных водителей
     * @returns {Promise}
     */
    getFavorites = () => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/favorite-banned-drivers`,
            method: 'GET'
        });
    }

    /**
     * Получение последнего заказа
     * @returns {Promise}
     */
    getLastOrder = () => {
        return this.getRequestWithAuth({
            uri: `${this._baseApiUrl}/client/last-order-rating`,
            method: 'GET'
        });
    }
}
