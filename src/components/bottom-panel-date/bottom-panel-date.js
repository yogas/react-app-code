import React from 'react';

/**
 * Компонент вывода текущей даты
 */
const BottomPanelDate = ({date = {}, onClick=()=>{}}) => {
    const {mon = '', dayofweek = '', time = ''} = date;
    return (
        <div
            className="date-of-come__timewrap"
            onClick={onClick}
        >
            <div className="date-of-come__date">{mon}</div>
            <div className="date-of-come__dayofweek text text_size_sm text_color_gray">{dayofweek}</div>
            <div className="date-of-come__time">{time}</div>
        </div>
    );
};

export default BottomPanelDate;