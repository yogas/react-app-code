import React, {Component} from 'react';
import {compose, bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import TitleBack from '../title-back';
import {
    showMenuScreen,
    loadHistory,
    loadTarifs,
    showOrderDetail,
    showConfirmPopup,
    hideConfirmPopup,
    deleteHistory,
    loadPaycards
} from '../../actions';
import withClientService from '../hoc/with-client-service';
import formatHistoryItem from '../../utils/format-history-item';
import {Popup, PopupContent, PopupButtons, PopupButton} from '../popup';
import formatPaycard from '../../utils/formap-paycard';
import formatColor from '../../utils/format-color';

class ScreenHistoryDetailContainer extends Component {

    componentDidMount() {
        if(!this.props.paycards.loaded) {
            this.props.loadPaycards();
        }
    }

    onClickBack = () => {
        this.props.showMenuScreen('history');
    };

    onDelete = () => {
        this.props.showConfirmPopup();
    };

    onConfirmDelete = () => {
        this.props.deleteHistory(this.props.history.detailId);
    };

    onCancelDelete = () => {
        this.props.hideConfirmPopup();
    };

    render() {

        const {history, tarifs, paycards} = this.props;
        let item = history.items.find(({id}) => history.detailId===id);

        const screenHistoryDetailProps = {
            ...formatHistoryItem(item, tarifs),
            paycards,
            history,
            onDelete: this.onDelete,
            onConfirmDelete: this.onConfirmDelete,
            onCancelDelete: this.onCancelDelete
        };

        return (
            <div className="screen-history-detail screen">
                <div className="wrap">
                    <TitleBack title="История поездок" onClickBack={this.onClickBack} />
                </div>
                <ScreenHistoryDetail {...screenHistoryDetailProps} />
            </div>
        );
    }
}

const DriverInfo = ({driver_name, car, car_color_1, car_color_2}) => {

    if(car === null) {
        return false;
    }

    const color2 = formatColor(car_color_2);

    return (
        <React.Fragment>
            <div className="field-value__row">
                <div className="field-value__field text text_color_gray text_size_xs screen-history-detail__field-coll">Водитель:</div>
                <div className="field-value__value text text_color_white text_size_md">{driver_name}</div>
            </div>
            <div className="field-value__row">
                <div className="field-value__field text text_color_gray text_size_xs screen-history-detail__field-coll">Автомобиль:</div>
                <div className="field-value__value field-value__value_wrap text text_color_white text_size_md">
                    <div className="field-value__car-info car-info__number-wrap">
                        <div className="field-value__car">{car}</div>
                        <div className="field-value__color">
                            <div
                                className="car-info__color screen-history-detail__color"
                                style={{background: `linear-gradient(180deg, ${car_color_1} 0%, ${color2} 100%)`}}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
};

const StatusRow = () => {
    return (
        <div className="field-value__row">
            <div className="field-value__field text text_color_gray text_size_xs screen-history-detail__field-coll">
                Статус:
            </div>
            <div className="field-value__value text text_color_white text_size_md">Отменён</div>
        </div>
    )
};

const CancelInfo = ({status, prepay, prepayText}) => {

    switch(status) {
        case 'client.cancel.fine':
            return (
                <React.Fragment>
                    <StatusRow/>
                    <div className="field-value__row">
                        <div className="field-value__field text text_color_gray text_size_xs screen-history-detail__field-coll">Штраф:</div>
                        <div className="field-value__value text text_color_white text_size_md">{prepay} <span className="text_size_xs">{prepayText}</span></div>
                    </div>
                </React.Fragment>
            );

        case 'client.cancel':
            return <StatusRow />;

        default:
            return false;
    }
};

const RouteRow = ({title, address}) => {
    if(address === null || address === undefined || address === '') return false;

    return (
        <div className="field-value__row screen-history-detail__value-row">
            <div className="field-value__field text text_color_gray text_size_xs screen-history-detail__field-coll screen-history-detail__field-coll_center">
                <div className="icon icon_style_map-lg screen-history-detail__map-icon"></div>
                <div>{title}:&nbsp;</div>
            </div>
            <div className="field-value__value text text_color_white text_size_xs screen-history-detail__value-coll">{address}</div>
        </div>
    )
};

const OrderRoute = ({address, extend_address, end_address}) => {
    return (
        <div className="wrap wrap_double wrap_border screen-history-detail__route-wrap">
            <div className="text text_color_white text_size_xm text_weight_medium screen-history-detail__route-title">Маршрут</div>
            <div className="field-value screen-history-detail__route">
                <RouteRow title="Подача" address={address}/>
                {extend_address.map((item, idx) => {
                    return <RouteRow key={idx} title="В" address={item}/>
                })}
                <RouteRow title="Завершение" address={end_address}/>
            </div>
        </div>
    )
};

const AdditionServices = ({service_services}) => {
    if(!service_services.length) return false;

    return (
        <div className="wrap wrap_double wrap_border screen-history-detail__services-addition">
            <div className="text text_color_gray text_size_xm text_weight_medium screen-history-detail__title">Сервисные доп. услуги</div>
            <div className="field-value">
                {
                    service_services.map(({amount, name}, idx) => {
                        return (
                            <div key={idx} className="field-value__row">
                                <div className="field-value__field text text_color_gray text_size_xs screen-history-detail__field-coll">+{amount} р.</div>
                                <div className="field-value__value text text_color_white text_size_md">{name}</div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
};

const ScreenHistoryDetail = (props) => {
    const {
        address,
        hours,
        price,
        date,
        hours_text,
        tarif,
        rub_text,
        driver_name = '',
        car = '',
        car_color_1,
        car_color_2,
        prepay,
        prepayText,
        extend_address,
        end_address,
        paycards,
        paycard,
        status,
        history,
        service_services,
        onDelete,
        onConfirmDelete,
        onCancelDelete
    } = props;

    if(!paycards.loaded) {
        return false;
    }

    const card = paycards.items.find(({id}) => paycard===id);
    const {numberFormated, niceType} = formatPaycard(card);

    return (
        <React.Fragment>
            <div className="screen-history-detail__content">
                <div className="wrap wrap_double screen-history-detail__info-wrap">
                    <div className="text text_color_gray text_size_xm text_weight_medium screen-history-detail__title">Информация</div>
                    <div className="field-value">
                        <div className="field-value__row">
                            <div className="field-value__field text text_color_gray text_size_xs screen-history-detail__field-coll">Дата</div>
                            <div className="field-value__value text text_color_white text_size_md">{date}</div>
                        </div>
                        <div className="field-value__row">
                            <div className="field-value__field text text_color_gray text_size_xs screen-history-detail__field-coll">Время:</div>
                            <div className="field-value__value text text_color_white text_size_md">{hours} {hours_text}</div>
                        </div>
                        <div className="field-value__row">
                            <div className="field-value__field text text_color_gray text_size_xs screen-history-detail__field-coll">Тариф:</div>
                            <div className="field-value__value text text_color_white text_size_md">{tarif.name}</div>
                        </div>
                        <DriverInfo
                            driver_name={driver_name}
                            car={car}
                            car_color_1={car_color_1}
                            car_color_2={car_color_2}
                        />
                        <div className="field-value__row">
                            <div className="field-value__field text text_color_gray text_size_xs screen-history-detail__field-coll">Способ оплаты:</div>
                            <div className="field-value__value text text_color_white text_size_md">{niceType} {numberFormated}</div>
                        </div>
                        <div className="field-value__row">
                            <div className="field-value__field text text_color_gray text_size_xs screen-history-detail__field-coll">Стоимость:</div>
                            <div className="field-value__value text text_color_white text_size_md">{price} <span className="text_size_xs">{rub_text}</span>
                            </div>
                        </div>
                        <CancelInfo
                            status={status}
                            prepay={prepay}
                            prepayText={prepayText}
                        />
                    </div>
                </div>
                <AdditionServices service_services={service_services} />
                <OrderRoute
                    address={address}
                    extend_address={extend_address}
                    end_address={end_address}
                />
            </div>
            <div className="screen-history-detail__footer text text_size_md wrap">
                <div
                    className="btn btn_size_md btn_color_white btn_fluent"
                    onClick={onDelete}
                >
                    <div className="btn__label">
                        <div className="btn__text">Удалить поездку</div>
                    </div>
                </div>
            </div>
            <PopupContainer
                deleteConfirm={history.deleteConfirm}
                onOkeyClick={onConfirmDelete}
                onCancelClick={onCancelDelete}
            />
        </React.Fragment>
    )
};

const PopupConfirm = (props) => {
    const {
        onOkeyClick,
        onCancelClick
    } = props;

    return (
        <Popup>
            <PopupContent>
                <div className="text_align_center">
                    <div className={`icon icon_style_alert icon_inline`}></div>
                    <div className="text text_size_normal text_color_white">
                        Подтвердите удаление поездки
                    </div>
                </div>
            </PopupContent>
            <PopupButtons>
                <PopupButton color="gray" onClick={onOkeyClick}>OK</PopupButton>
                <PopupButton color="white" onClick={onCancelClick}>Отмена</PopupButton>
            </PopupButtons>
        </Popup>
    );
};

const PopupContainer = (props) => {
    if(!props.deleteConfirm) return false;

    return <PopupConfirm {...props} />;
};

const mapStateToProps = (state) => {
    return {
        history: state.history,
        loading: state.loading,
        tarifs: state.tarifs,
        paycards: state.paycards
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        showMenuScreen: showMenuScreen(),
        loadHistory: loadHistory(clientService),
        showOrderDetail: showOrderDetail(),
        loadTarifs: loadTarifs(clientService),
        showConfirmPopup,
        hideConfirmPopup,
        deleteHistory: deleteHistory(clientService),
        loadPaycards: loadPaycards(clientService)
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenHistoryDetailContainer);