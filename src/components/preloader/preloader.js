import React from 'react';
import {connect} from 'react-redux';

const Preloader = ({loading, device}) => {
    if(device.nativePreloader) return false;

    const spinnerClass = !loading ? ' hidden' : '';

    return (
        <div className={`preloader screen${spinnerClass}`}>
            <div className="preloader__spinner"></div>
        </div>
    );
};

const mapToStateProps = (state) => {
    return {
        loading: state.loading,
        device: state.device
    };
};

export default connect(mapToStateProps)(Preloader);