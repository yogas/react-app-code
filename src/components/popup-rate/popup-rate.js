import {Popup, PopupButton, PopupButtons, PopupContent} from "../popup"
import Rating from "../rating"
import React from "react"
const PopupRate = ({show, rate, onReviewClick, onReviewClose}) => {
    if(!show) return false;

    return (
        <Popup>
            <PopupContent>
                <div className="popup-finish-rating">
                    <div className="popup-finish-rating__title text text_color_white text_size_normal text_align_center">Пожалуйста, оцените поездку</div>
                    <Rating className="popup-finish-rating__rating" />
                    <div className="popup-finish-rating__note text text_color_gray text_size_smd text_align_center">Мы заботимся о вашем комфорте и&nbsp;всегда готовы меняться в лучшую сторону.</div>
                </div>
            </PopupContent>
            <PopupButtons>
                <PopupButton color="gray" onClick={onReviewClose}>Закрыть</PopupButton>
                <PopupButton color={rate ? 'white' : 'gray'} onClick={onReviewClick}>Оставить отзыв</PopupButton>
            </PopupButtons>
        </Popup>
    );
};

export default PopupRate;
