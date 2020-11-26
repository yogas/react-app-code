import {validate} from 'email-validator';

const newCardDefault = {
    number: ''.replace(/\s/gi,''),
    holder: '',
    date: '',
    cvc: '',
    email: '',
    remember_card: false, // для того, чтобы сохранить карту нунжно отправить запрос с clientId
    filled: false,
    status: '',
    message: '',
    focus: 'number',
    short_validate: false
};

const checkFilled = (card) => {
    const {number, holder, date, cvc, email, short_validate} = card;
    let filled = true;
    const checkNumber = number.replace(/[\s]{1,}/gi,'');

    if(checkNumber.match(/_/)) {
        filled = false;
    }

    if(!date.match(/[0-9]{2}\/[0-9]{2}/)) {
        filled = false;
    }

    if(!cvc.match(/^[0-9]{3,}/)) {
        filled = false;
    }

    if(!short_validate) {
        if (!validate(email)) {
            filled = false;
        }

        if (holder.length < 3) {
            filled = false;
        }
    }

    return {
        ...card,
        filled
    };
};

const new_card = (state, action) => {

    if(state === undefined) {
        return checkFilled(newCardDefault);
    }

    switch(action.type) {
        case 'UPDATE_NEW_CARD':
            const card = {
                ...state.new_card,
                ...action.payload
            };
            return checkFilled(card);

        case 'CLEAR_NEW_CARD':
            return checkFilled(newCardDefault);

        default:
            return checkFilled(state.new_card);
    }
};

export default new_card;