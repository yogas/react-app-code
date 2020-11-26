import React, {Component} from 'react';
import Swipe from 'react-easy-swipe';
import LeftMenuScreen from '../left-menu-screen';
import {phone} from '../../settings';

class LeftMenu extends Component {

    onClickCall = () => {
        window.open(`tel://${phone}`, '_system');
    };

    render() {
        const {
            hidden,
            opened,
            screen,
            screenOpened,
            onMenuClose,
            onMenuItemClick,
        } = this.props;

        const openedCls = opened ? ' left-menu_opened' : '';
        const hiddenCls = hidden ? ' hidden' : '';

        const items = [
            {title: 'Профиль', code: 'profile'},
            {title: 'История поездок', code: 'history'},
            {title: 'Способы оплаты', code: 'cards'},
            {title: 'Мои водители', code: 'drivers'},
            {title: 'Информация', code: 'info'},
            {title: 'Служба поддержки', code: 'support'},
        ];

        return (

            <div className={`left-menu ${openedCls}${hiddenCls}`}>
                <div className="left-menu__back-layer" onClick={onMenuClose}></div>
                <Swipe className="left-menu__menu" onSwipeLeft={onMenuClose}>
                    <div className="left-menu__header">
                        <div
                            className="logo logo_size_menu left-menu__logo"
                            onClick={onMenuClose}
                        />
                    </div>
                    <div className="left-menu__content">
                        <div className="left-menu__items text text_size_md text_color_white">
                            {items.map(({title, code}, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="left-menu__item"
                                        onClick={onMenuItemClick(code)}>
                                        {title}</div>);
                            })}
                        </div>
                    </div>
                    <div className="left-menu__footer">
                        <div
                            className="btn btn_style_border btn_size_md btn_icon_call left-menu__call"
                            onClick={this.onClickCall}
                        >
                            <div className="btn__label">
                                <div className="icon icon_style_call icon_inline btn__icon"/>
                                <div className="btn__text">Позвонить нам</div>
                            </div>
                        </div>
                    </div>
                </Swipe>
                <LeftMenuScreen screen={screen} opened={screenOpened}/>
            </div>
        )
    }
};

export default LeftMenu;
