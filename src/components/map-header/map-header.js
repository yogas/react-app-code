import React from 'react';
import "./map-header.css"

/*const EditAddress = ({onEditAddress}) => {
    return (
        <div
            className="btn btn_style_round btn_bg_gray screen-map-address__edit-btn"
            onClick={onEditAddress}
        >
            <div className="btn__label">
                <div className="btn__text">Изменить адрес</div>
            </div>
        </div>
    );
};*/

const MapHeader = ({address = '', onEditAddress=null}) => {
    return (
        <div className="screen-map-address__header">
            <div
              className="screen-map-address__address"
              onClick={() => {
                  if(onEditAddress) {
                      onEditAddress();
                  }
              }}
            >{address}</div>
        </div>
    );
};

export default MapHeader;
