export const updateNewCard = (payload) => {
    return { type: 'UPDATE_NEW_CARD', payload }
};

export const clearNewCard = () => {
    return { type: 'CLEAR_NEW_CARD' };
};

// Обновление даннах карты при вводе
export const onNewCardChange = () => (props) => (dispatch) => {

    const {
        field,
        target,
        payload = {}
    } = props;

    let value = target.value;
    const {type=''} = payload;

    if(type === 'checkbox') {
        value = target.checked
    }

    dispatch(updateNewCard({[field]: value}));
};