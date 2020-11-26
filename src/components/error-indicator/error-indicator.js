import React from 'react';
import {Popup, PopupContent, PopupButtons, PopupButton} from '../popup';

const ErrorIndicator = () => {

    const onOkeyClick = () => {
        window.location.reload();
    };

    return (
        <Popup>
            <PopupContent>
                <div className="text_align_center">
                    <div className={`icon icon_style_alert icon_inline`}></div>
                    <div className="text text_size_normal text_color_white">Что-то пошло не так...</div>
                    <div className="text text_size_sm text_color_gray">Нажмите на ОК для перезагрузки приложения</div>
                </div>
            </PopupContent>
            <PopupButtons>
                <PopupButton color="white" onClick={onOkeyClick}>OK</PopupButton>
            </PopupButtons>
        </Popup>
    )
};

export default ErrorIndicator;
