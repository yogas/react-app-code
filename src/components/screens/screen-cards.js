import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import TitleBack from '../title-back';
import PayCards from '../pay-cards';
import {
    showMenuScreen,
    hideMenuScreen
} from '../../actions';

class ScreenCards extends Component {

    onClickBack = () => {
        this.props.hideMenuScreen();
    };

    onEditClick = () => {
        this.props.showMenuScreen('cards-edit');
    };

    onLinkClick = () => {
        this.props.showMenuScreen('cards-add');
    };

    render() {
        return (
            <div className="screen-cards screen">
                <div className="wrap">
                    <TitleBack title="Способ оплаты" onClickBack={this.onClickBack}/>
                </div>
                <div className="screen-cards__content wrap wrap_double">
                    <PayCards editable={true} onEditClick={this.onEditClick} />
                </div>
                <div className="screen-cards__footer wrap wrap_double">
                    <div
                        className="btn btn_style_border btn_size_md btn_fluent btn_icon_card-add"
                        onClick={this.onLinkClick}
                    >
                        <div className="btn__label">
                            <div className="icon icon_style_card-add icon_inline btn__icon"></div>
                            <div className="btn__text">Привязать карту</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        cards: state.cards
    }
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        showMenuScreen: showMenuScreen(dispatch),
        hideMenuScreen: hideMenuScreen(dispatch)
    }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ScreenCards);