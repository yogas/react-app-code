import React, {Component} from 'react';
import {bindActionCreators, compose} from 'redux';
import TitleBack from '../title-back';
import {
    hideMenuScreen,
    showMenuScreen,
    showNotify,
    hideNotify,
    updateRating,
    deleteDriverFromList,
    addDriverToFavorite,
    addDriverToBlackList
} from '../../actions';
import {connect} from 'react-redux';
import withClientService from "../hoc/with-client-service"
import {PopupButton} from "../popup"

class ScreenDriversList extends Component {

    onClickBack = () => {
        this.props.showMenuScreen('drivers');
    };

    deleteDriverFromList = (id) => () => {
        this.props.hideNotify();
        this.props.updateRating({lists_loaded: false});

        //this.props.addDriverToBlackList(id);
        this.props.deleteDriverFromList(id, this.props.rating.current_list);
        console.log(this.props.rating.current_list);
    }

    onDelete = (id) => () => {
        this.props.showNotify({type: 'attantion', message: 'Удалить водителя из списка?', buttons: [
                <PopupButton key={1} color="gray" onClick={this.props.hideNotify}>Отмена</PopupButton>,
                <PopupButton key={2} color="gray" onClick={this.deleteDriverFromList(id)}>ОК</PopupButton>
            ]});
    }

    render () {

        const title = {
            'favorite': 'Избранные',
            'banned': 'Black List'
        };

        const {rating} = this.props;
        const {current_list} = rating;

        const list = rating[current_list];

        return (
            <div className="screen-info screen">
                <div className="wrap">
                    <TitleBack title={title[current_list]} onClickBack={this.onClickBack}/>
                </div>
                <div className="screen-info__content screen-info__dogovor-wrap">
                    <div className="screen-info__dogovor">
                        <div className="wrap text text_color_gray text_size_md text_lh_20">
                            <ListContainer list={list} onDelete={this.onDelete} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const List = ({list, onDelete}) => {
    return list.map(({id, name}) => {
        return (
            <div key={id} className="cards__list"><label className="cards__item">
                <div className="cards__info">
                    <div className="cards__number text text_size_normal text_color_white">
                        {name}
                    </div>
                </div>
                <div className="cards__field">
                    <div className="icon icon_style_x-lg" onClick={onDelete(id)} />
                </div>
            </label></div>
        )
    })
};

const ListContainer = ({list, onDelete}) => {
    if(list.length === 0) {
        return <div>Список пуст</div>
    } else {
        return <div className="cards"><List {...{list, onDelete}} /></div>;
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
        showNotify: showNotify,
        hideNotify: hideNotify,
        updateRating: updateRating,
        deleteDriverFromList: deleteDriverFromList(clientService),
        addDriverToFavorite: addDriverToFavorite(clientService),
        addDriverToBlackList: addDriverToBlackList(clientService)
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenDriversList);
