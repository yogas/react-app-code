import moment from 'moment-with-locales-es6';

const formatDate = (state) => {
    const datetime = moment(state.date.utc).format('DD.MM.YYYY HH:mm');

    return {
        ...state,
        datetime
    }
};

const updateOrder = (state, action) => {
    if(state === undefined) {
        return {
            id: null,
            date: {
                utc: '',
                mon: '',
                dayofweek: '',
                time: ''
            },
            status: '',
            datetime: null,
            btnNextDisabled: true,
            cancelConfirm: false,
            car: null,
            car_number: null,
            car_color_1: null,
            car_color_2: null,
            driver_id: null,
            driver_name: null,
            driver_photo: null,
            driver_phone: null,
            delay_time: null,
            old_delay_time: null,
            driver_arrived_datetime: null,
            driver_coords: { latidude: null, longitude: null, heading: null},
            popupExtend: false,
            panel: true,
            additional_hour_price: null,
            time_finished_popup: false,
            left_time: null,
            rate_popup: false,
            hours: null,
            duration: null,
            pay_status: null,
            pay_error_time: null,
            tarif_type: '',
            last: null
        }
    }

    switch(action.type) {
        case 'UPDATE_ORDER': {
            return formatDate({
                ...state.order,
                ...action.payload
            })
        }
        default: {
            return state.order;
        }
    }
};

export default updateOrder;
