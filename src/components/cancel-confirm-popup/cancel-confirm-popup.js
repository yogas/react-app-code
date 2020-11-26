import React from 'react';
import {connect} from 'react-redux';
import {Popup, PopupContent, PopupButtons, PopupButton} from '../popup';
import getDiffTime from '../../utils/diff-time';
import {changeOrderTime} from '../../settings';
import {getHoursText} from "../../utils/padej"

const CancelConfirmPopup = ({show, status='', order, onCancelClick, onConfirmClick}) => {
    if(!show) return false;

    let str = 'Подтвердите отмену поездки.';
    const {minutes} = getDiffTime(order.date.utc);
    if(minutes/60 <= changeOrderTime) {
        str = (
            <div>
                <div className="margin__5">
                    Согласно условиям тарифа при отмене заказа менее чем за&nbsp;
                    {changeOrderTime} {getHoursText(changeOrderTime)}&nbsp;
                    до его начала предоплата заказа не возвращается.
                </div>
                Подтвердите отмену поездки.
            </div>
        );
    }

    if(status === 'order.process') {
        str = 'Подтвердите завершение поездки';
    }

    return (
        <Popup>
            <PopupContent>
                <div className="popup-time-ok text_align_center text_color_white popup-finish__text">
                    {str}
                </div>
            </PopupContent>
            <PopupButtons>
                <PopupButton onClick={onConfirmClick}>ОК</PopupButton>
                <PopupButton color="gray" onClick={onCancelClick}>Отмена</PopupButton>
            </PopupButtons>
        </Popup>
    );
};

const mapStateToProps = (state) => {
    return {
        order: state.order
    }
}

export default connect(mapStateToProps)(CancelConfirmPopup);
