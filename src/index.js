import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter as Router} from 'react-router-dom';
import ErrorBoundry from './components/error-boundry';
import ClientService from './services/client-service';
import GeolocationService from  './services/geolocation-service';
import {ClientServiceProvider} from './components/client-service-context';
import {GeolocationServiceProvider} from './components/geolocation-service-context';
import initCordova from './utils/init-cordova';
import App from './components/app';

import store from './store';

const clientService = new ClientService(store);
const geolocationService = new GeolocationService(store);

initCordova(store);

ReactDOM.render(
    <Provider store={store}>
        <ErrorBoundry>
            <ClientServiceProvider value={clientService}>
                <GeolocationServiceProvider value={geolocationService}>
                    <Router>
                        <App />
                    </Router>
                </GeolocationServiceProvider>
            </ClientServiceProvider>
        </ErrorBoundry>
    </Provider>,
    document.getElementById('root')
);
