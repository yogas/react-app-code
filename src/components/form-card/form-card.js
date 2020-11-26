import React from 'react';
import InputMask from 'react-input-mask';

const HolderField = ({holder, onChange}) => {
    return (
        <div className="form-card__row">
            <label className="field-input field-input_label field-input_fluent field-input_uppercase">
                <div className="field-input__label text text_size_xs">Имя владельца</div>
                <input
                    className="field-input__field"
                    type="text"
                    name="holder"
                    placeholder="Ivanov Ivan"
                    value={holder}
                    onChange={onChange('holder')}
                />
            </label>
        </div>
    );
};

const EmailField = ({email, onChange}) => {
    return (
        <div className="form-card__row">
            <label className="field-input field-input_label field-input_fluent">
                <div className="field-input__label text text_size_xs">Эл. почта</div>
                <input
                    className="field-input__field"
                    type="email"
                    name="email"
                    placeholder="ivanov@the-driver.ru"
                    value={email}
                    onChange={onChange('email')}
                />
            </label>
        </div>
    );
};

const RememberField = ({remember_card, onChange}) => {
    return false; // пока не нужно

    /*return (
        <div className="form-card__row">
            <label className="field-checkbox field-checkbox_color_gold field-checkbox_textcolor_white field-checkbox_style_box">
                <input
                    className="field-checkbox__field"
                    type="checkbox"
                    checked={remember_card}
                    onChange={onChange('remember_card',{type: 'checkbox'})}
                /><b></b><span className="text text_size_smdd text_inline">Привязать карту</span>
            </label>
        </div>
    );*/
};

const FormCard = (props) => {

    const {
        short = false,
        number,
        holder,
        date,
        cvc,
        email,
        onCardChange,
        onCardFocus = ()=>()=>{},
        remember_card,
        cls = ''
    } = props;

    return (
        <div className={`form-card${cls}`}>
            <div className="form-card__row">
                <label className="field-input field-input_label field-input_fluent">
                    <div className="field-input__label text text_size_xs">Номер карты</div>
                    <InputMask
                        className="field-input__field"
                        type="tel"
                        name="number"
                        maskChar="_"
                        mask="9999 9999 9999 9999"
                        placeholder="0000 0000 0000 0000"
                        value={number}
                        onChange={onCardChange('number')}
                        onFocus={onCardFocus('number')}
                    />
                </label>
            </div>
            {!short ? <HolderField holder={holder} onChange={onCardChange}/> : false}
            <div className="form-card__row">
                <label className="field-input field-input_label field-input_fluent form-card__date">
                    <div className="field-input__label text text_size_xs">Срок действия</div>
                    <InputMask
                        className="field-input__field"
                        mask="99/99"
                        type="tel"
                        name="date"
                        placeholder="мм/гг"
                        value={date}
                        onChange={onCardChange('date')}
                        onFocus={onCardFocus('date')}
                    />
                </label>
                <label className="field-input field-input_label field-input_fluent">
                    <div className="field-input__label text text_size_xs">CVV/CVC</div>
                    <input
                        className="field-input__field"
                        type="tel"
                        name="cvc"
                        placeholder="000"
                        maxLength="4"
                        value={cvc}
                        onChange={onCardChange('cvc')}
                        onFocus={onCardFocus('cvc')}
                    />
                </label>
            </div>
            {!short ? <EmailField email={email} onChange={onCardChange}/> : false }
            {!short ? <RememberField remember_card={remember_card} onChange={onCardChange}/> : false }
        </div>
    );
};

export default FormCard;