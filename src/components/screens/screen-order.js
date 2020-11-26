import React, {Component} from 'react';
import ScreenInner from './screen-inner';
import {Map, Placemark} from 'react-yandex-maps';
import {get} from 'lodash';
import {placemarkOptions, placemarkCarOptions, updateOrderTimeInterval} from '../../settings';
import {connect} from 'react-redux';
import {compose, bindActionCreators} from 'redux';
import withClientService from '../hoc/with-client-service';
import withGeolocationService from '../hoc/with-geolocation-service'
import {
    updatePanel,
    updateDatePopup,
    updateOrder,
    updateOrderRequest,
    cancelOrderRequest,
    loadActiveOrder,
    updateExtend,
    stopOrderRequest,
    setScreen,
    getDriverCoords,
    sendClientCoords
} from '../../actions';
import CancelConfirmPopup from '../cancel-confirm-popup';
import moment from 'moment-with-locales-es6';
import formatDate from '../../utils/format-date';
import {
    updateOrderInterval,
    updateDriverCoordInterval,
    sendCoordsInterval
} from '../../settings';
import {
    initCarPlacemark,
    setCarRotation,
} from '../../utils/car-placemark';
import {
    togglePanel,
    swipeUp,
    swipeDown,
    onCancelClick,
    onCancelConfirmPopupClick,
    onConfirmCancelClick
} from '../../utils/order';
import getDiffTime from '../../utils/diff-time';
import PopupExtend from '../popup-extend';
import {Popup, PopupContent, PopupButtons, PopupButton} from '../popup';
import CarPlacemark from '../car-placemark';

import Swipe from 'react-easy-swipe';
import openWhatsApp from "../../utils/open-whats-app"
import PopupRate from '../popup-rate';

class ScreenOrder extends Component {

    state = {
        car: null,
        time: null,
        minutes: null,
        hh: null,
        hm: null,
        htime: null
    };

    initCarPlacemark = initCarPlacemark(this);
    setCarRotation = setCarRotation(this);

    togglePanel = togglePanel(this);
    swipeUp = swipeUp(this);
    swipeDown = swipeDown(this);
    onStopClick = onCancelClick(this);
    onCancelConfirmPopupClick = onCancelConfirmPopupClick(this);
    onConfirmCancelClick = onConfirmCancelClick(this);

    swipeUp = () => {
        this.props.updatePanel({opened: true});
    }

    swipeDown = () => {
        this.props.updatePanel({opened: false});
    }

    initTime = () => {
        const startDate = formatDate(this.props.order.datetime, 'utc');
        const delay_time = get(this.props.order, 'delay_time', 0)/60;
        const endDate = moment(startDate).add(this.props.order.duration + delay_time, 'h').format('YYYY-MM-DDTHH:mm:00');

        let {hformat, m, minutes, hText, s} = getDiffTime(endDate, 0);
        hformat = hformat < 10 ? '0'+hformat : hformat;
        m = m < 10 ? '0'+m : m;
        if(minutes<=0) {
            hformat = '00';
            m = '00';

            if(!this.props.extend.popup && !this.props.order.rate_popup) {
                console.log(this.props.order.rate_popup);
                this.props.updateOrder({time_finished_popup: true});
            }
        } else {
            if(this.props.order.time_finished_popup) {
                this.props.updateOrder({time_finished_popup: false});
            }
        }

        this.props.updateOrder({left_time: minutes});

        const time = `${hformat}:${m}`;
        const headerTime = moment(endDate).format('hh:mm').split(':');
        const hn = Number(hformat);
        const end = ['через', hn, hText, m, 'мин', s, 'сек'];

        this.setState({
            time,
            minutes,
            hh: headerTime[0],
            hm: headerTime[1],
            htime: end.join(' ')
        });
    };

    getStartDatetime = () => {
        const datetime = formatDate(this.props.order.start_datetime, 'utc');
        const time = moment(datetime).format('HH:mm');
        const date = moment(datetime).format('DD.MM.YYYY');

        return {date, time};
    };

    onExtendClick = () => {
        this.props.updateOrder({panel: false, time_finished_popup: false});
        this.props.updateExtend({popup: true});
    };

    onEndClick = () => {
        this.props.stopOrderRequest(() => {
            this.clearIntervals();
        });
    };

    onReviewClick = () => {
        if(this.props.rating.rate) {
            this.props.setScreen('rating');
            this.props.updateOrder({rate_popup: false});
        }
    };

    onReviewClose = () => {
        const date = {
            utc: '',
            mon: '',
            dayofweek: '',
            time: ''
        };

        this.props.updateOrder({rate_popup: false, date});
        this.props.setScreen('map-address');

        // Если не было голосования, то закрыть попап и закрыть его позже
        if(this.props.order.last.rating === null) {
            this.props.updateOrder({
                last: { ...this.props.order.last, status: 'end-wait' }
            });
        }
    }

    onPhoneClick = (phone) => () => {
        window.open(`tel:${phone}`, '_system');
    };

    clearIntervals = () => {
        clearInterval(this.updateID);
        clearInterval(this.timeID);
    };

    componentDidMount() {
        this.initCarPlacemark();
        this.initTime();
        this.timeID = setInterval(this.initTime, updateOrderTimeInterval);
        this.updateID = setInterval(() => {
            this.props.loadActiveOrder({
                update: true,
                pay_error_time: this.props.order.pay_error_time,
                old_pay_status: this.props.order.pay_status
            });
        }, updateOrderInterval);

        this.driverCoordsID = setInterval(() => {
            this.props.getDriverCoords(this.props.order.driver_id);
        }, updateDriverCoordInterval);

        this.props.sendClientCoords();
        this.clientCoordsID = setInterval(() => {
            this.props.sendClientCoords();
        }, sendCoordsInterval);
    }

    componentWillUnmount() {
        this.clearIntervals();
        clearInterval(this.driverCoordsID);
        clearInterval(this.clientCoordsID);
    }

    render() {

        const {center, placemark, zoom} = this.props.coords;
        const {
            cancelConfirm,
            driver_name,
            driver_coords,
            duration,
            panel,
            time_finished_popup,
            rate_popup
        } = this.props.order;

        const {driver_phone} = this.props.order;

        const {opened} = this.props.panel;

        const {date, time} = this.getStartDatetime();

        let panelCls = opened ? '' : ' bottom-panel_closed';
        if(!panel || time_finished_popup) panelCls += ' hidden';

        const cancelPopupProps = {
            show: cancelConfirm,
            status: this.props.order.status,
            onCancelClick: this.onCancelConfirmPopupClick,
            onConfirmClick: this.onConfirmCancelClick
        };

        let {latitude, longitude} = driver_coords;

        if(latitude === null) {
            [latitude, longitude] = center;
        } else {
            this.setCarRotation(this.props.order.driver_coords.heading);
        }

        return (
            <ScreenInner>
                <div className="screen-map-address">
                    <div className="screen-map-address__gradient"/>
                    <div className="screen-map-address__header">
                        <React.Fragment>
                            <div className="screen-map-address__pending-title text text_size_md text_weight_medium">Окончание поездки в</div>
                            <div className="screen-map-address__countdown text_color_green text_weight_bold">{this.state.hh}:{this.state.hm}</div>
                            <div className="text_color_black text_size_sm">{this.state.htime}</div>
                        </React.Fragment>
                    </div>
                    <Map
                        className="ymaps screen-map-address__ymaps"
                        state={{ center: [latitude, longitude], zoom, controls: [] }}
                    >
                        <Placemark
                            geometry={placemark}
                            defaultOptions={placemarkOptions}
                        />
                        <CarPlacemark
                            driver_coords={driver_coords}
                            placemarkCarOptions={placemarkCarOptions}
                        />
                    </Map>
                    <Swipe
                        className={`bottom-panel bottom-panel_screen_order-info screen-map-address__panel${panelCls}`}
                        onSwipeUp={this.swipeUp}
                        onSwipeDown={this.swipeDown}
                    >
                        <div className="bottom-panel__panel">
                            <div className="bottom-panel__phone">
                                <div className="icon icon_style_phone"
                                    onClick={this.onPhoneClick(driver_phone)}
                                />
                                <div
                                    className="icon icon_style_wats"
                                    onClick={() => openWhatsApp({phone: driver_phone})}
                                />
                            </div>
                            <div className="bottom-panel__call-text text text_size_md text_align_center">Связь с водителем</div>
                            <div className="bottom-panel__wrap">
                                <div
                                    className="bottom-panel__title text text_size_sm text_color_gray"
                                    onClick={this.togglePanel}
                                >Информация</div>
                                <div className="field-value bottom-panel__time-to-end">
                                    <div className="field-value__row" onClick={this.togglePanel} >
                                        <div className="field-value__field text text_size_smd text_color_white">До конца поездки осталось:</div>
                                        <div className="field-value__value text text_size_smd text_color_white text_weight_medium">{this.state.time}</div>
                                    </div>
                                    <ButtonExtend
                                        panelOpened={opened}
                                        minutes={this.state.minutes}
                                        onClick={this.onExtendClick}
                                    />
                                </div>
                                <div className="bottom-panel__hiddable">
                                    <div
                                        className="field-value field-value_rowsize_lg bottom-panel__order-info-wrap"
                                        onClick={this.togglePanel}
                                    >
                                        <div className="field-value__row hidden">
                                            <div className="field-value__field text text_size_smd text_color_white">Проехали:</div>
                                            <div className="field-value__value text text_size_smd text_color_white text_weight_medium">0 <span className="text_color_gray">/{duration*25}км</span>
                                            </div>
                                        </div>
                                        <div className="field-value__row">
                                            <div className="field-value__field text text_size_smd text_color_white">Начало поездки:</div>
                                            <div className="field-value__value text text_size_smd text_color_white text_weight_medium">{time} <span className="text_color_gray">/ {date}</span>
                                            </div>
                                        </div>
                                        <div className="field-value__row">
                                            <div className="field-value__field text text_size_smd text_color_white">Водитель:</div>
                                            <div className="field-value__value text text_size_smd text_color_white text_weight_medium">{driver_name}</div>
                                        </div>
                                    </div>
                                    <div
                                        className="btn btn_style_border btn_icon_extend btn_size_md btn_fluent bottom-panel__extend-btn"
                                        onClick={this.onExtendClick}
                                    >
                                        <div className="btn__label">
                                            <div className="icon icon_style_extend icon_inline btn__icon"/>
                                            <div className="btn__text">Продлить поездку</div>
                                        </div>
                                    </div>
                                    <div
                                        className="btn btn_style_filled btn_icon_x btn_iconfix_x btn_size_md btn_bg_white01 btn_color_white05 btn_fluent bottom-panel__finish-btn"
                                    >
                                        <div className="btn__label">
                                            <div className="icon icon_style_x icon_inline btn__icon"></div>
                                            <div className="btn__text" onClick={this.onStopClick}><span className="text_size_md">Завершить поездку</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bottom-panel__gradient"></div>
                    </Swipe>
                    <CancelConfirmPopup {...cancelPopupProps} />
                    <PopupExtendContainer popupExtend={this.props.extend.popup} />
                    <PopupTimeFinished
                        show={time_finished_popup}
                        onExtendClick={this.onExtendClick}
                        onEndClick={this.onEndClick}
                    />
                    <PopupRate
                        show={rate_popup}
                        rate={this.props.rating.rate}
                        onReviewClick={this.onReviewClick}
                        onReviewClose={this.onReviewClose}
                    />
                </div>
            </ScreenInner>
        );
    }
}

const PopupExtendContainer = ({popupExtend}) => {
    if(!popupExtend) return false;

    return <PopupExtend/>;
};

const ButtonExtend = ({panelOpened, minutes, onClick}) => {
    if(panelOpened || minutes > 45) return false;

    return (
        <div
            className="btn btn_style_border btn_icon_extend btn_size_md btn_fluent bottom-panel__extend-btn"
            onClick={onClick}
        >
            <div className="btn__label">
                <div className="icon icon_style_extend icon_inline btn__icon"></div>
                <div className="btn__text">Продлить поездку</div>
            </div>
        </div>
    )
};

const PopupTimeFinished = ({show, onExtendClick, onEndClick}) => {
    if(!show) return false;

    return (
        <Popup>
            <PopupContent>
                <div className="popup-finish">
                    <div className="text text_size_normal text_color_white text_align_center popup-finish__text">Время поездки закончилось.</div>
                </div>
            </PopupContent>
            <PopupButtons>
                <PopupButton color="gold" onClick={onExtendClick}>Продлить</PopupButton>
                <PopupButton color="white" onClick={onEndClick}>Завершить</PopupButton>
            </PopupButtons>
        </Popup>
    );
};

const mapStateToProps = (state) => {
    return {
        coords: state.coords,
        order: state.order,
        panel: state.panel,
        date_popup: state.date_popup,
        extend: state.extend,
        rating: state.rating
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService, geolocationService} = ownProps;
    return bindActionCreators({
        updatePanel,
        updateDatePopup,
        updateOrder,
        updateExtend,
        setScreen,
        updateOrderRequest: updateOrderRequest(clientService),
        cancelOrderRequest: cancelOrderRequest(clientService),
        loadActiveOrder: loadActiveOrder(clientService),
        stopOrderRequest: stopOrderRequest(clientService),
        getDriverCoords: getDriverCoords(clientService),
        sendClientCoords: sendClientCoords(clientService, geolocationService)
    }, dispatch);
};

export default compose(
    withClientService(),
    withGeolocationService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenOrder);
