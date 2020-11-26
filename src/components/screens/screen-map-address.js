import React, {Component} from 'react';
import ScreenInner from './screen-inner';
import { Map, withYMaps } from 'react-yandex-maps';
import {connect} from 'react-redux';
import {bindActionCreators, compose} from 'redux';
import {
    showPreloader,
    hidePreloader,
    updateCoords,
    setScreen,
    updateOrder,
    updatePanel,
    showNotify,
    getLastOrder,
    getAppVersion
} from '../../actions';
import withClientService from '../hoc/with-client-service';
import withGeolocationService from '../hoc/with-geolocation-service';
import objectify from 'geoposition-to-object';
import MapHeader from '../map-header';

import convertDate from '../../utils/conver-date';
import BottomPanelDate from '../bottom-panel-date';
import DatePopup, {validateDate, checkValidDate} from '../date-popup';
import PopupRate from '../popup-rate';
import YMapsCrossControl from '../../utils/ymaps-cross-control';
import MapErrorBoundry from '../map-error-boundry';
import {centerOfMoskow, maxDistance, minOrderHoursSelected} from '../../settings';
import Swipe from 'react-easy-swipe';
import moment from 'moment-with-locales-es6';
import {get} from 'lodash';

import "./map-screen-address.css";

class ScreenMapAddress extends Component {

    state = {
        TID: null,
        popup: false,
        rate_popup: false,
        dateError: '',
        date: '',
        defaultDate: {
            utc: '',
            mon: '',
            dayofweek: '',
            time: ''
        }
    };

    constructor(props) {
        super(props);
        this.state.date = props.order.date.utc; // фикс бага с пустой датой
    }

    /**
     * Геокодирование через Яндекс
     * @param coords
     */
    ymapsGeocode = (coords) => {
        if(this.props.ymaps === undefined) {
            const TID = setTimeout(() => {
                this.ymapsGeocode(coords);
            }, 50);
            this.setState({TID});
        } else {
            clearTimeout(this.state.TID);

            this.props.ymaps.geocode(coords)
                .then((data) => {
                    const obj = data.geoObjects.get(0);
                    const props = obj.properties.getAll();
                    const {name} = props;

                    this.props.updateCoords({address: name});
                });
        }
    };

    /**
     * Форматирование адреса полученого из API карт Google
     * @param formatted_address
     * @returns {String}
     */
    joinGoogleAddress = (formatted_address) => {
        let address = formatted_address.split(', Россия');
        return address[0];
    };

    /**
     * Проверка активност кнопки "Далее"
     * @param _date
     * @returns {boolean}
     */
    checkBtnNextDisabled = () => {
        let {
            coords: { address }
        } = this.props;

        const isDistance = !this.checkMaxDistance(this.props.coords.placemark);
        const isDate = this.props.order.date.utc;

        return address === '' || isDistance || isDate === '' ? true : false;
    };

    /**
     * Преобразование координат в адрес
     * Используется при оределении текущего положиния
     * и при изменении маркера на карте
     * @param coords
     */
    geocodeCoords = (coords) => {
        this.props.clientService.googleGeocodeCoords(coords)
            .then((data) => {

                if(data.statusCode === 200) {
                    const address = this.joinGoogleAddress(data.results[0].formatted_address);

                    this.props.updateCoords({address});
                    this.props.updateOrder({btnNextDisabled: this.checkBtnNextDisabled()});
                }
            });
    };

    /**
     * Событие срабатывает при нахождении текущего положения
     * с помощью навигатора
     */
    onFindGeolocation = (params={}) => {
        this.props.showPreloader();
        this.props.geolocationService.getCurrentPosition()
            .then((position) => {
                const {latitude, longitude} = objectify(position).coords;
                const center = [latitude, longitude];
                this.props.updateCoords({center, placemark: center});
                this.props.hidePreloader();
                this.geocodeCoords(center);
            })
            .catch((error) => {
                console.error(new Error(error));
                this.props.hidePreloader();

                const {errorCallback = ()=>{}} = params;
                errorCallback();
            });
    };

    /**
     * Событие при завершении перетаскивания маркера на карте
     * @param e
     */
    onDragEnd = (e) => {
        const placemark = e.originalEvent.target.geometry.getCoordinates();
        this.props.updateCoords({placemark});

        this.geocodeCoords(placemark);
    };

    /**
     * Событие при изменении центар карта или масштаба
     * @param e
     */
    onMapChange = (e) => {
        const map = e.originalEvent.map;
        const center = map.getCenter();

        this.props.updateCoords({
            center,
            zoom: map.getZoom()
        });
    };

    findPlacemark = () => {
        return document.querySelector('.screen-map-address__placemark');
    };

    findDot = () => {
        return document.querySelector('.screen-map-address__placemark-dot');
    };

    onMapActionBegin = () => {
        if(this.placemarkInited) {
            this.findPlacemark().className = 'screen-map-address__placemark screen-map-address__placemark_drag';
            this.findDot().className = 'screen-map-address__placemark-dot screen-map-address__placemark-dot_drag';
        }
    };

    checkMaxDistance = (placemark) => {
        let distance = 0;

        try {
            distance = this.props.ymaps.coordSystem.geo.getDistance(placemark, centerOfMoskow) / 1000;
        } catch(e) {
            return false;
        }

        this.props.updateCoords({distance});

        if(distance > maxDistance) {
            this.props.showNotify({message: 'Извините, в данной зоне THE DRIVER еще не работает. Выберите адрес в Москве или ближайшем подмосковье.'});
            return false;
        }

        return true;
    };

    onMapActionEnd = () => {
        if(this.placemarkInited) {
            this.findPlacemark().className = 'screen-map-address__placemark';
            this.findDot().className = 'screen-map-address__placemark-dot';
        }

        const placemark = this.map.getCenter();
        this.geocodeCoords(placemark);

        this.props.updateCoords({placemark});

        this.checkMaxDistance(placemark);
    };

    /**
     * Событие при клике Изменить в адресе
     */
    onEditAddress = () => {
        this.props.setScreen('sugg');
    };

    /**
     * Обновление даты в редьюсере
     */
    updateDate = (value) => {
        if(value !== '') {
            const date = convertDate(value);
            this.props.updateOrder({date, btnNextDisabled: this.checkBtnNextDisabled(date)});
        }
    };

    /**
     * Событие при изменени даты и запись её в стейт компонента
     * @param value
     */
    onDateChange = ({target : { value = '' }} = {}) => {
        if(checkValidDate(value)) {
            this.setState({date: value});
        }

        this.isDateError();
    };

    /**
     * При клике на иконку (i) справа от даты
     */
    onInfoClick = () => {
        this.props.updatePanel({opened: !this.props.panel.opened});
    };

    /**
     * При клике на кнопку "Далее"
     */
    onNextClick = () => {
        if(this.props.order.date.utc === '') {
            this.onDateEditClick();
            return false;
        }

        if(!this.checkBtnNextDisabled()) {
            if(this.state.date === '') {
                this.props.updateOrder({date: this.state.defaultDate});
            }
            this.props.setScreen('tarif');
        }
    };

    /**
     * При клике на кнопку "Изменить" рядом с датой
     */
    onDateEditClick = () => {
        this.setState({popup: true});
    };

    /**
     * Проверка даты на ошибку и запись в стейт
     * @returns {*}
     */
    isDateError = () => {
        const date = window.document.querySelector(`input[name='date-field']`).value;

        const dateError = validateDate(date);

        if(dateError) {
            this.setState({dateError});
        } else {
            this.setState({dateError: '', date});
            this.updateDate(date);
        }

        return dateError;
    }

    /**
     * При клике на кнопку "ОК" в попапе выбора даты
     */
    onPopupOkeyClick = () => {
        if(!this.isDateError()) {
            this.setState({popup: false});
        }
    };

    // Функци добавляе плейсмарк по центру карты
    initCrossControl = () => {
        if(this.placemarkInited === false) {
            clearTimeout(this.TID);
            this.TID = setTimeout(() => {
                try {
                    this.map.controls.add(new this.cross());
                    this.placemarkInited = true;
                } catch (e) {
                    this.initCrossControl();
                    console.log(e);
                }
            }, 100);
        }
    };

    onMapRef = (ref) => {
        this.map = ref;
        this.cross = new YMapsCrossControl(this.props.ymaps);

        window.ref = ref;
        window.cross = this.cross;

        this.initCrossControl();
    };

    dataField = null;

    onDateInputRendered = (ref) => {
        this.dataField = ref;
    };

    updateDefaultDate = () => {
        const defaultDate = convertDate(moment().add(minOrderHoursSelected, 'hours').format('YYYY-MM-DDTHH:mm:ss'));
        this.setState({defaultDate});
    };

    onBottomPanelClick = ({target}) => {
        if(!target.className.match(/date-of-come__info/gi)) {
            if(!target.className.match(/icon_style_nav/)) {
                if (this.props.order.date.utc === '') {
                    this.onDateEditClick();
                }
            }
        }
    };

    /**
     * При клике закрыть попап рейтинга
     */
    onReviewCloseClick = () => {
        this.setState({rate_popup: false});
    }

    /**
     * При клике на оставить отзыв
     */
    onReviewClick = () => {
        this.props.setScreen('rating');
    }

    /**
     * Событие срабатывает как только компонент отобразился на экране
     */
    componentDidMount() {
        this.props.getAppVersion({confirm: true});

        this.placemarkInited = false;

        if(this.props.coords.address === '') {
            const errorCallback = ()=> {
                this.geocodeCoords(this.props.coords.center); // в случае ошибки
            };

            this.onFindGeolocation({errorCallback});
        }

        this.props.updateOrder({btnNextDisabled: this.checkBtnNextDisabled()});

        this.IID = setInterval(() => {
            if(this.dataField) {
                clearInterval(this.IID);
                this.isDateError();
            }
        }, 10);

        /*this.updateDefaultDate();
        this.DEFDATE_IID = setInterval(() => {
            if(this.props.order.date.utc === '') {
                this.updateDefaultDate();
            } else {
                clearInterval(this.DEFDATE_IID);
            }
        }, 5000);*/

        const {last} = this.props.order;

        if(last === null) {
            this.props.getLastOrder().then((data) => {
                if (get(data, 'rating') === null) {
                    if(data.status === "end") {
                        this.setState({rate_popup: true});
                    }
                }
            });
        } else {
            if(last.rating === null) {
                if(last.status === "end") {
                    this.setState({rate_popup: true});
                }

                if(last.status === "end-wait") {
                    this.RT_TID = setTimeout(() => {
                        this.setState({rate_popup: true});
                    }, 5000);
                }
            }
        }
    }

    componentWillUnmount() {
        clearTimeout(this.TID);
        clearTimeout(this.RT_TID);
        clearInterval(this.IID);
        //clearInterval(this.DEFDATE_IID);
    }

    /**
     * Редринг компонента
     * @returns {ReactDOM}
     */
    render() {

        const {center, address, zoom} = this.props.coords;
        const {date, btnNextDisabled} = this.props.order;
        const {opened} = this.props.panel;

        const {popup, dateError, defaultDate, rate_popup} = this.state;
        const {mobile} = this.props.device;

        return (
            <ScreenInner>
                <div className="screen-map-address">
                    <div className="screen-map-address__gradient"/>
                    <MapHeader
                        address={address}
                        onEditAddress={this.onEditAddress}
                    />
                    <MapErrorBoundry>
                        <Map
                            className="ymaps screen-map-address__ymaps"
                            state={{center, zoom, controls: []}}
                            onBoundsChange={this.onMapChange}
                            onActionBegin={this.onMapActionBegin}
                            onActionEnd={this.onMapActionEnd}
                            instanceRef={this.onMapRef}
                        />
                    </MapErrorBoundry>
                    <BottomPanel
                        opened={opened}
                        date={date}
                        defaultDate={defaultDate}
                        btnDisabled={btnNextDisabled}
                        onFindGeolocation={this.onFindGeolocation}
                        onDateEditClick={this.onDateEditClick}
                        onDateChange={this.onDateChange}
                        onInfoClick={this.onInfoClick}
                        onNextClick={this.onNextClick}
                        onBottomPanelClick={this.onBottomPanelClick}
                    />
                </div>
                <DatePopup
                    date={this.state.date}
                    mobile={mobile}
                    show={popup}
                    dateError={dateError}
                    onDateChange={this.onDateChange}
                    onOkeyClick={this.onPopupOkeyClick}
                    onDateInputRendered={this.onDateInputRendered}
                />
                <PopupRate
                    show={false}
                    rate={this.props.rating.rate}
                    onReviewClick={this.onReviewClick}
                    onReviewClose={this.onReviewCloseClick}
                />
            </ScreenInner>
        );
    }
}

/**
 * Компоненты вывода кнопки изменения даты
 */
const DateEditBtn = ({margin = false, marginBottom = false, onDateEditClick=()=>{}}) => {
    const clsMarginBottom = marginBottom ? ' margin__15' : '';
    const clsMargin = margin ? ' bottom-panel__edit-time-btn' : '';
    return (
        <div className={`flex__grow${clsMarginBottom}${clsMargin}`}>
            <div
                className="btn btn_style_round-sm btn_bg_white03- btn btn_color_white btn_border_gold"
                onClick={onDateEditClick}
            >
                <div className="btn__label">
                    <div className="btn__text">
                        <div className="text text_size_sm">Установить время</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Компонент кнопки "Далее"
 */
const NextBtn = ({opened = false, disabled = false, onNextClick}) => {
    const openedCls = !opened ? ' screen-map-address__next':'';
    const disabledCls = disabled ? ' btn_disabled':'';

    return (
        <div
            className={`btn btn_style_border btn_size_md btn_width_fluent${openedCls}${disabledCls}`}
            onClick={onNextClick}
        >
            <div className="btn__label">
                <div className="btn__text">Далее</div>
            </div>
        </div>
    );
};

/**
 * Компонент для отображения нижней панели в закрытом состоянии
 */
const BottomPanelClosed = ({date, defaultDate, btnDisabled, onFindGeolocation, onDateEditClick, onDateChange, onInfoClick, onNextClick, onBottomPanelClick}) => {

    return (
        <Swipe
          className="bottom-panel bottom-panel_screen_address screen-map-address__panel"
          onSwipeUp={onInfoClick}
        >
            <div className="bottom-panel__panel" onClick={onBottomPanelClick}>
                <div
                    className="icon icon_style_nav screen-map-address__nav"
                    onClick={onFindGeolocation}
                />
                <div className="bottom-panel__wrap">
                    <div className="date-of-come">
                        <div className="date-of-come__title text text_size_sm text_color_gray">Дата и время подачи</div>
                        <div className="date-of-come__datetime text text_color_white text_size_normal">
                            {date.utc !== '' ? <BottomPanelDate onClick={onInfoClick} date={date}/> : <DateEditBtn onDateEditClick={onDateEditClick} marginBottom/>}
                            <div
                                className="icon icon_style_info date-of-come__info"
                                data-icon-info="y"
                                onClick={onInfoClick}
                            />
                        </div>
                    </div>
                    <NextBtn
                        opened={false}
                        disabled={btnDisabled}
                        onNextClick={onNextClick}
                    />
                </div>
            </div>
        </Swipe>
    );
};

/**
 * Компонент для отображения нижней панели в открытом состоянии
 */
const BottomPanelOpened = ({date, defaultDate, btnDisabled, onFindGeolocation, onDateEditClick, onInfoClick, onNextClick}) => {
    return (
        <Swipe
          className="bottom-panel bottom-panel_screen_waiting screen-map-address__panel"
          onSwipeDown={onInfoClick}
        >
            <div className="bottom-panel__panel">
                <div
                    className="icon icon_style_nav screen-map-address__nav"
                    onClick={onFindGeolocation}
                />
                <div className="bottom-panel__wrap">
                    <div className="date-of-come margin__10">
                        <div
                          className="date-of-come__title text text_size_sm text_color_gray"
                          onClick={onDateEditClick}
                        >Дата и время подачи</div>
                        <div className="date-of-come__datetime text text_color_white text_size_normal">
                            {date.utc !== '' ? <BottomPanelDate onClick={onDateEditClick} date={date}/> : <DateEditBtn onDateEditClick={onDateEditClick} marginBottom/> }
                            <div
                                className="icon icon_style_info date-of-come__info"
                                onClick={onInfoClick}
                            />
                        </div>
                    </div>
                    {date.utc !== '' ? <DateEditBtn onDateEditClick={onDateEditClick} margin/> : false}
                </div>
                <div className="bottom-panel__more bottom-panel__wrap">
                    <div className="text text_color_white text_size_xm bottom-panel__note">Вы увидите данные авто за час до начала поездки</div>
                    <NextBtn
                        opened={true}
                        disabled={btnDisabled}
                        onNextClick={onNextClick}
                    />
                </div>
            </div>
        </Swipe>
    );
};

/**
 * Компонент для отображения нижней панели
 */
const BottomPanel = (props) => {
    const {opened = false} = props;
    return opened ? <BottomPanelOpened {...props} /> : <BottomPanelClosed {...props} />;
};

/**
 * Передача данных из редьюсера в компонент
 */
const mapStateToProps = (state) => {
    const { coords, device, order, panel, rating } = state;
    return {
        coords,
        device,
        order,
        panel,
        rating
    }
};

/**
 * Передача action creator для компонента
 */
const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        setScreen,
        showPreloader,
        hidePreloader,
        updateCoords,
        updateOrder,
        updatePanel,
        showNotify,
        getLastOrder: getLastOrder(clientService),
        getAppVersion: getAppVersion(clientService)
    }, dispatch);
};

export default compose(
    withYMaps,
    withClientService(),
    withGeolocationService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenMapAddress);
