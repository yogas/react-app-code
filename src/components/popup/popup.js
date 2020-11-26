import React from 'react';

export const PopupContent = (props) => {
    return props.children;
};

export const PopupButton = ({children, color='gold', onClick}) => {
    return (
        <div className="popup__btn" onClick={onClick}>
            <div className={`popup__btn-label text text_color_${color} text_size_md text_weight_medium`}>{children}</div>
        </div>
    );
};

export const PopupButtons = (props) => {
    return props.children;
};

export const Popup = (props) => {
    const [content=false, buttons=false] = props.children;
    return (
        <div className="popup wrap">
            <div className="popup__popup">
                <div className="popup__content">
                    {content}
                </div>
                <div className="popup__footer">
                    {buttons}
                </div>
            </div>
        </div>
    )
};