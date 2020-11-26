import React from 'react';

const {
    Provider: GeolocationServiceProvider,
    Consumer: GeolocationServiceConsumer
} = React.createContext();

export {
    GeolocationServiceProvider,
    GeolocationServiceConsumer
};