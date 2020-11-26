import {showPreloader, hidePreloader} from './preloader';
import {updateMenu, showMenuScreen} from './menu';

export const updateHistory = (payload) => {
    return {type: 'HISTORY_UPDATE', payload};
};

export const addPageToHistory = (payload) => {
    return {type: 'ADD_HISTORY_PAGE', payload };
};

export const loadHistory = (clientService) => ({page, callback}={page:1, callback:()=>{}}) => (dispatch) => {
    dispatch(showPreloader());
    clientService.getOrders(page)
        .then((data) => {
            console.log(data);

            if(data.statusCode === 404) {

            }

            if(data.statusCode === 200) {
                const { items, pages, next } = data.result;

                console.log(items);

                dispatch(addPageToHistory({
                    items,
                    page,
                    pages,
                    next
                }));
            }

            dispatch(hidePreloader());

            callback();
        })
        .catch((error) => {
            dispatch(hidePreloader());
            console.log(error);
        });
};

export const showOrderDetail = () => (id) => (dispatch) => {
    dispatch(updateHistory({detailId: id}));
    dispatch(updateMenu({screen: 'history-detail'}));
};

export const showConfirmPopup = () => (dispatch) => {
    dispatch(updateHistory({deleteConfirm: true}))
};

export const hideConfirmPopup = () => (dispatch) => {
    dispatch(updateHistory({deleteConfirm: false}))
};

export const clearHistory = () => {
    return {type: 'CLEAR_HISTORY'};
};

export const deleteHistory = (clientService) => (id) => (dispatch) => {
    dispatch(showPreloader());
    clientService.deleteHistory(id)
        .then((data) => {
            if(data.statusCode === 204) {
                showMenuScreen()('history')(dispatch);
                dispatch({type: 'DELETE_HISTORY'});
                dispatch(clearHistory());
                loadHistory(clientService)()(dispatch);
            }
        });

};