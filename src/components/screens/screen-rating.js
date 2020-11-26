import React, {Component} from 'react';
import ScreenInner from './screen-inner';
import Rating from '../rating';
import {connect} from 'react-redux';
import {compose, bindActionCreators} from 'redux';
import {updateRating, commentTripRequest, setScreen} from '../../actions';
import withClientService from '../hoc/with-client-service';

class ScreenRating extends Component {

    onChange = ({target: {value}}) => {
        this.props.updateRating({comment: value});
    };

    onClickSend = () => {
        if(!this.props.rating.btnDisabled) {
            this.props.commentTripRequest(this.props.rating.comment);
        }
    };

    onClickClose = () => {
        this.props.setScreen('map-address');
    };

    render() {
        console.log('rating', this.props.rating);
        const btnCls = this.props.rating.btnDisabled ? ' btn_disabled' : '';

        return (
            <ScreenInner>
                <div className="screen-rating screen">
                    <div className="screen-rating__content wrap">
                        <div className="title-close">
                            <div className="title-close__side"/>
                            <div className="title-close__title text text_color_white text_size_xlg text_align_center">Оставить отзыв</div>
                            <div
                                className="icon icon_style_close-white icon_inline title-close__side title-close__close"
                                onClick={this.onClickClose}
                            />
                        </div>
                        <Rating className="screen-rating__rating"/>
                        <div className="field-textarea field-textarea_style_filled screen-rating__textarea text text_size_md">
                            <textarea
                                className="field-textarea__field"
                                placeholder="Ваш комментарий"
                                value={this.props.rating.comment}
                                onChange={this.onChange}
                            />
                        </div>
                    </div>
                    <div className="screen-rating__footer wrap wrap_double">
                        <div
                            className={`btn btn_style_border btn_size_md btn_fluent${btnCls}`}
                            onClick={this.onClickSend}
                        >
                            <div className="btn__label">
                                <div className="btn__text">Отправить</div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScreenInner>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        rating: state.rating
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        setScreen,
        updateRating,
        commentTripRequest: commentTripRequest(clientService)
    }, dispatch)
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenRating);
