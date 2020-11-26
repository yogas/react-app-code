export const updateCoords = (coords) => {
    return { type: 'UPDATE_COORDS', payload: coords };
};

export const showCoords = () => {
    return { type: 'SHOW_COORDS' };
};