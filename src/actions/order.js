import {showPreloader, hidePreloader} from './preloader';
import {setScreen} from './screen';
import {updateCoords} from './coords';
import {updateDatePopup} from './index';
import {updateHistory} from './history';
import {showNotify} from './notify';
import utcDecode from '../utils/utc-decode';
import convertDate from '../utils/conver-date';
import moment from 'moment-with-locales-es6';
import {showMenu, showMenuScreen} from './menu';
import objectify from 'geoposition-to-object';
import {get} from 'lodash';


export const updateOrder = (order) => {
    return { type: 'UPDATE_ORDER', payload: order }
};

export const createOrder = (clientService) => (tarifs, order, coords, paycards, onSuccess=()=>{}, onError=()=>{}) => (dispatch, getState) => {

    const {placemark: [latitude, longitude], address} = coords;
    // конвертация даты в UTC
    let datetime = moment(order.date.utc).utc().format('DD.MM.YYYY HH:mm');

    if(datetime === 'Invalid date') {
        const {user, device} = getState();
        clientService.sendAppLog(JSON.stringify({order, tarifs, user, device}));
        dispatch(showNotify({message: 'Проверьте дату заказа еще раз', desc: 'После нажатия ОК вы попадёте на экран выбора даты заказа', callback: () => {
            dispatch(setScreen('map-address'));
        }}));

        return false;
    }

    const {
        selectedId: rate,
        hours,
        autorenewal,
        additionComment,
        comments,
        additionSelectedId
    } = tarifs;

    let comment = additionComment;

    comments.forEach((el) => {
        comment += "\n" + el.comment;
    });

    const addition_services = additionSelectedId.map(({id}) => id);

    dispatch(showPreloader());
    clientService.createOrder({
        event: null,
        payload: {
            coord: {
                latitude,
                longitude
            },
            address,
            datetime,
            rate,
            addition_services,
            hours,
            paycard: paycards.selectedId,
            auto_renewal: autorenewal ? 1 : 0,
            comment
        }
    })
        .then((data) => {
            if(data.error === null) {
                onSuccess();
                dispatch(updateHistory({loaded: false}));
            } else {
                clientService.sendAppLog(data.message);
                onError(data.message);
            }
            dispatch(hidePreloader());
        })
        .catch((error) => {
            clientService.sendAppLog(JSON.stringify(error));
            onError();
            dispatch(hidePreloader());
        })
};

export const loadActiveOrder = (clientService) => ({update=false, pay_error_time=false, old_pay_status='', callback=()=>{}}={}) => (dispatch, getState) => {
    if(!update) dispatch(showPreloader());
    clientService.getActiveOrder()
        .then((data) => {

            if(data.statusCode === 500) {
                dispatch(showNotify({message:'Ошибка на стороне сервера', reload: true}));
            }

            if(data.statusCode === 200) {

                const {
                    id,
                    coord,
                    address,
                    datetime,
                    status,
                    car,
                    car_number,
                    car_color_1,
                    car_color_2,
                    driver_id,
                    driver_name,
                    driver_photo,
                    driver_phone,
                    delay_time,
                    driver_arrived_datetime,
                    start_datetime,
                    hours,
                    duration,
                    rate,
                    pay_status
                } = data.result;

                let tarif_type = 'car';
                if(rate === '10f16bfd-82ee-11e9-8c3d-0242ac170002') {
                    tarif_type = 'driver';
                }

                const {latitude, longitude} = coord;
                const center = [latitude, longitude];

                const date = convertDate(utcDecode(datetime));

                dispatch(updateOrder({
                    id,
                    date,
                    status,
                    car,
                    car_number,
                    car_color_1,
                    car_color_2,
                    driver_id,
                    driver_name,
                    driver_photo,
                    driver_phone,
                    delay_time,
                    driver_arrived_datetime: utcDecode(driver_arrived_datetime, 'DD.MM.YYYY HH:mm'),
                    start_datetime: utcDecode(start_datetime, 'DD.MM.YYYY HH:mm'),
                    hours,
                    duration,
                    rate,
                    pay_status,
                    tarif_type
                }));

                if(getState().order.old_delay_time !== delay_time) {
                    dispatch(showNotify({type: 'attantion', message: `Водитель опаздывает на ${delay_time} минут. Приносим извинения за неудобства.`}))
                    dispatch(updateOrder({old_delay_time: delay_time}));
                }

                if(!update) {
                    dispatch(updateCoords({
                        center,
                        placemark: center,
                        address
                    }));
                }

                if(pay_status === 'error') {
                    const time = (new Date()).getTime();
                    const diff = (time - pay_error_time)/1000;

                    if(diff >= 180 || pay_error_time === null) {
                        switch(status) {
                            case 'not':
                            case 'new':
                                dispatch(showNotify({message: 'Ошибка оплаты заказа', desc: 'Заказ отменён'}));
                                cancelOrderRequest(clientService)()(dispatch);
                                break;
                            default:
                                dispatch(showNotify({
                                    message: 'Ошибка оплаты заказа',
                                    desc: 'Пожалуйста, измените способ оплаты',
                                    callback: () => {
                                        dispatch(updateOrder({pay_error_time: time}));
                                        showMenu()()(dispatch);
                                        showMenuScreen()('cards')(dispatch);
                                    }
                                }));
                        }
                    }
                }

                if(old_pay_status !== '' && old_pay_status !== pay_status) {

                    let message = '';
                    let desc = '';

                    switch(pay_status) {
                        case 'prepaid':
                            message = 'Заказ предоплачен';
                            desc = 'Предоплата по заказу спешно списана.';
                            break;
                        case 'paid':
                            message = 'Заказ оплачен';
                            desc = 'Ваш заказ успешно оплачен';
                            break;
                        default:
                            message = '';
                            message = '';
                    }

                    if(pay_status === 'paid') {
                        dispatch(showNotify({
                            type: 'okey',
                            message,
                            desc
                        }));
                    }
                }

                switch(status) {
                    case 'not':
                    case 'new':
                    case 'waiting':
                    case 'car.scheduled':
                        // экран ожидания заказа
                        dispatch(setScreen('waiting'));
                        break;

                    case 'car.otw':
                    case 'car.belate':
                    case 'car.arrived':
                        // экран подачи авто
                        dispatch(setScreen('feed'));
                        break;

                    case 'order.process':
                        // экран выполнения заказа
                        dispatch(setScreen('order'));
                        break;

                    case 'end':
                        // экран завершения заказа
                        break;

                    default:
                        break;
                }
            } else {
                if(getState().user.instruction) {
                    dispatch(setScreen('instruction'));
                } else {
                    dispatch(setScreen('map-address'));
                }
            }

            if(!update) dispatch(hidePreloader());

            callback();
        })
        .catch((error) => {
            console.log(error);
            dispatch(hidePreloader());
        });
};

export const updateOrderRequest = (clientService) => (order, coords, date) => (dispatch) => {
    dispatch(showPreloader());

    const datetime = moment(convertDate(date).utc).utc().format('DD.MM.YYYY HH:mm');

    clientService.updateOrder({
        event: null,
        payload: {
            coord: {
                latitude: coords.center[0],
                longitude: coords.center[1]
            },
            address: coords.address,
            datetime
        }
    })
        .then((data) => {
            let error = null;
            let opened = true;

            if(data.error === 'datetime.limit') {
                opened = true;
                error = data.message;
            }

            if(data.error === null) {
                opened = false;
                dispatch(updateOrder({date: convertDate(date)}));
            }

            dispatch(updateDatePopup({opened, error}));
            dispatch(hidePreloader());
        })
        .catch((error) => {
            console.log(error);
            dispatch(hidePreloader());
        })
};

export const cancelOrderRequest = (clientService) => () => (dispatch) => {
    dispatch(showPreloader());
    clientService.cancelOrder()
        .then((data) => {
            console.log(data);
            dispatch(hidePreloader());
            dispatch(updateOrder({cancelConfirm: false}));

            if(data.statusCode === 204) {
                dispatch(setScreen('map-address'));
            }
        })
        .catch((error) => {
            dispatch(hidePreloader());
        });
};

export const stopOrderRequest = (clientService) => (callback=()=>{}) => (dispatch, getState) => {
    dispatch(showPreloader());
    clientService.stopOrder()
        .then((data) => {
            dispatch(hidePreloader());

            if(data.statusCode === 204) {
                callback();

                dispatch(updateOrder({
                    rate_popup: true,
                    time_finished_popup: false,
                    panel: false,
                    last: {
                        id: getState().order.id,
                        driver_id: getState().order.driver_id,
                        rating: null,
                        status: "end"
                    }
                }));
            }
        })
        .catch((error) => {
            console.log(error);
            dispatch(hidePreloader());
        });
};

export const getDriverCoords = (clientService) => (id, callback = () => {}) => (dispatch) => {
    if(id === null) return false;

    clientService.getDriverCoords(id)
        .then((data) => {
            console.log('driver', data);

            if(data.statusCode === 200) {
                const default_driver_coords = {latitude: null, longitude: null, heading: null};
                const driver_coords = get(data, 'result.coords', default_driver_coords);
                dispatch(updateOrder({driver_coords}));

                callback(driver_coords);
            }
        })
        .catch((error) => {
            console.log(error);
            dispatch(hidePreloader());
        });
};

export const sendClientCoords = (clientService, geolocationService) => () => (dispatch) => {
    geolocationService.getCurrentPosition()
        .then((position) => {
            clientService.sendClientCoords(objectify(position).coords);
        })
        .catch((error) => {
            console.log(error);
        })
};

export const getLastOrder = (clientService) => () => (dispatch) => {
    const res = new Promise( (resolve, reject) => {

    dispatch(showPreloader());
    clientService.getLastOrder()
        .then((data) => {
            if(get(data, 'result.id', 0)) {
                clientService.getOrders().then((orders) => {
                    const last = orders.result.items.find(({id}) => id===data.result.id);
                    const last_data = {
                        id: last.id,
                        driver_id: last.driver_id,
                        rating: last.rating,
                        status: last.status
                    };
                    dispatch(updateOrder({last: last_data}));

                    resolve(last_data);
                });
            }

            dispatch(hidePreloader());
        })
        .catch((error) => {
            console.error(error);
            dispatch(hidePreloader());
            reject(error);
        });

    });

    return res;
}
