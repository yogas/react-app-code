import updateArray from '../utils/update-array';

const addHistoryPage = (state, action) => {
    const items = state.history.items;
    const newItems = updateArray(items, action.payload.items, 'addArray');
    const {pages, page, next} = action.payload;

    return {
        ...state.history,
        items: newItems,
        page,
        pages,
        next,
        loaded: page>=pages
    };
};

const deleteHistory = (state) => {
    const items = state.history.items;
    const newItems = updateArray(items, {id: state.history.detailId}, 'remove');

    return {
        ...state.history,
        items: newItems,
        detailId: null
    };
};

const initHistory = () => {
    return {
        loaded: false,
        page: null,
        pages: null,
        next: null,
        detailId: null,
        deleteConfirm: false,
        items: []
    }
};

const updateHistory = (state, action) => {
    if(state === undefined) {
        return initHistory();
    }

    switch(action.type) {
        case 'HISTORY_UPDATE':
            return {
                ...state.history,
                ...action.payload
            };

        case 'ADD_HISTORY_PAGE':
            return addHistoryPage(state, action);

        case 'DELETE_HISTORY':
            return deleteHistory(state);

        case 'CLEAR_HISTORY':
            return initHistory();

        default:
            return state.history;
    }
};

export default updateHistory;