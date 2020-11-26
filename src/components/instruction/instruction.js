import React, {Component} from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {PopupButton} from '../popup';
import AliceCarousel from 'react-alice-carousel';
import {showNotify} from "../../actions";

import './screen-instruction.css';
import withClientService from "../hoc/with-client-service"
import {_appUrl} from '../../settings';

class Instruction extends Component {

    state = {
        slide: 0,
        items: [
            {image: `${_appUrl}img/training_1.png`},
            {image: `${_appUrl}img/instruction_2.svg`},
            {image: `${_appUrl}img/training_3.svg`}
        ]
    };

    constructor(props) {
        super();
        if(props.message !== '') {
            this.state.items = [...this.state.items, {image: `${_appUrl}img/training_4.png`}];
        }
    }

    onBackClick = () => {
        this.props.onBackClick();
        this.setState({slide: 2});
    };

    onOkClick = () => {
        this.props.onOkClick();
    };

    render () {

        console.log(this.state);

        return (
            <div className="training-slider">
                <AliceCarousel
                    infinite={false}
                    swipeDisabled={false}
                    mouseDragEnabled={true}
                    buttonsDisabled={true}
                    dotsDisabled={false}
                    slideToIndex={this.state.slide}
                    onSlideChanged={(event) => {
                        if(event.slide === 3) {
                            this.props.showNotify({
                                type: 'okey',
                                message: this.props.message,
                                desc: this.props.desc,
                                buttons: [
                                    <PopupButton color="white" onClick={this.onBackClick} key="1">Назад</PopupButton>,
                                    <PopupButton color="white" onClick={this.onOkClick} key="2">OK</PopupButton>
                                ]
                            });
                        }

                        this.setState({slide: event.slide});
                    }}
                >
                    {
                        this.state.items.map(({image}, idx) => {
                            return (
                                <div
                                    key={idx}
                                    className="training-slider__slide"
                                    style={{backgroundImage: `url(${image})`}}
                                />
                            )
                        })
                    }
                </AliceCarousel>
            </div>
        )
    }
}

const mapStateToProps = () => {
    return {}
};

const mapDispatchToProps = {
    showNotify
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(Instruction);
