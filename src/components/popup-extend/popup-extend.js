import React, {Component} from 'react';
import {connect} from 'react-redux';
import {compose, bindActionCreators} from 'redux';
import withClientService from '../hoc/with-client-service';
import {
    updateOrder,
    loadTarifs,
    updateExtend,
    changeExtendCount,
    extendOrderRequest
} from '../../actions';
import {Popup, PopupContent, PopupButtons, PopupButton} from '../popup';

class PopupExtendContainer extends Component {

    onCancelClick = () => {
        const time_finished_popup = this.props.order.left_time <= 0;

        this.props.updateOrder({panel: true, time_finished_popup});
        this.props.updateExtend({popup: false});
    };

    onTarifsLoaded = () => {
        const {rate, hours} = this.props.order;
        const {items} = this.props.tarifs;
        const {additional_hour_price} = items.find(({id}) => rate===id);

        this.props.updateExtend({
            hours,
            additional_hour_price
        })
    };

    onCountChange = (dir) => () => {
        this.props.changeExtendCount(dir);
    };

    onExtendClick = () => {
        this.props.extendOrderRequest(this.props.extend.count);
    };

    onOkeyClick = () => {
        this.props.updateOrder({panel: true});
        this.props.updateExtend({successPopup: false, popup: false});
    };

    componentDidMount() {
        if(!this.props.tarifs.loaded) {
            this.props.loadTarifs({preloaderHide: true, callback: this.onTarifsLoaded});
        } else {
            this.onTarifsLoaded();
        }
    }

    render() {
        if(!this.props.tarifs.loaded) return false;

        const popupExtendProps = {
            ...this.props.extend,
            onCountChange: this.onCountChange,
            onExtendClick: this.onExtendClick,
            onCancelClick: this.onCancelClick
        };

        const successPopupProps = {
            ...this.props.extend,
            onOkeyClick: this.onOkeyClick
        };

        return (
            <React.Fragment>
                <PopupExtend {...popupExtendProps} />
                <PopupSuccess {...successPopupProps} />
            </React.Fragment>
        );
    }
}

const PopupExtend = (props) => {

    const {
        successPopup,
        count,
        countText,
        sum,
        hoursAll,
        hoursAllText,
        max,
        hkm,
        onCountChange,
        onExtendClick,
        onCancelClick
    } = props;

    if(successPopup) return false;

    return (
        <div className="popup wrap wrap">
            <div className="popup__popup">
                <div className="popup__content">
                    <div className="time-popup">
                        <div className="time-popup__title text text_color_white text_align_center">Продлить время поездки</div>
                        <div className="field-time-extend time-popup__time-extend">
                            <div
                                className="field-time-extend__minus field-time-extend__btn"
                                onClick={onCountChange(-1)}
                            >
                                <div className="icon icon_style_minus"></div>
                            </div>
                            <div className="field-time-extend__info text text_color_white text_size_md">
                                <div className="field-time-extend__label">{count} {countText} <span className="text_color_gray">/ +{sum} рублей</span>
                                </div>
                            </div>
                            <div
                                className="field-time-extend__plus field-time-extend__btn"
                                onClick={onCountChange(1)}
                            >
                                <div className="icon icon_style_extend"></div>
                            </div>
                        </div>
                        <div className="field-value field-value_rowsize_lg time-popup__info">
                            <div className="field-value__row">
                                <div className="field-value__field text text_size_smd text_color_gray">Общее время:</div>
                                <div className="field-value__value text text_size_smd text_color_white text_weight_medium">{hoursAll} {hoursAllText}</div>
                            </div>
                            <div className="field-value__row">
                                <div className="field-value__field text text_size_smd text_color_gray">Максимальное время</div>
                                <div className="field-value__value text text_size_smd text_color_white text_weight_medium">{max} часов</div>
                            </div>
                            <div className="field-value__row">
                                <div className="field-value__field text text_size_smd text_color_gray">1 час равен:</div>
                                <div className="field-value__value text text_size_smd text_color_white text_weight_medium">{hkm} км</div>
                            </div>
                        </div>
                        <div
                            className="btn btn_style_border btn_icon_extend btn_size_md btn_fluent time-popup__extend-btn"
                            onClick={onExtendClick}
                        >
                            <div className="btn__label">
                                <div className="icon icon_style_extend icon_inline btn__icon"></div>
                                <div className="btn__text">Продлить поездку</div>
                            </div>
                        </div>
                        <div
                            className="btn btn_style_filled btn_size_md btn_bg_white01 btn_color_white btn_fluent"
                            onClick={onCancelClick}
                        >
                            <div className="btn__label">
                                <div className="btn__text">Отмена</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

const PopupSuccess = (props) => {

    const {
        successPopup,
        count,
        countText,
        hkmValue,
        onOkeyClick
    } = props;

    if(!successPopup) return false;

    return (
        <Popup>
            <PopupContent>
                <div className="popup-time-ok text_align_center text_color_white">
                    <div className="popup-time-ok__title text text_size_normal">Поездка продлена на:</div>
                    <div className="popup-time-ok__time text text_size_lg">{count} {countText} <span className="text_color_gray">/ {hkmValue} км</span>
                    </div>
                </div>
            </PopupContent>
            <PopupButtons>
                <PopupButton color="white" onClick={onOkeyClick}>OK</PopupButton>
            </PopupButtons>
        </Popup>
    );
};

const mapStateToProps = (state) => {
    const {order, tarifs, extend} = state;
    return {
        order,
        tarifs,
        extend
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        updateOrder,
        updateExtend,
        changeExtendCount,
        loadTarifs: loadTarifs(clientService),
        extendOrderRequest: extendOrderRequest(clientService)
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(PopupExtendContainer);