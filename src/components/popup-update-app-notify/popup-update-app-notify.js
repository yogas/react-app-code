import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Popup, PopupContent, PopupButtons, PopupButton} from '../popup';
import {updateDevice, showPreloader} from '../../actions';

class PopupUpdateAppNotify extends Component {

    onCancelClick = () => {
        this.props.updateDevice({update_notify: false});
    }

    onOkeyClick = () => {
        this.onCancelClick();
        document.location.href = this.props.device.update_url;
        this.props.showPreloader();
    };

    render() {
        const {update_notify, update_version} = this.props.device;
        const desc = 'Приложение будет перезагружено';

        if(!update_notify) return false;

        return (
            <Popup>
                <PopupContent>
                    <div className="text_align_center">
                        <div className={`icon icon_style_okey icon_inline`}/>
                        <div className="text text_size_normal text_color_white">Доступна новая версия {update_version}</div>
                        {desc!==''?<div className="text text_size_sm text_color_gray">{desc}</div>:false}
                    </div>
                </PopupContent>
                <PopupButtons>
                    <PopupButtons>
                        <PopupButton color="gray" onClick={this.onCancelClick}>Отмена</PopupButton>
                        <PopupButton color="white" onClick={this.onOkeyClick}>Обновить</PopupButton>
                    </PopupButtons>
                </PopupButtons>
            </Popup>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        device: state.device
    }
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        updateDevice,
        showPreloader
    }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(PopupUpdateAppNotify);
