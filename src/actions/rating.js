import {showPreloader, hidePreloader} from './preloader';
import {setScreen} from './screen';
import {showNotify} from "./notify";

export const updateRating = (payload) => {
    return { type: 'UPDATE_RATING', payload};
};

export const rateTripRequest = (clientService) => (rating, callback=()=>{}) => (dispatch, getState) => {
    dispatch(showPreloader());
    const id = getState().order.last.id;
    clientService.rateTrip({rating, id})
        .then((data) => {
            dispatch(hidePreloader());
            console.log(data);
            if(data.statusCode === 204) {
                callback();
            }
        })
        .catch((error) => {
            console.log(error);
            dispatch(hidePreloader());
        });
};

export const commentTripRequest = (clientService) => (review) => (dispatch, getState) => {
    dispatch(showPreloader());
    const id = getState().order.last.id;
    clientService.commentTrip({review, id})
        .then((data) => {
            dispatch(hidePreloader());
            console.log(data);
            if(data.statusCode === 204) {
                dispatch(setScreen('map-address'));
            }
        })
        .catch((error) => {
            console.log(error);
            dispatch(hidePreloader());
        });
};

export const addDriverToFavorite = (clientService) => (id, callback=()=>{}) => (dispatch) => {
    dispatch(showPreloader());
    clientService.addDriverToFavorite(id)
        .then((data) => {
            console.log(data);
            dispatch(hidePreloader());
            callback();
        })
        .catch((error) => {
            console.log(error);
            dispatch(showNotify({type:'alert', message: 'Ошибка', desc: error}));
            dispatch(hidePreloader());
        });
}

export const addDriverToBlackList = (clientService) => (id, callback=()=>{}) => (dispatch) => {
    dispatch(showPreloader());
    clientService.addDriverToBlackList(id)
        .then((data) => {
            console.log(data);
            dispatch(hidePreloader());
            callback();
        })
        .catch((error) => {
            console.log(error);
            dispatch(showNotify({type:'alert', message: 'Ошибка', desc: error}));
            dispatch(hidePreloader());
        });
}

export const getDriversList = (clientService) => () => (dispatch) => {
    dispatch(showPreloader());
    clientService.getFavorites()
        .then((data) => {
            console.log(data);
            if(data.error === null) {
                const {favorite, banned} = data.result;
                dispatch(updateRating({
                    favorite,
                    banned,
                    lists_loaded: true
                }))
            } else {
                dispatch(showNotify({type:'alert', message: data.error}));
            }
            dispatch(hidePreloader());
        })
        .catch((error) => {
            console.log(error);
            dispatch(showNotify({type:'alert', message: error}));
            dispatch(hidePreloader());
        });
}

export const deleteDriverFromList = (clientService) => (id, list) => (dispatch) => {
    dispatch(showPreloader());
    clientService.deleteDriverFromList(id, list)
        .then((data) => {
            if(data.statusCode === 204) {
                getDriversList(clientService)()(dispatch);
            } else {
                dispatch(showNotify({type:'alert', message: data.error}));
            }
            dispatch(hidePreloader());
        })
        .catch((error) => {
            console.error(error);
            dispatch(showNotify({type:'alert', message: error}));
            dispatch(hidePreloader());
        });
}
