import React, {Component} from 'react';
import ScreenInfoContent from './screen-info-content';
import Instruction from '../instruction';
import {hideNotify, showMenuScreen} from "../../actions";
import {connect} from 'react-redux';
import {compose} from 'redux';

import withClientService from "../hoc/with-client-service"

import "./screen-info-instruction.css";

class ScreenInfoInstruction extends Component {

    onBackClick = () => {
        this.props.hideNotify();
    };

    onOkClick = () => {
        this.props.hideNotify();
        this.props.showMenuScreen('info');
    };

    render () {
        return (
            <ScreenInfoContent
                title="Инструкция"
                gradient={false}
            >
                <div className="info-instruction">
                    <Instruction
                        message=''
                        desc=''
                        onBackClick={this.onBackClick}
                        onOkClick={this.onOkClick}
                    />
                </div>
            </ScreenInfoContent>
        )
    }
}

const mapStateToProps = () => {
    return {}
};

const mapDispatchToProps = {
    hideNotify,
    showMenuScreen
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenInfoInstruction);
