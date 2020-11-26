import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Popup, PopupContent, PopupButtons, PopupButton} from '../popup';
import {hideNotify, updateNotify} from '../../actions';

class PopupNotify extends Component {

    onOkeyClick = () => {
        if(this.props.notify.reload) {
            window.location.reload();
        }

        if(this.props.notify.callback !== null) {
            this.props.notify.callback();
            this.props.updateNotify({callback: null});
        }

        this.props.hideNotify();
    };

    showButton = (show=true) => {
        if(!show) return false;

        const {buttons} = this.props.notify;
        if(buttons.length) {
            return (
                <PopupButtons>
                    {buttons.map((item) => {
                        return item;
                    })}
                </PopupButtons>
            )
        }

        return (
            <PopupButtons>
                <PopupButton color="white" onClick={this.onOkeyClick}>OK</PopupButton>
            </PopupButtons>
        )
    };

    render() {
        const {message, type, show, desc, showbtn} = this.props.notify;

        if(!show) return false;

        return (
            <Popup>
                <PopupContent>
                    <div className="text_align_center">
                        <div className={`icon icon_style_${type} icon_inline`}/>
                        <div className="text text_size_normal text_color_white">{message}</div>
                        {desc!==''?<div className="text text_size_sm text_color_gray">{desc}</div>:false}
                    </div>
                </PopupContent>
                {this.showButton(showbtn)}
            </Popup>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        notify: state.notify
    }
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        hideNotify,
        updateNotify
    }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(PopupNotify);
