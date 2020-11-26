import React, {Component} from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {setScreen, updateUserAuth, showPreloader, hidePreloader, showNotify} from '../../actions';
import withClientService from '../hoc/with-client-service';
import moment from 'moment-with-locales-es6';

import "./screen-code.css";

class ScreenCode extends Component {

    state = {
        next: 0,
        codeValue: '',
        btnDisabled: true,
        countdown: 0,
        TID: null
    };

    getErrorDesc = (error) => {
        const desc = {
            'code.invalid': 'Неверный код подтверждения (code.invalid)',
            'wait': 'Код подтверждения уже отправлен (wait)'
        };

        if(desc[error]) {
            return desc[error];
        } else {
            return error;
        }
    };

    clearCountDownInterval = () => {
        if(this.state.TID) {
            clearInterval(this.state.TID);
        }
    };

    componentWillUnmount() {
        this.clearCountDownInterval(this.state.TID);
    }

    getCountDown = () => {
        return this.props.rerequest - Math.round((new Date()).getTime()/1000);
    };

    rerequestCountDown = () => {
        this.clearCountDownInterval();

        const TID = setInterval(() => {
            const countdown = this.getCountDown();
            if(countdown >= 0) {
                this.setState({countdown});
            } else {
                clearInterval(this.state.TID);
            }
        }, 1000);

        this.setState({TID});
    };

    componentDidMount() {
        if(this.getCountDown() > 0) {
            this.setState({countdown: this.getCountDown()});
        }
        this.rerequestCountDown();
    }

    showRerequest = (rerequest) => {
        this.props.updateUserAuth({rerequest});
        this.rerequestCountDown();
    }

    /**
     * При повторном запросе кода
     */
    onResendCode = () => {
        this.props.showPreloader();
        this.props.clientService.getAuthCode(this.props.client_id)
            .then((data) => {
                if(data.error !== null) {
                    this.props.showNotify({type: 'alert', message: 'Ошибка', desc: this.getErrorDesc(data.error)});
                } else {
                    this.setState({codeValue: ''});
                }

                this.showRerequest(data.result.rerequest);
                this.props.hidePreloader();
            })
            .catch((error) => {
                this.props.showNotify({type: 'alert', message: 'Ошибка', desc: error});
                this.props.hidePreloader();
            });
    };

    /**
     * При изменении номера телефона
     */
    onChangePhone = () => {
        this.props.updateUserAuth({rerequest: null});
        this.props.setScreen('phone');
    };

    /**
     * При клике на кнопку далее
     */
    onNextClick = () => {
        if(!this.state.btnDisabled) {
            const { client_id, phone } = this.props;

            this.props.showPreloader();
            this.props.clientService.getToken(client_id, this.state.codeValue.replace(/ /gi,''))
                .then((data) => {
                    if(data.statusCode === 200) {
                        const { access_token, refresh_token, expires_in} = data;
                        const auth = {
                            authorized: true,
                            phone,
                            client_id,
                            access_token,
                            refresh_token,
                            expires_in,
                            auth_time: Math.round((new Date()).getTime()/1000)
                        };

                        this.props.updateUserAuth(auth);
                        this.props.setScreen('contract');
                    }

                    if(data.statusCode === 400) {
                        if(data.error === 'wait') {
                            this.showRerequest(data.result.rerequest);
                        }
                        this.props.showNotify({type: 'alert', message: 'Ошибка', desc: this.getErrorDesc(data.error)});
                    }

                    this.props.hidePreloader();
                })
                .catch((error) => {
                    this.props.showNotify({type: 'alert', message: 'Ошибка', desc: error});
                    this.props.hidePreloader();
                });
        }
    };

    /**
     * Отрисовка поля ввода
     * @param index
     * @returns {ReactDOM}
     */
    drawInput = (index) => {
        return (
            <div key={index} className="field-input field-input_align_center field-input_font_big screen-code__input">
                <div className="field-input__field"/>
            </div>
        )
    };

    onCodeValueChange = ({target: {value}}) => {
        if(!value.match(/[0-9 ]{1,}/) && value !== "") return false;
        const ar = value.replace(/[ (,)]{0,}/gi, '').split("");
        const codeValue = ar.join(' ');
        const btnDisabled = codeValue.replace(/ /gi, '').match(/[0-9]{4}/) ? false : true;

        this.setState({
            codeValue,
            btnDisabled
        });
    };

    render() {
        const btnClass = this.state.btnDisabled?' btn_disabled':'';
        const {countdown} = this.state;
        const time = moment(countdown*1000).format('mm:ss');

        const resendCode = (
            <div
                className="screen-auth__action"
                onClick={this.onResendCode}
            >
                Отправить еще раз
            </div>);

        const wait = (
            <div className="screen-auth__action text_color_gray">
                Повторный запрос кода через {time}
            </div>
        );

        return (
            <div className="screen-code">
                <div className="screen-auth">
                    <div className="logo logo_size_md screen-auth__logo"/>
                    <div className="screen-auth__note">На номер <span className="text_nowrap">{this.props.phone}</span>
                        <br/>отправлено СМС с кодом</div>
                    <div className="screen-auth__code screen-code__code">
                        {this.drawInput(0)}
                        {this.drawInput(1)}
                        {this.drawInput(2)}
                        {this.drawInput(3)}
                        <div className="field-input field-input_font_big screen-code__code-field">
                            <input
                                type="tel"
                                maxLength={7}
                                value={this.state.codeValue}
                                className="field-input__field"
                                autoFocus={true}
                                onChange={this.onCodeValueChange}
                            />
                        </div>
                    </div>
                    <div
                        className={`btn btn_size_lg btn_style_border screen-auth__continue-btn screen-code__continue-btn${btnClass}`}
                        onClick={this.onNextClick}
                    >
                        <div className="btn__label">
                            <div className="btn__text">Далее</div>
                        </div>
                    </div>
                    <ul className="screen-auth__actions">
                        <li>
                            {countdown ? wait : resendCode}
                        </li>
                        <li>
                            <div
                                className="screen-auth__action"
                                onClick={this.onChangePhone}
                            >Изменить номер телефона</div>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        phone: state.user.phone,
        client_id: state.user.client_id,
        rerequest: state.user.rerequest
    }
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
)(ScreenCode);
