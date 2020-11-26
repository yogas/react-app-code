import React from 'react';
import {Popup, PopupContent, PopupButtons, PopupButton} from '../popup';
/**
 * @param icon 'okey','alert'
 */
export const PopupCard = ({icon='okey', children='', onOkeyClick}) => {
    return (
        <Popup>
            <PopupContent>
                <div className="text_align_center">
                    <div className={`icon icon_style_${icon} icon_inline`}></div>
                    <div className="text text_size_normal text_color_white">{children}</div>
                </div>
            </PopupContent>
            <PopupButtons>
                <PopupButton color="white" onClick={onOkeyClick}>OK</PopupButton>
            </PopupButtons>
        </Popup>
    );
};

export const PopupCardContainer = ({status, message = '', msg_tpl = {}, success_code = 'success', onOkeyClick, onSuccessClick}) => {
    const {
        msg_try_again = 'Проверьте данные карты и повторите оплату еще раз',
        msg_error = 'При оплате заказа произошла ошибка :(',
        msg_timeout = 'Информация по заказу устарела',
        msg_success = 'Заказ успешно оформлен!'
    } = msg_tpl;

    const msg = message === '' ? msg_try_again : message;

    switch(status) {
        case 'error':
        case 'some-error':

            return (
                <PopupCard
                    icon="alert"
                    onOkeyClick={onOkeyClick}
                >{msg_error}
                    <div className="text_color_gray text_size_md">{msg}</div>
                </PopupCard>
            );

        case 'timeout':
            return (
                <PopupCard
                    icon="alert"
                    onOkeyClick={onOkeyClick}
                >{msg_timeout}
                    <div className="text_color_gray text_size_md">Нажмите кнопку "Оплатить" еще раз</div>
                </PopupCard>
            );

        case success_code:
            return (
                <PopupCard
                    onOkeyClick={onSuccessClick}
                >{msg_success}</PopupCard>
            );

        default:
            return false;
    }
};