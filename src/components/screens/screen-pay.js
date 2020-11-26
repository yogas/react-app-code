import React, {Component} from 'react';
import ScreenInner from './screen-inner';
import {connect} from 'react-redux';
import {compose, bindActionCreators} from 'redux';
import {
    showPreloader,
    hidePreloader,
    setScreen,
    updateNewCard,
    updatePaycards,
    createOrder,
    loadPaycards,
    clearNewCard,
    showNotify
} from '../../actions';
import openSberbankPopup from '../../utils/open-sberbank-popup';
import TitleBack from '../title-back';
import withClientService from '../hoc/with-client-service';
import numeralize from 'numeralize-rus-ukr';
import {PopupCardContainer} from '../popup-card-container';
import PayCards from '../pay-cards';
import FormCard from '../form-card';
import Button from '../button';
import {showCardForm} from '../../settings';
import ym from 'react-yandex-metrika';

class ScreenPayContainer extends Component {

    state = {
        payRequest: false
    };

    loadPaycards = (test=false) => {
        this.props.showPreloader();
        this.props.updatePaycards({loaded: false, items: []});
        this.props.clientService.getPaycards(test)
            .then((data) => {
                if(!data.error) {
                    this.props.updatePaycards({loaded: true, items: data.result.items});
                }
                this.props.hidePreloader();
            })
            .catch((error) => {
                console.log(error);
                this.props.hidePreloader();
            });
    };

    componentDidMount() {
        if(!this.props.paycards.loaded) {
            this.loadPaycards();
        }

        // проверка карты со всеми полями
        this.props.updateNewCard({
            status: '',
            message: '',
            short_validate: false
        });
    }

    onClickBack = () => {
        this.props.setScreen('tarif');
    };

    onCardChange = (field, payload = {type: ''}) => ({target}) => {
        let value = target.value;
        if(payload.type === 'checkbox') { value = target.checked }

        this.props.updateNewCard({[field]: value});
    };

    getPayBtnDisabled = () => {
        if(this.props.paycards.items.length) {
            return false;
        }

        if(this.props.device.mobile === null) {
            return false;
        }

        if(this.props.new_card.filled) {
            return false;
        }

        return false; // так как не нужно проверять форму на валидность

        //return true;
    };

    onPayClick = () => {
        if(!this.getPayBtnDisabled() && !this.state.payRequest) {
            this.setState({payRequest: true});
            this.props.createOrder(
                this.props.tarifs,
                this.props.order,
                this.props.coords,
                this.props.paycards,
                () => { // успех
                    this.props.updateNewCard({status: 'success_order'});
                    ym('reachGoal', 'paid-success');
                },
                (desc) => { // ошибка создания заказа
                    this.props.showNotify({message: 'Ошибка при создании заказа', desc});
                    this.setState({payRequest: false});
                }
            );
        }
    };

    /**
     * Событие при изменение статуса оплаты
     */
    onGetCardStatus = (status, payload='') => {
        if(status === 'success') {
            this.props.loadPaycards(() => {
                this.onPayClick();
            });

            this.props.clearNewCard();
        }
        this.props.updateNewCard({status, message: payload});
    };

    /**
     * При оплате с непривязанной карты
     */
    onPayNewCardClick = () => {
        if(!this.getPayBtnDisabled()) {
            this.props.showPreloader();
            this.props.clientService.payByPaycard()
                .then((data) => {

                    if (data.statusCode === 200) {
                        openSberbankPopup(data.result.formUrl, {
                            showPreloader: this.props.showPreloader,
                            hidePreloader: this.props.hidePreloader,
                            device: this.props.device,
                            new_card: this.props.new_card,
                            storageKey: 'payCardStatus',
                            onGetCardStatus: this.onGetCardStatus,
                            loadPaycards: this.loadPaycards
                        })
                    } else {

                        // TODO Ошибка создания заказа, повторите еще раз
                        alert('Ошибка создания заказа');
                    }
                });
        }
    };

    onPopupCardOkeyClick = () => {
        this.props.updateNewCard({status: ''});
    };

    onPopupSuccessClick = () => {
        this.props.updateNewCard({status: ''});
        this.props.setScreen('waiting');
    };

    render() {

        const {tarifs, new_card, paycards, device : {mobile}} = this.props;

        const screenPayProps = {
            mobile,
            tarifs,
            new_card,
            paycards,
            payBtnDisabled: this.getPayBtnDisabled(),
            onClickBack: this.onClickBack,
            onCardChange: this.onCardChange,
            onPayClick: this.onPayClick,
            onPayNewCardClick: this.onPayNewCardClick,
            onPopupCardOkeyClick: this.onPopupCardOkeyClick,
            onPopupSuccessClick: this.onPopupSuccessClick
        };

        return (
            <ScreenInner>
                <ScreenPay {...screenPayProps} />
            </ScreenInner>
        );
    }
}

/**
 * Компонент для вывода итоговой суммы
 */
const SummaryTotal = ({total}) => {
    const text = numeralize.pluralize(total, ['рубль','рубля','рублей']);
    return (
        <div className="screen-pay__summ text text_color_white text_align_center">{total} <span className="text_color_gray text_light">{text}</span>
        </div>
    )
};

/**
 * Компонент вывода дополнительной информации по заказу
 */
const SummaryAddition = ({tarifs}) => {
    const {
        total,
        hours,
        hoursPrice,
        addition,
        additionSelectedId,
        additionPrice
    } = tarifs;

    const additionStr = additionSelectedId.map((item) => {
        return addition.find(({id}) => id===item.id).name;
    }).join(', ');

    return (
        <div className="field-value">
            <div className="field-value__row">
                <div className="field-value__field text text_color_white text_size_smdd">{hours} часов</div>
                <div className="field-value__value text text_color_gray text_size_normal">{hoursPrice} <span className="text_size_xs">руб.</span>
                </div>
            </div>
            <div className="field-value__row">
                <div className="field-value__field text text_color_white text_size_smdd">Дополнительные услуги
                    <div className="field-value__note text text_color_gray text_size_xs">{additionStr}</div>
                </div>
                <div className="field-value__value text text_color_gray text_size_normal">{additionPrice} <span className="text_size_xs">руб.</span>
                </div>
            </div>
            <div className="field-value__row">
                <div className="field-value__field text text_color_white text_size_smdd text_uppercase">Итого</div>
                <div className="field-value__value text text_color_white text_size_normal"><span className="text_size_smd"></span>{total} <span className="text_size_xs">руб.</span>
                </div>
            </div>
        </div>
    )
};

const Summary = ({tarifs}) => {
    const {additionSelectedId, total} = tarifs;
    if(additionSelectedId.length) {
        return <SummaryAddition tarifs={tarifs} />;
    }

    return <SummaryTotal total={total} />;
};

const ButtonContainer = ({disabled=false, paycards, onPayClick, onPayNewCardClick}) => {
    const props = {
        title: 'Оплатить',
        disabled
    };

    if(paycards.items.length) {
        return <Button {...props} onClick={onPayClick} />
    } else {
        return <Button {...props} onClick={onPayNewCardClick} />
    }
};

const DriverInfoText = () => {
    return (
        <React.Fragment>
            <div className="margin__10"/>
            <div className="margin__10">
                Водитель оплачивает платные парковки и дороги, данная сумма списывается дополнительно с вашей карты до конца поездки.
            </div>
            <div className="margin__10">
                Вы можете спросить водителя отчет по дополнительным расходам.
            </div>
        </React.Fragment>
    )
};

/**
 * Информация о предоплате с привязкой карты
 */
const PrepayLinkInfo = ({tarifs}) => {
    const {prepayPrice, prepayText} = tarifs;

    return (
        <div className="text_color_white text_size_md">
            С вашей карты будет списана и возвращена сумма в размере 1 рубля для проверки. Далее с карты спишется предоплата - {prepayPrice} {prepayText}. В момент начала поездки с карты будет списана остальная сумма за услугу.
            <DriverInfoText/>
        </div>
    );
};

/**
 * Информацио о предоплате с привязанной карты
 */
const PrepayInfo = ({tarifs}) => {
    const {prepayPrice, prepayText} = tarifs;

    return (
        <div className="text_color_white text_size_md">
            С вашей карты будет списана предоплата - {prepayPrice} {prepayText}. В момент начала поездки с карты будет списана остальная сумма за услугу.
            <DriverInfoText/>
        </div>
    );
};

/**
 * Информации о перенаправлении в Сбербанк
 */
const Sberbank = ({tarifs}) => {
    return (
        <React.Fragment>
            <div className="text_color_white text_size_md margin__10">
                После нажатия на кнопку "Оплатить" вы будете перенаправлены на страницу оплаты платёжного шлюза Сбербанка.
            </div>
            <PrepayLinkInfo tarifs={tarifs}/>
        </React.Fragment>
    )
};

/**
 * Компонент для отображения платежных крат/добавления новой карты
 */
const PaycardsContainer = (props) => {
    const {paycards, mobile, tarifs} = props;

    if(!paycards.loaded) return false;

    if(paycards.items.length) {
        return (
            <React.Fragment>
                <div className="margin__10">
                    <PayCards radioName="orderCard"/>
                </div>
                <PrepayInfo tarifs={tarifs} />
            </React.Fragment>
        )
    } else {

        if(mobile === null || showCardForm === false) {
            return <Sberbank tarifs={tarifs}/>;
        }

        return (
            <React.Fragment>
                <div className="margin__10">
                    <FormCard {...props}/>
                </div>
                <PrepayLinkInfo tarifs={tarifs} />
            </React.Fragment>
        );//<Sberbank />
    }
};

const ScreenPay = (props) => {

    const {
        mobile,
        tarifs,
        new_card,
        paycards,
        payBtnDisabled,
        onClickBack,
        onCardChange,
        onPayClick,
        onPayNewCardClick,
        onPopupCardOkeyClick,
        onPopupSuccessClick
    } = props;

    const {
        number,
        holder,
        date,
        cvc,
        email,
        remember_card
    } = new_card;

    const formCardProps = {
        tarifs,
        mobile,
        paycards,
        number,
        holder,
        date,
        cvc,
        email,
        remember_card,
        onCardChange
    };

    return (
        <div className="screen-pay screen">
            <div className="screen-pay__header wrap">
                <TitleBack title="Оплата заказа" onClickBack={onClickBack}/>
            </div>
            <div className="screen-pay__summary wrap">
                <Summary tarifs={tarifs} />
            </div>
            <div className="screen-pay__form-card wrap">
                <PaycardsContainer {...formCardProps} />
            </div>
            <div className="screen-pay__footer wrap wrap_double">
                <ButtonContainer disabled={payBtnDisabled} paycards={paycards} onPayClick={onPayClick} onPayNewCardClick={onPayNewCardClick} />
            </div>
            <PopupCardContainer
                status={new_card.status}
                message={new_card.message}
                success_code="success_order"
                onOkeyClick={onPopupCardOkeyClick}
                onSuccessClick={onPopupSuccessClick}
            />
        </div>
    )
};

const mapStateToProps = (state) => {
    return {
        order: state.order,
        tarifs: state.tarifs,
        new_card: state.new_card,
        paycards: state.paycards,
        user: state.user,
        device: state.device,
        coords: state.coords
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        showPreloader,
        hidePreloader,
        setScreen,
        updateNewCard,
        clearNewCard,
        updatePaycards,
        showNotify,
        loadPaycards: loadPaycards(clientService),
        createOrder: createOrder(clientService)
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenPayContainer);
