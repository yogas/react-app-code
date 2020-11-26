import MobileDetect from 'mobile-detect';
import {appVersion} from "../settings";

const updateDevice = (state, action) => {

    if(state === undefined) {
        const md = new MobileDetect(window.navigator.userAgent);
        console.log('mobile', md.mobile());

        return {
            ready: false,
            cordova: false,
            os: md.os(),
            tablet: md.tablet(),
            mobile: md.mobile(),
            nativePreloader: false,
            device_id: '',
            app_version: appVersion,
            channel_id: 'fcm_default_channel',
            offline: false,
            back_screen: '',
            update_notify: false,
            update_url: '',
            update_version: ''
        }
    }

    switch(action.type) {
        case 'UPDATE_DEVICE':
            return {
                ...state.device,
                ...action.payload
            };

        default:
            return state.device;
    }
};

export default updateDevice;
