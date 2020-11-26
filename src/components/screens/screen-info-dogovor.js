import React from 'react';
import ScreenInfoContent from './screen-info-content';
import getDogovors, {onDogovorClick} from '../../utils/dogovors';
import {connect} from 'react-redux';

const ScreenInfoDogovor = (props) => {

    const links = getDogovors();

    return (
        <ScreenInfoContent title="Договор оферты">
            <div className="dogovor-checkbox">
                {links.map(({name, href},idx) => {
                    return (
                        <div key={idx} className="dogovor-checkbox__row">
                            <label className="field-checkbox field-checkbox_color_black field-checkbox_style_box">
                                <span className="text text_size_smdd text_inline">
                                <span
                                    className="text__link dogovor-checkbox__link"
                                    onClick={() => {
                                        onDogovorClick(href, props.device.os);
                                    }}
                                    style={{color: 'white'}}
                                >{name}</span>
                            </span>
                            </label>
                        </div>
                    )
                })}
            </div>
        </ScreenInfoContent>
    )
};

const mapStateToProps = (state) => {
    return {
        device: state.device
    }
}

export default connect(mapStateToProps)(ScreenInfoDogovor);
