import React, {Component} from 'react';
import ScreenInner from './screen-inner';
import {Map, withYMaps, Placemark} from 'react-yandex-maps';
import {_appUrl, placemarkOptions, placemarkCarOptions} from '../../settings';
import {connect} from 'react-redux';
import {compose, bindActionCreators} from 'redux';
import withClientService from '../hoc/with-client-service';
import withGeolocationService from '../hoc/with-geolocation-service'
import BottomPanelDate from '../bottom-panel-date';
import {
    updatePanel,
    updateDatePopup,
    updateOrder,
    updateOrderRequest,
    cancelOrderRequest,
    loadActiveOrder,
    getDriverCoords,
    sendClientCoords
} from '../../actions';
import CancelConfirmPopup from '../cancel-confirm-popup';

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
    swipeDown,
    swipeUp,
    onCancelClick,
    onCancelConfirmPopupClick,
    onConfirmCancelClick
} from '../../utils/order';

import getDiffTime from '../../utils/diff-time';
import formatColor from '../../utils/format-color';
import CarPlacemark from '../car-placemark';

import openWhatsApp from '../../utils/open-whats-app';

import Swipe from 'react-easy-swipe';

import "./screen-feed.css";

class ScreenFeed extends Component {

    state = {
        deg: 30,
        car: null,
        arriveIn: '',
        waitingTime: '',
        drag: false,
        map_state: {
            center: [0, 0],
            zoom: 14,
            controls: []
        }
    };

    driverPlacemark = undefined;
    clientPlacemark = undefined;
    pointCollection = undefined;
    map = undefined;
    mapCenter = undefined;
    mapZoom = undefined;

    initCarPlacemark = initCarPlacemark(this);
    setCarRotation = setCarRotation(this);

    togglePanel = togglePanel(this);
    swipeUp = swipeUp(this);
    swipeDown = swipeDown(this);
    togglePanel = togglePanel(this);
    onCancelClick = onCancelClick(this);
    onCancelConfirmPopupClick = onCancelConfirmPopupClick(this);
    onConfirmCancelClick = onConfirmCancelClick(this);

    onPhoneClick = (phone) => () => {
        window.open(`tel:${phone}`, '_system');
    };

    initArriveIn = () => {
        const {date, delay_time} = this.props.order;

        const {hformat, hText, m, mText, minutes} = getDiffTime(date.utc, delay_time);

        let arriveIn = `${hformat} ${hText} ${m} ${mText}`;

        if(minutes>=0) {
            if (!hformat) {
                arriveIn = `${m} ${mText}`;
            }
        } else {
            arriveIn = '0 минут';
        }

        this.setState({arriveIn});
    };

    initWaiting = () => {
        const {driver_arrived_datetime} = this.props.order;
        if(driver_arrived_datetime) {
            const utc = formatDate(driver_arrived_datetime, 'utc');
            const {mText, minutes} = getDiffTime(utc);

            const waitingTime = `${-minutes} ${mText}`;
            this.setState({waitingTime});
        }
    };

    /**
     * Калбек при получении координат водителя
     */
    onDriverCoords = (driver_coords) => {
        const {latitude, longitude} = driver_coords;
        const driverPoint = [latitude, longitude];
        const clientPoint = this.props.coords.center;

        if(!latitude || !longitude) { return false }

        if(this.driverPlacemark === undefined) {
            this.driverPlacemark = new this.props.ymaps.Placemark(driverPoint);
            this.clientPlacemark = new this.props.ymaps.Placemark(clientPoint);
            this.pointCollection = new this.props.ymaps.GeoObjectCollection();

            this.pointCollection.add(this.driverPlacemark);
            this.pointCollection.add(this.clientPlacemark);
        }

        this.driverPlacemark.geometry.setCoordinates(driverPoint);
        this.map.geoObjects.add(this.pointCollection);
        this.map.setBounds(this.pointCollection.getBounds());
        this.mapZoom = this.map.getZoom();
        this.mapCenter = this.map.getCenter();
        this.map.geoObjects.remove(this.pointCollection);

        return true;
    };

    onMapClick = () => {
        if(!this.state.drag) {
            this.setState({
                drag: true,
                map_state: {
                    ...this.state.map,
                    center: this.map.getCenter(),
                    zoom: this.map.getZoom(),
                }
            });
        }
    }

    onFindGeopositionClick = () => {
        if(this.state.drag) {
            this.setState({drag: false});
            this.onDriverCoords(this.props.order.driver_coords);
        }
    }

    mapInited = false;

    getMapInstance = (ref) => {
        if(ref) {
            if(!this.mapInited) {
                this.map = ref;
                this.onDriverCoords(this.props.order.driver_coords);
                this.mapInited = true;
            }
        }
    }

    componentDidMount() {
        this.initCarPlacemark();
        this.initArriveIn();
        this.initWaiting();
        this.arriveID = setInterval(this.initArriveIn, 1000);
        this.waitingID = setInterval(this.initWaiting, 1000);
        this.updateID = setInterval(() => {
            this.props.loadActiveOrder({
                update: true,
                pay_error_time: this.props.order.pay_error_time,
                old_pay_status: this.props.order.pay_status
            });
        }, updateOrderInterval);

        this.driverCoordsID = setInterval(() => {
            this.props.getDriverCoords(this.props.order.driver_id, (driver_coords) => {
                if(!this.state.drag) {
                    this.onDriverCoords(driver_coords);
                }
            });
        }, updateDriverCoordInterval);

        this.props.sendClientCoords();
        this.clientCoordsID = setInterval(() => {
            this.props.sendClientCoords();
        }, sendCoordsInterval);
    }

    componentWillUnmount() {
        clearInterval(this.arriveID);
        clearInterval(this.waitingID);
        clearInterval(this.updateID);

        clearInterval(this.driverCoordsID);
        clearInterval(this.driverClientID);
    }

    render() {
        const {center, placemark, zoom} = this.props.coords;

        const {
            status,
            date,
            cancelConfirm,
            car,
            car_number,
            car_color_1,
            car_color_2,
            driver_name,
            driver_photo,
            driver_phone,
            driver_coords,
            tarif_type
        } = this.props.order;

        const panelCls = this.props.panel.opened ? '' : ' bottom-panel_closed';

        const cancelPopupProps = {
            show: cancelConfirm,
            onCancelClick: this.onCancelConfirmPopupClick,
            onConfirmClick: this.onConfirmCancelClick
        };

        let {latitude, longitude} = driver_coords;
        let mapZoom = zoom;

        if(latitude === null || longitude === null) {
            [latitude, longitude] = center;
        } else {
            if(this.mapCenter !== undefined) {
                [latitude, longitude] = this.mapCenter;
                mapZoom = this.mapZoom;
            }

            this.setCarRotation(this.props.order.driver_coords.heading);
        }

        let map_state = {
            center: [latitude, longitude],
            zoom: mapZoom,
            controls: []
        };

        // Фикс, если координаты водителя не получены, то показывать только плейсмарк
        if(!map_state.center[0] || !map_state.center[1]) {
            map_state.center = center;
            map_state.zoom = zoom;
        }

        if(this.state.drag) {
            map_state = this.state.map_state;
        }

        return (
            <ScreenInner>
                <div className="screen-map-address">
                    <div className="screen-map-address__gradient hidden"/>
                    <div className="screen-map-address__header"/>
                    <Map
                        className="ymaps screen-map-address__ymaps"
                        state={map_state}
                        instanceRef={this.getMapInstance}
                        onMouseDown={this.onMapClick}
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
                        className={`bottom-panel bottom-panel_screen_feed screen-map-address__panel${panelCls}`}
                        onSwipeUp={this.swipeUp}
                        onSwipeDown={this.swipeDown}
                    >
                        <div className="bottom-panel__panel">
                            <div
                                className="icon icon_style_nav screen-map-address__nav"
                                onClick={this.onFindGeopositionClick}
                            />
                            <div className="bottom-panel__phone">
                                <div
                                    className="icon icon_style_phone"
                                    onClick={this.onPhoneClick(driver_phone)}
                                />
                                <div
                                    className="icon icon_style_wats"
                                    onClick={() => openWhatsApp({phone: driver_phone})}
                                />
                            </div>
                            <div className="bottom-panel__call-text text text_size_md text_align_center">Связь с водителем</div>
                            <div
                                className="bottom-panel__wrap bottom-panel__car-info-wrap"
                                onClick={this.togglePanel}
                            >
                                <div className="bottom-panel__title text text_size_sm text_color_gray">Информация</div>
                                <Info status={status} arriveIn={this.state.arriveIn} />
                                <CarInfo
                                    car={car}
                                    car_number={car_number}
                                    car_color_1={car_color_1}
                                    car_color_2={car_color_2}
                                    driver_name={driver_name}
                                    driver_photo={driver_photo}
                                    tarif_type={tarif_type}
                                />
                                <WaitingTime status={status} waitingTime={this.state.waitingTime} />
                            </div>
                            <div className="bottom-panel__more bottom-panel__wrap">
                                <div className="date-of-come bottom-panel__feed-date">
                                    <div className="date-of-come__title text text_size_sm text_color_gray">Дата и время подачи</div>
                                    <div className="date-of-come__datetime text text_color_white text_size_normal">
                                        <BottomPanelDate date={date} />
                                    </div>
                                </div>
                                <div
                                    className="btn btn_style_filled btn_icon_x btn_size_md btn_bg_white01 btn_color_white05 btn_fluent"
                                    onClick={this.onCancelClick}
                                >
                                    <div className="btn__label">
                                        <div className="icon icon_style_x icon_inline btn__icon"/>
                                        <div className="btn__text"><span className="text_size_md">Отменить поездку</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bottom-panel__gradient"/>
                    </Swipe>
                    <CancelConfirmPopup {...cancelPopupProps} />
                </div>
            </ScreenInner>
        );
    }
}

const Info = ({status, arriveIn}) => {

    let str = `Через ${arriveIn} к вам приедет`;

    if(status === 'car.arrived') {
        str = `Вас ожидает`;
    }

    return (
        <div className="bottom-panel__arrive-time text text_size_smd text_color_white">{str}</div>
    );
};

const WaitingTime = ({status, waitingTime}) => {
    if(status !== 'car.arrived') return false;

    return (
        <div className="bottom-panel__waiting-time text text_color_white text_size_smdd">
            <span className="text_color_gray">
                Время ожидания:</span> <span className="text_weight_medium">{waitingTime}</span>
        </div>
    )
};

const CarInfo = (props) => {
    const {
        car,
        car_number,
        car_color_1,
        car_color_2,
        driver_photo = '',
        driver_name = '',
        tarif_type = ''
    } = props;

    const photo = driver_photo === '' || driver_photo === null ? `${_appUrl}/img/driver.png` : driver_photo;
    const color = formatColor(car_color_2);

    const hideCarInfo = tarif_type === 'driver' ? ' hidden':'';

    return (
        <div className="car-info bottom-panel__car-info">
            <div className="car-info__car">
                <div className={`car-info__model text text_size_normal text_color_white${hideCarInfo}`}>{car}</div>
                <div className="car-info__number-wrap text text_size_normal text_color_white text_weight_bold">
                    <div className="car-info__number">{tarif_type === 'driver' ? driver_name : car_number}</div>
                    <div className={`car-info__color${hideCarInfo}`} style={{background: `linear-gradient(180deg, ${car_color_1} 0%, ${color} 100%)`, boxShadow: '0px 0px 1px 1px rgba(255, 255, 255, 0.3)'}}/>
                </div>
                <div><span className={`text_color_gray text_size_xs${hideCarInfo}`}>Водитель:</span> <span className={`text_color_white text_size_xs${hideCarInfo}`}>{driver_name}</span></div>
            </div>
            <div className="car-info__driver">
                <div
                  className="car-info__driver-image"
                  style={{backgroundImage: `url(${photo})`}}
                />
            </div>
        </div>
    )
};

const mapStateToProps = (state) => {
    return {
        coords: state.coords,
        order: state.order,
        panel: state.panel,
        date_popup: state.date_popup
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService, geolocationService} = ownProps;
    return bindActionCreators({
        updatePanel,
        updateDatePopup,
        updateOrder,
        updateOrderRequest: updateOrderRequest(clientService),
        cancelOrderRequest: cancelOrderRequest(clientService),
        loadActiveOrder: loadActiveOrder(clientService),
        getDriverCoords: getDriverCoords(clientService),
        sendClientCoords: sendClientCoords(clientService, geolocationService)
    }, dispatch);
};

export default compose(
    withYMaps,
    withClientService(),
    withGeolocationService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenFeed);
