import React,{Component} from 'react';
import {Popup, PopupContent, PopupButtons, PopupButton} from '../popup';
import moment from 'moment-with-locales-es6';
import {minOrderHours, maxOrderHours, minOrderHoursSelected} from '../../settings';
import {getDaysText} from '../../utils/padej';

/**
 * Попап выбора даты
 */
class DatePopup extends Component {

    componentDidMount() {
    }

    render() {
        const {
            date = '',
            dateError = '',
            show = false,
            onOkeyClick,
            onDateChange,
            onCancelClick = false,
            onDateInputRendered = (ref) => {}
        } = this.props;

        if (!show) return false;

        const dateValue = date === '' ? moment().add(minOrderHoursSelected, 'hours').format('YYYY-MM-DDTHH:mm') : date;
        const fieldCls = dateError === '' ? '' : ' margin__10';
        const errorCls = dateError === '' ? ' hidden' : '';

        return (
            <Popup>
                <PopupContent>
                    <div className="popup-time-ok text_align_center text_color_white">
                        <div className="popup-time-ok__title text text_size_normal">Укажите дату и время подачи:</div>
                        <div className={`field-input field-input_fluent${fieldCls}`}>
                            <input
                                type="datetime-local"
                                name="date-field"
                                className="field-input__field"
                                value={dateValue}
                                onChange={onDateChange}
                                autoFocus="autoFocus"
                                onClick={this.onClick}
                                ref={(ref) => onDateInputRendered(ref)}
                            />
                        </div>
                        <div className={`text_color_white text_size_smd${errorCls}`}>
                            {dateError}
                        </div>
                    </div>
                </PopupContent>
                <PopupButtons>
                    {onCancelClick ? <PopupButton color="gray" onClick={onCancelClick}>Отмена</PopupButton> : false}
                    <PopupButton onClick={onOkeyClick}>ОК</PopupButton>
                </PopupButtons>
            </Popup>
        );
    }
};

export const checkValidDate = (date) => {
    const a = moment(date); //order date
    const b = moment(); //now
    const diff = a.diff(b, 'minutes')/60; // diff in minutes

    if (diff >= minOrderHours && diff <= maxOrderHours) {
        return true;
    } else {
        return false;
    }
};

export const validateDate = (date) => {
    let error = null;

    if(!checkValidDate(date)) {
        error = <div>Дата и время подачи должны быть не менее {minOrderHours} часов и не более {maxOrderHours/24} {getDaysText(maxOrderHours/24)} от&nbsp;времени размещения&nbsp;заказа</div>;
    }

    return error;
};

export default DatePopup;
