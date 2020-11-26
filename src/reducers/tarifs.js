import updateArray from '../utils/update-array';
import numeralize from 'numeralize-rus-ukr';

/**
 * Расчет стоимости заказа
 */
const calculateTotal = (state) => {
    const {items, selectedId, hours, addition, additionSelectedId} = state;
    const tarif = items.find(({id}) => id===selectedId);
    const hoursPrice = tarif['price_'+hours+'_full'];
    const prepayPrice = tarif['price_'+hours+'_prepay'];
    const prepayText = numeralize.pluralize(prepayPrice, ['рубль', 'рубля', 'рублей']);
    let additionPrice = 0;
    let total = hoursPrice;

    additionSelectedId.forEach(({id: selectedId}) => {
        const item = addition.find(({id}) => id===selectedId);
        additionPrice += item.price;
        total += item.price;
    });

    return { prepayPrice, prepayText, hoursPrice, additionPrice, total };
};

/**
 * Обновление сейта тарифа
 */
const update = (state, action) => {
    const tarifs = {
        ...state,
        ...action.payload,
    };
    const total = calculateTotal(tarifs);
    return {
        ...tarifs,
        ...total
    };
};

/**
 * Редьюсер для тарифов
 */
const updateTarifs = (state, action) => {
    if(state === undefined) {
        return {
            loaded: false,
            items: [],
            selectedId: null,
            hours: 5,
            autorenewal: false,
            additionLoaded: false,
            addition: [],
            additionSelectedId: [],
            additionDetailId: null,
            additionComment: '',
            showCommentPopup: false,
            commentPopupText: '',
            commentPopupTitle: '',
            comments: [],
            fromComments: false,
            prepayPrice: 0,
            prepayText: '',
            hoursPrice: 0,
            total: 0
        }
    }

    switch(action.type) {
        case 'UPDATE_ADDITION_SERVICE':

            const newSelectedId = updateArray(
                state.tarifs.additionSelectedId,
                action.payload.item,
                action.payload.type
            );

            return update(state.tarifs, {payload: {additionSelectedId: newSelectedId}});

        case 'UPDATE_ADDITION_COMMENTS':

            const newComments = updateArray(
                state.tarifs.comments,
                action.payload.item,
                action.payload.type
            );

            return update(state.tarifs, {payload: {comments: newComments}});

        case 'UPDATE_TARIFS':
            return update(state.tarifs, action);

        default:
            return state.tarifs;
    }
};

export default updateTarifs;