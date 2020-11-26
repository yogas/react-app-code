import {updateArray} from '../utils';

const onPaycardSelect = (state, payload) => {
    const {items} = state.paycards;
    const idx = items.findIndex((el) => el.id===payload.id);

    const newItem = {
        ...items[idx],
        is_default: true
    };

    let newItems = items.map((item) => {
        return {
            ...item,
            is_default: false
        }
    });

    newItems = updateArray(newItems, newItem);

    const newPaycards = {
        ...state.paycards,
        items: newItems
    };

    return newPaycards;
};

const onDeletePaycard = (paycards, id) => {
    const item = paycards.items.find((el) => id===el.id);

    let is_default = false;
    let items = updateArray(paycards.items, {id}, 'remove');

    if(item !== undefined) { is_default = item.is_default; }

    // если удаляемая карта была выбрана по умолчанию то выделяем первую в списке
    if(is_default && items.length) {
        const item = {
            ...items[0],
            is_default: true
        };

        items = updateArray(items, item);
    }

    return {
        ...paycards,
        items
    };
};

const setSelectedId = (state) => {
    const {items} = state;
    let selectedId = null;

    if(items.length) {
        const item = items.find(({is_default}) => is_default);
        selectedId = item.id;
    }

    console.log('selectedId', selectedId);

    return {...state, selectedId};
};

const updatePaycards = (state, action) => {
    if(state === undefined) {
        return {
            loaded: false,
            items: [],
            deleted: [],
            selectedId: null
        }
    }

    switch(action.type) {
        case 'UPDATE_PAYCARDS':
            return setSelectedId({
                ...state.paycards,
                ...action.payload
            });

        case 'PAYCARD_SELECT':
            return setSelectedId(onPaycardSelect(state, action.payload));

        case 'PAYCARD_TO_DELETE':
            return setSelectedId({
                ...state.paycards,
                deleted: updateArray(state.paycards.deleted, action.payload.id, 'add')
            });

        case 'DELETE_PAYCARD':
            return setSelectedId(onDeletePaycard(state.paycards, action.payload.id));

        default:
            return state.paycards;
    }
};

export default updatePaycards;