import React from 'react';
/**
 * Компонент отображения заголовка экрана
 */
const TitleBack = ({title, children, onClickBack=false, onClickClose=false}) => {

    const BackBtn = ({onClick=false}) => {
        if(!onClick) return false;
        return (
            <div
                className="icon icon_style_back"
                onClick={onClick}
            ></div>
        )
    };

    const CloseBtn = ({onClick=false}) => {
        if(!onClick) return false;
        return (
            <div
                className="icon icon_style_close-white title-back__close"
                onClick={onClick}
            ></div>
        )
    };

    return (
        <div className="title-back screen-tarif__title">
            <div className="title-back__side">
                <BackBtn onClick={onClickBack}/>
            </div>
            <div className="title-back__title">{title || children}</div>
            <div className="title-back__side">
                <CloseBtn onClick={onClickClose}/>
            </div>
        </div>
    );
};

export default TitleBack;