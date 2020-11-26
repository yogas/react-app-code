import React, {Component} from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import TitleBack from '../title-back';
import PayCards from '../pay-cards';
import {
    updateMenu,
    updatePaycards,
    showPreloader,
    hidePreloader,
    deletePaycard,
    paycardSelectRequest
} from '../../actions';
import withClientService from '../hoc/with-client-service';

class ScreenCardsEdit extends Component {

    state = {
        cnt: 0,
        changeSelected: false
    };

    /**
     * Проверка на выбранную карту по умолчанию
     * Используется, если удалили выбранную карту
     */
    checkSelectedPaycard = (id) => {
        const item = this.props.paycards.items.find((el) => id===el.id);
        if(item === undefined) return false;

        if(item.is_default) {
            this.setState({changeSelected: true});
        }
    };

    deleteCards = (ids, callback) => {
        if(ids.length === 0) {
            this.props.updateMenu({screen: 'cards'});
            return false;
        }

        this.props.showPreloader();

        ids.forEach((id) => {
            this.props.clientService.deletePaycard(id)
                .then((data) => {

                    if(data.statusCode === 204) {
                        this.checkSelectedPaycard(id);
                        console.log('deletePaycard', id);
                        this.props.deletePaycard(id);
                    }

                    const cnt = this.state.cnt+1;
                    this.setState({cnt});

                    if(cnt === ids.length) {
                        this.props.hidePreloader();
                        this.props.updateMenu({screen: 'cards'});
                        this.props.updatePaycards({deleted: []});

                        callback();
                    }
                });
        });
    };

    onCancel = () => {
        this.props.updateMenu({screen: 'cards'});
    };

    onSave = () => {
        const {
            paycards: { deleted, items }
        } = this.props;

        console.log('deleted', deleted);

        // запрос на удаление карт после сохранения
        this.deleteCards(deleted, () => {
            if (this.state.changeSelected) {
                if (items.length) {
                    const {id = false} = items.find(({is_default}) => is_default);
                    paycardSelectRequest(id, this.props);
                }
            }
        });
    };

    render() {
        return (
            <div className="screen-cards screen">
                <div className="wrap">
                    <TitleBack>Способ оплаты</TitleBack>
                </div>
                <div className="screen-cards__content wrap wrap_double">
                    <PayCards mode='delete'/>

                    <div className="text text_size_md text_weight_medium text_color_white">
                        <div
                            className="btn btn_style_filled btn_bg_white01 btn_size_md btn_fluent btn_color_white screen-cards__cancel-btn"
                            onClick={this.onCancel}
                        >
                            <div className="btn__label">
                                <div className="btn__text">Отмена</div>
                            </div>
                        </div>
                        <div
                            className="btn btn_style_border btn_size_md btn_fluent"
                            onClick={this.onSave}
                        >
                            <div className="btn__label">
                                <div className="btn__text">Сохранить</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        paycards: state.paycards
    }
};

const mapDispatchToProps = {
    updateMenu,
    updatePaycards,
    showPreloader,
    hidePreloader,
    deletePaycard
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenCardsEdit);