import updateUser from './user';
import updateScreen from './screen';
import updatePreloader from './preloader';
import updateCoords from './coords';
import updateDevice from './device';
import updateOrder from './order';
import updatePanel from './panel';
import updateTarifs from './tarifs';
import updateNewCard from './new-card';
import updatePaycards from './paycards';
import updateMenu from './menu';
import updateProfile from './profile';
import updateHistory from './history';
import updateDatePopup from './date-popup';
import updateExtend from './extend';
import updateRating from './rating';
import updateNotify from './notify';
import {appENV} from "../settings";

const model = (state, action) => {
    return {
        loading: updatePreloader(state, action),
        screen: updateScreen(state, action),
        user: updateUser(state, action),
        coords: updateCoords(state, action),
        device: updateDevice(state, action),
        order: updateOrder(state, action),
        panel: updatePanel(state, action),
        tarifs: updateTarifs(state, action),
        new_card: updateNewCard(state, action),
        paycards: updatePaycards(state, action),
        menu: updateMenu(state, action),
        profile: updateProfile(state, action),
        history: updateHistory(state, action),
        date_popup: updateDatePopup(state, action),
        extend: updateExtend(state, action),
        rating: updateRating(state, action),
        notify: updateNotify(state, action)
    }
};

const reducer = (state, action) => {
    if(appENV !== 'production') {
        console.log(action);
    }

    switch(action.type) {
        case 'USER_LOGOUT':
            return {
                ...model(undefined, action),
                loading: updatePreloader(state, action),
                user: updateUser(state, action),
                screen: 'phone',
                device: updateDevice(state, action),
                tarifs: updateTarifs(state, action),
            };

        default:
            return model(state, action);
    }
};

export default reducer;
