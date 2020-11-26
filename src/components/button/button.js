import React from 'react';

const Button = ({title='Кнопка', disabled, onClick}) => {
    const cls = disabled ? ' btn_disabled' : '';
    return (
        <div
            className={`btn btn_style_border btn_size_md btn_fluent${cls}`}
            onClick={onClick}
        >
            <div className="btn__label">
                <div className="btn__text">{title}</div>
            </div>
        </div>
    )
};

export default Button;