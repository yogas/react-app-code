import React, {Component} from 'react';
import {connect} from 'react-redux';
import {compose, bindActionCreators} from 'redux';
import TitleBack from '../title-back';
import FormCard from '../form-card';
import Button from '../button';
import {
    showPreloader,
    hidePreloader,
    updateMenu,
    updateNewCard,
    onNewCardChange,
    updatePaycards,
    loadPaycards,
    clearNewCard
} from '../../actions';
import openSberbankPopup from '../../utils/open-sberbank-popup';
import {PopupCardContainer} from '../popup-card-container';
import withClientService from '../hoc/with-client-service';
import {showCardForm} from '../../settings';

class ScreenCardsAdd extends Component {

    componentDidMount() {
        this.props.updateNewCard({short_validate: true});
    }

    onClickBack = () => {
        this.props.updateMenu({screen: 'cards'});
        this.props.updateNewCard({
            status: '',
            message: ''
        })
    };


    onCardChange = (field, payload) => ({target}) => {
        this.props.onNewCardChange({field, target, payload});
    };

    simulateInput = (el, value) => {
        let input = el;
        let lastValue = input.value;
        input.value = value;
        let event = new Event('input', { bubbles: true });
        event.simulated = true;
        let tracker = input._valueTracker;
        if (tracker) {
            tracker.setValue(lastValue);
        }
        input.dispatchEvent(event);
    } ;

    clearValue = (value) => {
        return value.replace(/[\s_/]{1,}/gi, '');
    };

    changeField = (dir) => {
        const fields = ['number','date','cvc'];
        const {focus} = this.props.new_card;
        const idx = fields.findIndex((item)=>item===focus);

        let next = idx+dir;
        if(dir>0) {
            next = next > fields.length - 1 ? fields.length - 1 : next;
        } else {
            next = next < 0 ? 0 : next;
        }

        if(idx !== next) {
            const el = document.querySelector(`input[name='${fields[idx]}']`);
            el.dispatchEvent(new Event('blur', { bubbles: true }));
        }

        this.props.updateNewCard({focus: fields[next]});
    };

    addKeyField = (key='', field) => {
        const el = document.querySelector(`input[name='${field}']`);
        let value = this.props.new_card[field];

        const max = {
            number: 15,
            date: 3,
            cvc: 4
        };

        if(this.clearValue(value).length >= max[field] && key !== '') {
            this.changeField(1);
        }

        if(this.clearValue(value).length === 0 && key === '') {
            this.changeField(-1);
        }

        value = this.clearValue(value);

        if(key !== '') {
            value += key;
        } else {
            if(value.length>0) {
                value = value.slice(0, value.length - 1);
            }
        }

        this.simulateInput(el, value);
    };

    onKeyPress = (key) => () => {
        this.addKeyField(key, this.props.new_card.focus);
    };

    onCardFocus = (key) => () => {
        this.props.updateNewCard({focus: key});
    };

    onGetCardStatus = (status, message = '') => {
        this.props.updateNewCard({status, message});
    };

    getDisabled = () => {
        return (!this.props.new_card.filled && showCardForm && this.props.device.mobile !== null);
    };

    onLinkClick = () => {
        if(this.getDisabled()) return false;

        this.props.showPreloader();
        this.props.clientService.addPaycard()
            .then((data) => {
                if(data.error === null) {
                    console.log(data);
                    openSberbankPopup(data.result.formUrl, {
                        showPreloader: this.props.showPreloader,
                        hidePreloader: this.props.hidePreloader,
                        device: this.props.device,
                        new_card: this.props.new_card,
                        onGetCardStatus: this.onGetCardStatus,
                        loadPaycards: () => {
                            this.props.loadPaycards(() => {
                                this.onPopupSuccessClick();
                            });
                        }
                    });
                }

                //this.props.hidePreloader();
            })
            .catch((error) => {

            });
    };

    onPopupCardOkeyClick = () => {
        this.props.updateNewCard({status: ''});
    };

    onPopupSuccessClick = () => {
        this.props.updateNewCard({status: ''});
        this.props.updatePaycards({loaded: false});
        this.props.updateMenu({screen: 'cards'});
        this.props.clearNewCard();
    };

    render() {

        const {
            new_card,
            device
        } = this.props;

        const formCardProps = {
            ...this.props.new_card,
            short: true,
            cls: ' screen-cards__form-card',
            onCardChange: this.onCardChange,
            onCardFocus: this.onCardFocus
        };

        const keyboardProps = {
            onPress: this.onKeyPress,
            onBackspace: this.onKeyPress
        };

        const msg_tpl = {
            msg_error: 'При привязке карты произошла ошибка :(',
            msg_timeout: 'Сессия по добавлению карты устарела',
            msg_success: 'Карта успешно добавлена!'
        };

        const disabled = this.getDisabled();

        return (
            <div className="screen-cards screen">
                <div className="wrap">
                    <TitleBack onClickBack={this.onClickBack}>Новая карта</TitleBack>
                </div>
                <div className="screen-cards__content wrap">
                    <FormContainer {...{device, formCardProps, keyboardProps}} />
                </div>
                <div className="screen-cards__footer wrap wrap_double">
                    <div className="text text_size_md text_weight_medium text_color_white">
                        <Button title="Привязать" disabled={disabled} onClick={this.onLinkClick} />
                    </div>
                </div>
                <PopupCardContainer
                    status={new_card.status}
                    message={new_card.message}
                    msg_tpl={msg_tpl}
                    onOkeyClick={this.onPopupCardOkeyClick}
                    onSuccessClick={this.onPopupSuccessClick}
                />
            </div>
        );
    }
}

const FormContainer = (props) => {
    if(props.device.mobile === null || showCardForm === false) {
        return (
            <div className="text_color_white">
                Вы будете перенаправленный на платёжный шлюз Сбербанка для привязки карты.
            </div>
        );
    } else {
        return (
            <React.Fragment>
                <FormCard {...props.formCardProps} />
                {/*<Keyboard {...props.keyboardProps} />*/}
            </React.Fragment>
        )
    }
};

const mapStateToProps = (state) => {
    return {
        new_card: state.new_card,
        device: state.device
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;

    return bindActionCreators({
        showPreloader,
        hidePreloader,
        updateMenu,
        updateNewCard,
        updatePaycards,
        clearNewCard,
        loadPaycards: loadPaycards(clientService),
        onNewCardChange: onNewCardChange(dispatch)
    },dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenCardsAdd);
