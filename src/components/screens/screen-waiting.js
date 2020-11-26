import React, {Component} from 'react';
import ScreenInner from './screen-inner';
import {Map, Placemark} from 'react-yandex-maps';
import {placemarkOptions} from '../../settings';
import {connect} from 'react-redux';
import {compose, bindActionCreators} from 'redux';
import withClientService from '../hoc/with-client-service';
import MapHeader from '../map-header';
import BottomPanelDate from '../bottom-panel-date';
import DatePopup, {validateDate, checkValidDate} from '../date-popup';
import {
    updatePanel,
    updateDatePopup,
    updateOrder,
    updateOrderRequest,
    cancelOrderRequest,
    loadActiveOrder
} from '../../actions';
import CancelConfirmPopup from '../cancel-confirm-popup';
import {updateOrderInterval} from '../../settings';

import Swipe from 'react-easy-swipe';

class ScreenWaiting extends Component {

    componentDidMount() {
        this.props.updateDatePopup({date: this.props.order.date.utc});
        this.updateID = setInterval(() => {
            this.props.loadActiveOrder({
                update: true,
                pay_error_time: this.props.order.pay_error_time,
                old_pay_status: this.props.order.pay_status
            });
        }, updateOrderInterval);
    }

    componentWillUnmount() {
        clearInterval(this.updateID);
    }

    onInfoClick = () => {
        this.props.updatePanel({opened: !this.props.panel.opened});
    };

    isDateError = (date) => {
        const error = validateDate(date);
        this.props.updateDatePopup({error});

        if(error !== null) {
            return true;
        }

        return false;
    }

    onDatePopupOkeyClick = () => {
        const date = window.document.querySelector(`input[name='date-field']`).value;
        if(date === '') return false;

        if(this.isDateError(date)) {
            return false;
        }

        this.props.updateOrderRequest(this.props.order, this.props.coords, date);
        this.props.updateDatePopup({date});
    };

    onDateChange = ({target: {value}}) => {
        if(checkValidDate(value)) {
            this.props.updateDatePopup({date: value});
        }

        this.isDateError(value);
    };

    onDateEditClick = () => {
        //this.props.updateDatePopup({opened: true});
        this.onInfoClick();
    };

    onDatePopupCancelClick = () => {
        this.props.updateDatePopup({opened: false, error: null});
    };

    onCancelClick = () => {
        this.props.updateOrder({cancelConfirm: true});
    };

    onCancelConfirmPopupClick = () => {
        this.props.updateOrder({cancelConfirm: false});
    };

    onConfirmCancelClick = () => {
        this.props.cancelOrderRequest();
    };

    render() {
        const {coords, order, panel, date_popup} = this.props;
        const {center, placemark, zoom, address} = coords;
        const {date, cancelConfirm} = order;

        const panelCls = panel.opened ? '' : ' bottom-panel_closed';

        const datePopupProps = {
            date: date_popup.date,
            dateError: date_popup.error ,
            show: date_popup.opened,
            onOkeyClick: this.onDatePopupOkeyClick,
            onCancelClick: this.onDatePopupCancelClick,
            onDateChange: this.onDateChange
        };

        const cancelPopupProps = {
            show: cancelConfirm,
            onCancelClick: this.onCancelConfirmPopupClick,
            onConfirmClick: this.onConfirmCancelClick
        };

        return (
            <ScreenInner>
                <div className="screen-map-address">
                    <div className="screen-map-address__gradient"></div>
                    <MapHeader address={address}/>
                    <Map
                        className="ymaps screen-map-address__ymaps"
                        state={{ center, zoom, controls: [] }}
                    >
                        <Placemark
                            geometry={placemark}
                            defaultOptions={placemarkOptions}
                        />
                    </Map>
                    <Swipe
                      className={`bottom-panel bottom-panel_screen_waiting screen-map-address__panel${panelCls}`}
                      onSwipeUp={this.onInfoClick}
                      onSwipeDown={this.onInfoClick}
                    >
                        <div className="bottom-panel__panel">
                            <div className="bottom-panel__wrap">
                                <div className="date-of-come">
                                    <div className="date-of-come__title text text_size_sm text_color_gray">Дата и время подачи</div>
                                    <div className="date-of-come__datetime text text_color_white text_size_normal margin__10">
                                        <BottomPanelDate
                                            date={date}
                                            onClick={this.onDateEditClick}
                                        />
                                        <div
                                            className="icon icon_style_info date-of-come__info"
                                            onClick={this.onInfoClick}
                                        />
                                    </div>
                                </div>
                                <div
                                    className="btn btn_style_round-sm btn_bg_white03 btn_color_white bottom-panel__edit-time-btn hidden"
                                    onClick={this.onDateEditClick}
                                >
                                    <div className="btn__label">
                                        <div className="btn__text">
                                            <div className="text text_size_sm">Установить время</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bottom-panel__more bottom-panel__wrap">
                                <div className="text text_color_white text_size_xm bottom-panel__note">Вы увидите данные авто за час до начала поездки</div>
                                <div
                                    className="btn btn_style_filled btn_icon_x btn_size_md btn_bg_white01 btn_color_white05 btn_fluent"
                                    onClick={this.onCancelClick}
                                >
                                    <div className="btn__label">
                                        <div className="icon icon_style_x icon_inline btn__icon"></div>
                                        <div className="btn__text"><span className="text_size_md">Отменить поездку</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Swipe>
                    <DatePopup {...datePopupProps}/>
                    <CancelConfirmPopup {...cancelPopupProps} />
                </div>
            </ScreenInner>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        coords: state.coords,
        order: state.order,
        panel: state.panel,
        date_popup: state.date_popup
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        updatePanel,
        updateDatePopup,
        updateOrder,
        updateOrderRequest: updateOrderRequest(clientService),
        cancelOrderRequest: cancelOrderRequest(clientService),
        loadActiveOrder: loadActiveOrder(clientService)
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenWaiting);
