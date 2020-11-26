import React, {Component} from 'react';
import {bindActionCreators, compose} from 'redux';
import TitleBack from '../title-back';
import {
    hideMenuScreen,
    showMenuScreen,
    getDriversList,
    updateRating,
    addDriverToFavorite
} from '../../actions';
import {connect} from 'react-redux';
import withClientService from "../hoc/with-client-service"

class ScreenDrivers extends Component {

    componentDidMount() {
        this.props.getDriversList();
    }

    onClickBack = () => {
        this.props.hideMenuScreen();
    };

    onPageClick = (code) => () => {
        this.props.updateRating({current_list: code});
        this.props.showMenuScreen('drivers-list');
    };

    render() {

        const {favorite, banned} = this.props.rating;
        const favoriteCnt = favorite.length ? favorite.length : '';
        const bannedCnt = banned.length ? banned.length : '';

        const favoriteTitle = <React.Fragment>Избранные <sup className="text_color_gold">{favoriteCnt}</sup></React.Fragment>;
        const blackListTitle = <React.Fragment>Black List <sup className="text_color_white">{bannedCnt}</sup></React.Fragment>;

        const pages = [
            {title: favoriteTitle, code: 'favorite'},
            {title: blackListTitle, code: 'banned'},
        ];

        return (
            <div className="screen-info screen">
                <div className="wrap">
                    <TitleBack title="Мои водители" onClickBack={this.onClickBack} />
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
    return {
        rating: state.rating
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;

    return bindActionCreators({
        hideMenuScreen: hideMenuScreen(),
        showMenuScreen: showMenuScreen(),
        updateRating: updateRating,
        getDriversList: getDriversList(clientService),
        addDriverToFavorite: addDriverToFavorite(clientService)
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenDrivers);
