import React from 'react';
import {GeolocationServiceConsumer} from '../geolocation-service-context';

const withGeolocationService = () => (Wrapper) => {
    return (props) => {
        return (
            <GeolocationServiceConsumer>
                {
                    (geolocationService) => {
                        return (<Wrapper {...props} geolocationService={geolocationService}/>);
                    }
                }
            </GeolocationServiceConsumer>
        );
    }
};

export default withGeolocationService;