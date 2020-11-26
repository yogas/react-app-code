import React, { Component } from 'react';
import InputMask from 'react-input-mask';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {setScreen, updateUserAuth, showPreloader, hidePreloader, showNotify} from '../../actions';
import withClientService from '../hoc/with-client-service';
import {formatPhone} from '../../utils';

class ScreenPhone extends Component {

    state = {
        phone: '',
        btnDisabled: true
    };

    componentDidMount() {
        this.updatePhone(this.props.phone);
    };

    updatePhone = (phone) => {
        const btnDisabled = phone.match(/_/)!==null||phone===""?true:false;
        this.setState({phone, btnDisabled});
    };

    /**
     * Событие при изменении телефона
     * @param el
     */
    onPhoneChange = (el) => {
        this.updatePhone(el.target.value);
    };

    /**
     * Событие при нажатии "Далее"
     */
    onNext = () => {
        if(!this.state.btnDisabled) {

            this.props.updateUserAuth({
                phone: this.state.phone,
                client_id: formatPhone(this.state.phone)
            });

            this.props.showPreloader();
            this.props.clientService.getAuthCode(this.state.phone)
                .then((data) => {

                    if(data.statusCode === 500) {
                        this.props.showNotify({message: 'Ошибка на стороне сервера', reload: true});
                    }

                    if(data.error === null) {
                        const update = {
                            phone: this.state.phone,
                            client_id: formatPhone(this.state.phone),
                            rerequest: data.result.rerequest
                        };

                        this.props.updateUserAuth(update);
                        this.props.setScreen('code');
                    }

                    if(data.error === 'wait') {
                        this.props.setScreen('code');
                        this.props.updateUserAuth({rerequest: data.result.rerequest});
                    }

                    this.props.hidePreloader();
                })
                .catch((error) => {
                    console.log(error);
                    this.props.hidePreloader();
                });
        }
    };

    onKeyDown = (e) => {
        if(e.keyCode === 13) {
            this.onNext();
        }
    };

    render() {
        const {phone, btnDisabled} = this.state;
        const btnClass = btnDisabled?' btn_disabled':'';

        return (
            <div className="screen-phone">
                <div className="screen-auth">
                    <div className="logo logo_size_md screen-auth__logo"></div>
                    <div className="screen-auth__note">Введите номер мобильного телефона</div>
                    <div className="field-input screen-phone__phone">
                        <InputMask
                            className="field-input__field"
                            mask="+7 999 999-99-99"
                            placeholder="+7 ___ ___-__-__"
                            type="tel"
                            autoFocus={false}
                            value={phone}
                            onChange={this.onPhoneChange}
                            onKeyDown={this.onKeyDown}
                        />
                    </div>
                    <div
                        className={`btn btn_size_lg btn_style_border screen-auth__continue-btn${btnClass}`}
                        onClick={this.onNext}
                    >
                        <div className="btn__label">
                            <div className="btn__text">Далее</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

const mapStateToProps = (state) => {
    return {
        phone: state.user.phone
    };
};

const mapDispatchToProps = {
    setScreen,
    updateUserAuth,
    showPreloader,
    hidePreloader,
    showNotify
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenPhone);
