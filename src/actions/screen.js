/**
 * Установить код текущего экрана
 * @param screen
 * @returns {{type: string, payload: *}}
 */
export const setScreen = (screen) => {
    return {
        type: 'SET_SCREEN',
        payload: screen
    }
};