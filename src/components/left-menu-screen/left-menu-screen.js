import React from 'react';
import {
    ScreenCards,
    ScreenCardsEdit,
    ScreenCardsAdd,
    ScreenProfile,
    ScreenProfileEdit,
    ScreenHistory,
    ScreenHistoryDetail,
    ScreenInfo,
    ScreenInfoTarif,
    ScreenInfoDogovor,
    ScreenInfoApp,
    ScreenInfoInstruction,
    ScreenDrivers,
    ScreenDriversList
} from '../screens';

const LeftMenuScreen = ({screen=false, opened=false}) => {
    if(screen === false) return false;

    const getScreen = (code) => {
        switch (code) {
            case 'cards':
                return <ScreenCards/>;
            case 'cards-edit':
                return <ScreenCardsEdit/>;
            case 'cards-add':
                return <ScreenCardsAdd />;
            case 'profile':
                return <ScreenProfile />;
            case 'profile-edit':
                return <ScreenProfileEdit />;
            case 'history':
                return <ScreenHistory />;
            case 'history-detail':
                return <ScreenHistoryDetail />;
            case 'info':
                return <ScreenInfo />;
            case 'info-tarif':
                return <ScreenInfoTarif />;
            case 'info-dogovor':
                return <ScreenInfoDogovor />;
            case 'info-app':
                return <ScreenInfoApp />;
            case 'info-instruction':
                return <ScreenInfoInstruction/>;
            case 'drivers':
                return <ScreenDrivers/>;
            case 'drivers-list':
                return <ScreenDriversList/>;

            default:
                return false;
        }
    };

    const Screen = getScreen(screen);
    if(!Screen) return false;

    const openedCls = opened ? ' left-menu__screen_opened' : '';

    return (
        <div className={`left-menu__screen${openedCls}`}>
            {Screen}
        </div>
    )
};

export default LeftMenuScreen;
