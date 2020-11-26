import {showPreloader, hidePreloader} from './preloader';

export const updateTarifs = (tarifs) => {
    return { type: 'UPDATE_TARIFS', payload: tarifs }
};

export const updateAdditionService = (item, type) => {
    return { type: 'UPDATE_ADDITION_SERVICE', payload: {item,type} }
};

export const updateAdditionComments = (item, type) => {
    return { type: 'UPDATE_ADDITION_COMMENTS', payload: {item, type} }
};

export const loadTarifs = (clientService) => (
    {
        callback = () => {},
        preloaderHide = false
    } = {}
) => (dispatch) => {

    dispatch(showPreloader());
    clientService.getTarifs()
        .then((data) => {

            if(data.error === null) {
                const {items} = data.result;

                dispatch(updateTarifs({
                    loaded: true,
                    items,
                    selectedId: items[0].id,
                }));
            }

            if(preloaderHide) {
                dispatch(hidePreloader());
            }
            callback();
        })
        .catch((error) => {
            console.log(error);
            dispatch(hidePreloader());
        });
};