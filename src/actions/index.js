import {setScreen} from './screen';

import {
    updateUserAuth,
    userLogout,
    getAppVersion
} from './user';

import {
    updateCoords,
    showCoords
} from './coords';

import {
    hidePreloader,
    showPreloader
} from './preloader';

import {
    updateTarifs,
    updateAdditionService,
    updateAdditionComments,
    loadTarifs
} from './tarifs';

import {
    updatePaycards,
    paycardSelect,
    paycardSelectRequest,
    loadPaycards,
    paycardToDelete,
    deletePaycard
} from './paycards';

import {
    updateNewCard,
    onNewCardChange,
    clearNewCard
} from './new-card';

import {
    showMenu,
    hideMenu,
    hideMenuStatic,
    updateMenu,
    showMenuScreen,
    showMenuScreenAnimated,
    hideMenuScreen
} from './menu';

import {
    updateProfile,
    loadProfile,
    profileLogout,
    deleteProfilePhoto
} from './profile';

import {
    loadHistory,
    addPageToHistory,
    showOrderDetail,
    updateHistory,
    showConfirmPopup,
    hideConfirmPopup,
    deleteHistory
} from './history';

import {
    updateOrder,
    createOrder,
    loadActiveOrder,
    updateOrderRequest,
    cancelOrderRequest,
    stopOrderRequest,
    getDriverCoords,
    sendClientCoords,
    getLastOrder
} from './order';

import {
    updateExtend,
    changeExtendCount,
    extendOrderRequest
} from './extend';

import {
    updateRating,
    rateTripRequest,
    commentTripRequest,
    addDriverToFavorite,
    addDriverToBlackList,
    getDriversList,
    deleteDriverFromList
} from './rating';

import {
    updateNotify,
    showNotify,
    hideNotify
} from './notify';

export const updatePanel = (panel) => {
    return { type: 'UPDATE_PANEL', payload: panel }
};

export const resetStore = () => {
    return { type: 'RESET_STORE' }
};

export const updateDatePopup = (payload) => {
    return { type: 'UPDATE_DATE_POPUP', payload};
};

export const updateDevice = (payload) => {
    return { type: 'UPDATE_DEVICE', payload };
};

export {
    // user.js
    updateUserAuth,
    userLogout,
    getAppVersion,
    // coords.js
    updateCoords,
    showCoords,
    // screen.js
    setScreen,
    // preloader.js
    showPreloader,
    hidePreloader,
    // tarifs.js
    updateTarifs,
    updateAdditionService,
    updateAdditionComments,
    loadTarifs,
    // paycards.js
    updatePaycards,
    paycardSelect,
    paycardSelectRequest,
    loadPaycards,
    paycardToDelete,
    deletePaycard,
    // new-card.js
    updateNewCard,
    onNewCardChange,
    clearNewCard,
    // menu.js
    updateMenu,
    showMenu,
    hideMenu,
    hideMenuStatic,
    showMenuScreen,
    showMenuScreenAnimated,
    hideMenuScreen,
    // profile.js
    updateProfile,
    loadProfile,
    profileLogout,
    deleteProfilePhoto,
    // history.js
    loadHistory,
    addPageToHistory,
    showOrderDetail,
    updateHistory,
    showConfirmPopup,
    hideConfirmPopup,
    deleteHistory,
    // order.js
    updateOrder,
    createOrder,
    loadActiveOrder,
    updateOrderRequest,
    cancelOrderRequest,
    stopOrderRequest,
    getDriverCoords,
    sendClientCoords,
    getLastOrder,
    // extend.js
    updateExtend,
    changeExtendCount,
    extendOrderRequest,
    // rating.js
    updateRating,
    rateTripRequest,
    commentTripRequest,
    addDriverToFavorite,
    addDriverToBlackList,
    getDriversList,
    deleteDriverFromList,
    // notify.js
    updateNotify,
    showNotify,
    hideNotify,
};
