import React from 'react';

const ScreenText = ({
    title='',
    text='',
    onClose = ()=>{},
    btn={
        show: false,
        text: '',
        disabled: false,
        action: ()=>{}
    }}) => {

    let button = false;
    if(btn.show) {
        const btnCls = btn.disabled ? ' btn_disabled' : '';

        button = (
            <div
                className={`btn btn_style_border btn_size_md btn_color_black btn_width_fluent${btnCls}`}
                onClick={btn.action}
            >
                <div className="btn__label">
                    <div className="btn__text">{btn.text}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="screen-dogovor">
            <div className="screen-dogovor__header">
                <div
                    className="btn btn_style_word screen-dogovor__close"
                    onClick={onClose}
                >
                    <div className="btn__label">
                        <div className="btn__text">Готово</div>
                    </div>
                </div>
                <div className="logo logo_color_black logo_size_md screen-dogovor__logo"></div>
                <div className="screen-dogovor__title title">{title}</div>
            </div>
            <div className="screen-dogovor__content">
                <div className="screen-dogovor__text">{text}</div>
            </div>
            <div className="screen-dogovor__footer">
                <div className="screen-dogovor__gradient"></div>
                {button}
            </div>
        </div>
    );
};

export default ScreenText;