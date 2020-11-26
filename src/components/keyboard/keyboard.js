import React from 'react';

const Keyboard = ({onPress}) => {
    return (
        <div className="keyboard screen-cards__keyboard text_weight_light">
            <div className="keyboard__row">
                <div
                    className="btn btn_size_md btn_color_white btn_style_filled btn_fluent"
                    onClick={onPress('1')}
                >
                    <div className="btn__label">
                        <div className="btn__text">1</div>
                    </div>
                </div>
                <div
                    className="btn btn_size_md btn_color_white btn_style_filled btn_fluent"
                    onClick={onPress('2')}
                >
                    <div className="btn__label">
                        <div className="btn__text">2</div>
                    </div>
                </div>
                <div
                    className="btn btn_size_md btn_color_white btn_style_filled btn_fluent"
                    onClick={onPress('3')}
                >
                    <div className="btn__label">
                        <div className="btn__text">3</div>
                    </div>
                </div>
            </div>
            <div className="keyboard__row">
                <div
                    className="btn btn_size_md btn_color_white btn_style_filled btn_fluent"
                    onClick={onPress('4')}
                >
                    <div className="btn__label">
                        <div className="btn__text">4</div>
                    </div>
                </div>
                <div
                    className="btn btn_size_md btn_color_white btn_style_filled btn_fluent"
                    onClick={onPress('5')}
                >
                    <div className="btn__label">
                        <div className="btn__text">5</div>
                    </div>
                </div>
                <div
                    className="btn btn_size_md btn_color_white btn_style_filled btn_fluent"
                    onClick={onPress('6')}
                >
                    <div className="btn__label">
                        <div className="btn__text">6</div>
                    </div>
                </div>
            </div>
            <div className="keyboard__row">
                <div
                    className="btn btn_size_md btn_color_white btn_style_filled btn_fluent"
                    onClick={onPress('7')}
                >
                    <div className="btn__label">
                        <div className="btn__text">7</div>
                    </div>
                </div>
                <div
                    className="btn btn_size_md btn_color_white btn_style_filled btn_fluent"
                    onClick={onPress('8')}
                >
                    <div className="btn__label">
                        <div className="btn__text">8</div>
                    </div>
                </div>
                <div
                    className="btn btn_size_md btn_color_white btn_style_filled btn_fluent"
                    onClick={onPress('9')}
                >
                    <div className="btn__label">
                        <div className="btn__text">9</div>
                    </div>
                </div>
            </div>
            <div className="keyboard__row">
                <div className="btn btn_size_md btn_color_white btn_style_filled btn_fluent">
                    <div className="btn__label">
                        <div className="btn__text"></div>
                    </div>
                </div>
                <div
                    className="btn btn_size_md btn_color_white btn_style_filled btn_fluent"
                    onClick={onPress('0')}
                >
                    <div className="btn__label">
                        <div className="btn__text">0</div>
                    </div>
                </div>
                <div
                    className="btn btn_size_md btn_color_white btn_style_filled btn_fluent"
                    onClick={onPress('')}
                >
                    <div className="btn__label">
                        <div className="btn__text">
                            <div className="icon icon_style_backspace"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Keyboard;