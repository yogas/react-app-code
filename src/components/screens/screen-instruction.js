import React, {Component} from 'react';
import ScreenInner from './screen-inner';
import Instruction from '../instruction';
import {setScreen, showNotify, hideNotify, updateUserAuth} from "../../actions";
import {connect} from 'react-redux';
import {compose} from 'redux';

import withClientService from "../hoc/with-client-service"

class ScreenInstruction extends Component {

    onBackClick = () => {
        this.props.hideNotify();
    };

    onOkClick = () => {
        this.props.hideNotify();
        this.props.updateUserAuth({instruction: false});
        this.props.setScreen('map-address');
    };

    render () {
        return (
            <ScreenInner>
                <div className="first-screen-instruction">
                    <Instruction
                        message="Закрыть инструкцию и продолжить"
                        desc={<div>Инструкция находится в<br/>Меню → Информация → Инструкция</div>}
                        onBackClick={this.onBackClick}
                        onOkClick={this.onOkClick}
                    />
                </div>
            </ScreenInner>
        )
    }
}

const mapStateToProps = () => {
    return {}
};

const mapDispatchToProps = {
    showNotify,
    hideNotify,
    setScreen,
    updateUserAuth
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenInstruction);
