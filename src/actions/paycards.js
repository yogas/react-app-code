import {showPreloader, hidePreloader} from './preloader';

export const updatePaycards = (payload) => {
    return { type: 'UPDATE_PAYCARDS', payload };
};

export const paycardSelect = (id) => {
    return { type: 'PAYCARD_SELECT', payload: { id } };
};

// Выделение карты
// и отправка запроса на установку по уполчанию карты
export const paycardSelectRequest = (clientService) => (id) => (dispatch) => {
    dispatch(paycardSelect(id));
    dispatch(showPreloader());
    clientService.selectPaycard(id)
        .then(() => {
            dispatch(hidePreloader());
        });
};

// Загрузка привязанных карт
// с использованием Thunk
export const loadPaycards = (clientService) => (callback=()=>{}) => (dispatch) => {
    dispatch(showPreloader());
    clientService.getPaycards(false)
        .then((data) => {
            console.log(data);
            if(data.statusCode === 200) {
                const items = data.result.items;
                const loaded = items.length?true:false;
                dispatch(updatePaycards({items, loaded}));
                callback();
            }

            dispatch(hidePreloader());
        });
};

export const paycardToDelete = (id) => {
    return { type: 'PAYCARD_TO_DELETE', payload: { id } };
};

export const deletePaycard = (id) => {
    return { type: 'DELETE_PAYCARD', payload: { id } };
};
