import {centerOfMoskow} from '../settings/index';

const defaultCoords = centerOfMoskow;

const setCoords = (state = {
    zoom: 14,
    center: defaultCoords, // [latitude, longitude], координаты центра карты
    placemark: defaultCoords, // координаты плейсмарка
    address: '', // текущий адрес
    suggest: [], // подсказки
    suggest_address: '',
    loading: false,
    distance: 0, // расстояние от центра Москвы (Нулевой км)
}, payload = {}) => {
    return {...state,...payload};
};

const updateCoords = (state, action) => {

    if(state === undefined) {
        return setCoords();
    }

    switch(action.type) {

        case 'SHOW_COORDS':
            return state.coords;

        case 'UPDATE_COORDS':
            return setCoords(state.coords, action.payload);

        default:
            return state.coords;
    }
};

export default updateCoords;
