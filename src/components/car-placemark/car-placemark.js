import React from 'react';
import {Placemark} from 'react-yandex-maps';

const CarPlacemark = ({driver_coords, placemarkCarOptions}) => {

    if(driver_coords === null) {
        return false;
    }

    const {
        latitude,
        longitude
    } = driver_coords;

    if(latitude === null || longitude === null || !latitude || !longitude) {
        return false;
    }

    const coords = [latitude, longitude];

    return (
        <Placemark
            geometry={coords}
            defaultOptions={placemarkCarOptions}
        />
    )
};

export default CarPlacemark;
