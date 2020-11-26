import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setScreen, updateUserAuth} from '../../actions';

class ScreenContract extends Component {
    /**
     * При изменении чекбокса
     * @param target
     */
    onChange = ({target : { checked }}) => {
        //this.props.setScreen('dogovor');
        this.props.updateUserAuth({confirm: checked});
    };

    /**
     * При клике на кнопку Читать договор
     */
    onReadClick = () => {
        this.props.setScreen('dogovor');
    };

    /**
     * При клике на кнопку Принять
     */
    onConfirmClick = () => {
        if(this.props.confirm) {
            this.props.updateUserAuth({confirm: true});
            this.props.setScreen('auth');
        }
    };

    render() {
        const btnClass = !this.props.confirm?' btn_disabled':'';
        const confirm  = this.props.confirm?'checked':false;

        return (
            <div className="screen-contract">
                <div className="screen-auth">
                    <div className="logo logo_size_md screen-auth__logo"></div>
                    <div className="screen-auth__content">
                        <div className="screen-auth__center-content">
                            <div className="screen-auth__message screen-contract__message">Номер {this.props.phone} успешно зарегистрирован</div>
                            <div className="screen-auth__desc screen-contract__desc text_align_center">Для начала пользования приложением вам&nbsp;необходимо принять условия договора&nbsp;на&nbsp;оказание услуг</div>
                            <div
                                className="btn btn_style_round btn_bg_white screen-contract__read-more"
                                onClick={this.onReadClick}
                            >
                                <div className="btn__label">
                                    <div className="btn__text">Читать договор</div>
                                </div>
                            </div>
                            <div className="screen-auth__terms screen-contract__terms">
                                <label className="field-checkbox field-checkbox_color_white field-checkbox_style_box">
                                    <input
                                        className="field-checkbox__field"
                                        type="checkbox"
                                        onChange={this.onChange}
                                        checked={confirm}
                                    /><b></b><span className="text text_size_smdd text_inline">Я принимаю условия</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="screen-auth__footer">
                        <div
                            className={`btn btn_style_border btn_size_md btn_width_fluent${btnClass}`}
                            onClick={this.onConfirmClick}
                        >
                            <div className="btn__label">
                                <div className="btn__text">Принять</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        confirm: state.user.confirm,
        phone: state.user.phone
    };
};


const mapDispatchToProps = {
    setScreen,
    updateUserAuth
};

export default connect(mapStateToProps, mapDispatchToProps)(ScreenContract);