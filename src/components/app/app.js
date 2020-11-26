import React from 'react';
import Navigator from '../navigator';
import Preloader from '../preloader';
import PopupNotify from '../popup-notify';
import PopupUpdateAppNotify from '../popup-update-app-notify';
import { YMaps } from 'react-yandex-maps';
import { YMInitializer } from 'react-yandex-metrika';
import { yandexMetrika } from '../../settings';

const App = () => {
    return (
        <YMaps query={{
            //apikey: '2cb9cf71-62f8-4759-a173-989dc4b8d336',
            ns: 'use-load-option',
            load:'geocode,package.full',
            //onload: () => {},
            //load: 'package.full'
            //mode: "debug"
        }}>
            <Preloader />
            <Navigator />
            <PopupNotify />
            <PopupUpdateAppNotify />
            <div className="offline-helpers unvisible">
                <div className="icon icon_style_alert icon_inline"/>
                <div className="icon icon_style_call icon_inline btn__icon"/>
                <div className="btn btn_style_border btn__label">Offline</div>
                <div className="text_weight_medium">Offline</div>
                <div className="text_light">Offline</div>
                <YMInitializer accounts={[yandexMetrika]} options={{webvisor: true}} version="2" />
            </div>
        </YMaps>
    );
};

export default App;
