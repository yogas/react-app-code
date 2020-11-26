import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import LeftMenu from '../left-menu';
import {
    showMenu,
    hideMenu,
    showMenuScreenAnimated
} from '../../actions';
import {disptcherPhone} from '../../settings';
import openWhatsApp from '../../utils/open-whats-app';

class ScreenInner extends Component {

    onMenuClick = () => {
        this.props.showMenu();
    };

    onMenuClose = () => {
        this.props.hideMenu();
    };

    onMenuItemClick = (screen) => () => {
        switch(screen) {
            case 'support':
                openWhatsApp({phone: disptcherPhone});
                break;

            default:
                this.props.showMenuScreenAnimated(screen);
        }
    };

    render() {

        const {hidden, opened, screen, screenOpened} = this.props.menu;

        const leftMenuProps = {
            hidden,
            opened,
            screen,
            screenOpened,
            onMenuClose: this.onMenuClose,
            onMenuItemClick: this.onMenuItemClick
        };

        return (
            <div className="screen-inner">
                <ScreenInnerHeader onMenuClick={this.onMenuClick} />
                <div className="screen-inner__content">
                    {this.props.children}
                </div>
                <LeftMenu {...leftMenuProps} />
            </div>
        );
    }
};

const ScreenInnerHeader = ({onMenuClick}) => {
    return (
        <div className="screen-inner__header">
            <div className="top-panel">
                <div className="top-panel__wrap">
                    <div className="top-panel__side-item">
                        <div
                            className="top-panel__menu"
                            onClick={onMenuClick}
                        />
                    </div>
                    <div className="logo logo_size_sm top-panel__logo"></div>
                    <div className="top-panel__helper top-panel__side-item"></div>
                </div>
            </div>
        </div>
    )
};

const mapStateToProps = (state) => {
    return {
        menu: state.menu
    }
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        showMenu: showMenu(dispatch),
        hideMenu: hideMenu(dispatch),
        showMenuScreenAnimated: showMenuScreenAnimated(dispatch)
    }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ScreenInner);
