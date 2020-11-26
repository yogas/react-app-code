import {showPreloader, hidePreloader} from './preloader';

export const updateExtend = (payload) => {
    return { type: 'EXTEND_UPDATE', payload };
};

export const changeExtendCount = (dir) => {
    return { type: 'CHANGE_EXTEND_COUNT', payload: {dir} }
};

export const extendOrderRequest = (clientService) => (hours) => (dispatch) => {
    dispatch(showPreloader());
    clientService.extendOrder(hours)
        .then((data) => {

            if(data.statusCode === 204) {
                dispatch(updateExtend({successPopup: true}));
            }

            dispatch(hidePreloader());
        })
        .catch((error) => {
            console.log(error);
            dispatch(hidePreloader());
        });
};