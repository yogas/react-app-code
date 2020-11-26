import numeralize from 'numeralize-rus-ukr';

const calculateFields = (state) => {
    let {count, additional_hour_price, hours, hkm} = state;
    count = count < 1 ? 1 : count;

    let hoursAll = hours + count;

    if(hoursAll >= state.max) {
        hoursAll = state.max;
        count = state.max - hours;
    }

    const sum = count*additional_hour_price;
    const padej = ['час','часа','часов'];
    const countText = numeralize.pluralize(count, padej);
    const hoursAllText = numeralize.pluralize(hoursAll, padej);
    const hkmValue = hkm*count;

    return {
        ...state,
        count,
        sum,
        hoursAll,
        hoursAllText,
        countText,
        hkmValue
    }
};

const extendUpdate = (state, action) => {
    if(state === undefined) {
        return calculateFields({
            count: 1,
            countText: '',
            additional_hour_price: 0,
            sum: 0,
            hours: 0,
            hoursText: '',
            hoursAll: 0,
            max: 12,
            hkm: 25,
            hkmValue: 0,
            popup: false,
            successPopup: false
        });
    }

    switch(action.type) {
        case 'EXTEND_UPDATE':
            return calculateFields({
                ...state.extend,
                ...action.payload
            });

        case 'CHANGE_EXTEND_COUNT':
            let count = state.extend.count + action.payload.dir;
            return calculateFields({...state.extend, count});

        default:
            return state.extend;
    }
};

export default extendUpdate;