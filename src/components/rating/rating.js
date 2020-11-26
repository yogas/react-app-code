import React, {Component} from 'react';
import {connect} from 'react-redux';
import {compose, bindActionCreators} from 'redux';
import {
    updateRating,
    rateTripRequest,
    addDriverToFavorite,
    addDriverToBlackList,
    updateOrder,
    showNotify,
    hideNotify
} from '../../actions';
import withClientService from '../hoc/with-client-service';
import {PopupButton} from "../popup"

class Rating extends Component {

    addDriverToFavorite = () => {
        this.props.addDriverToFavorite(this.props.order.last.driver_id, () => {
            this.props.hideNotify();
        });
    };

    addDriverToBlackList = () => {
        this.props.addDriverToBlackList(this.props.order.last.driver_id, () => {
            this.props.hideNotify();
        });
    }

    onClick = (idx) => () => {
        this.props.updateRating({rate: idx});
        this.props.updateOrder({last: {...this.props.order.last, rating: idx}});
        this.props.rateTripRequest(idx, () => {
            if(idx >= 4) {
                this.props.showNotify({
                    type: 'attantion',
                    message: <div className="margin__5">Добавить водителя в Избранные?</div>,
                    desc: <React.Fragment>Избранные водители находятся в<br/> Меню → Мои водители → Избранные</React.Fragment>,
                    buttons: [
                        <PopupButton key="1" color="gray" onClick={this.props.hideNotify}>Отмена</PopupButton>,
                        <PopupButton key="2" color="white" onClick={this.addDriverToFavorite}>OK</PopupButton>
                    ]
                });

            } else {
                this.props.showNotify({
                    type: 'attantion',
                    message: <div className="margin__5">Добавить водителя в Black List?</div>,
                    desc: <React.Fragment>Black List водителей находятся в<br/> Меню → Мои водители → Black List</React.Fragment>,
                    buttons: [
                        <PopupButton key="1" color="gray" onClick={this.props.hideNotify}>Отмена</PopupButton>,
                        <PopupButton key="2" color="white" onClick={this.addDriverToBlackList}>OK</PopupButton>
                    ]
                });
            }
        });
    };

    drawStar = (idx) => {
        const cls = idx <= this.props.rating.rate ? ' rating__star_active' : '';

        return (
            <div
                key={idx}
                className={`rating__star${cls}`}
                onClick={this.onClick(idx)}
            />
        )
    };

    render() {
        const stars = [1,2,3,4,5];

        return (
            <div className={`rating ${this.props.className}`}>
                {stars.map((idx) => this.drawStar(idx) )}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {order, rating} = state;
    return {
        order,
        rating
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        updateRating,
        updateOrder,
        showNotify,
        hideNotify,
        rateTripRequest: rateTripRequest(clientService),
        addDriverToFavorite: addDriverToFavorite(clientService),
        addDriverToBlackList: addDriverToBlackList(clientService)
    }, dispatch)
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(Rating);
