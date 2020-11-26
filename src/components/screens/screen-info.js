import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import TitleBack from '../title-back';
import {
    hideMenuScreen,
    showMenuScreen
} from '../../actions';
import {connect} from 'react-redux';

class ScreenInfo extends Component {

    onClickBack = () => {
        this.props.hideMenuScreen();
    };

    onPageClick = (code) => () => {
        this.props.showMenuScreen(code);
    };

    render() {

        const pages = [
            {title: 'Тарифы', code: 'info-tarif'},
            {title: 'Договор оферты', code: 'info-dogovor'},
            {title: 'Инструкция', code: 'info-instruction'},
            {title: 'Приложение', code: 'info-app'}
        ];

        return (
            <div className="screen-info screen">
                <div className="wrap">
                    <TitleBack title="Информация" onClickBack={this.onClickBack} />
                </div>
                <div className="screen-info__content">
                    <div className="screen-info__menu text text_size_md text_color_white text_weight_medium text_align_center">
                        {pages.map(({title, code}, idx) => {
                            return (
                                <div
                                    key={idx}
                                    className="screen-info__menu-item"
                                    onClick={this.onPageClick(code)}
                                >{title}</div>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {}
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        hideMenuScreen: hideMenuScreen(),
        showMenuScreen: showMenuScreen()
    }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ScreenInfo);
