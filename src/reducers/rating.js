const calculateFields = (rating) => {
    const btnDisabled = rating.comment.length > 5 ? false : true;

    return {
        ...rating,
        btnDisabled
    }
};

const updateRating = (state, action) => {

    if(state === undefined) {
        return calculateFields({
            rate: 0,
            comment: '',
            btnDisabled: true,
            favorite: [],
            banned: [],
            lists_loaded: false,
            current_list: ''
        })
    }

    switch(action.type) {
        case 'UPDATE_RATING':
            return calculateFields({
                ...state.rating,
                ...action.payload
            });

        default:
            return state.rating;
    }
};

export default updateRating;
