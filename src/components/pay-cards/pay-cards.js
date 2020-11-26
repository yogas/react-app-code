import React, {Component} from 'react';
import {connect} from 'react-redux';
import {compose, bindActionCreators} from 'redux';
import withClientService from '../hoc/with-client-service';
import {
    showPreloader,
    hidePreloader,
    loadPaycards,
    updatePaycards,
    paycardToDelete,
    paycardSelectRequest
} from '../../actions';

import updateArray from '../../utils/update-array';
import formatPaycard from '../../utils/formap-paycard';

class PayCards extends Component {

    state = {
        radioName: '',
        items: []
    };

    componentDidMount() {
        const {
            paycards: {loaded},
            radioName = 'card',
        } = this.props;

        if(!loaded) {
            console.log('load paycards');
            this.props.loadPaycards();
        }

        this.setState({
            radioName,
            items: this.props.paycards.items
        });
    }

    onChange = (id) => () => {
        this.props.paycardSelectRequest(id);
    };

    onDelete = (id) => () => {
        this.setState({ items: updateArray(this.state.items, {id}, 'remove') });
        this.props.paycardToDelete(id);
    };

    drawCards = (items, mode, onChange, onDelete) => {
        if(items.length === 0) {
            return (
                <div className="text_color_white text_align_center text_size_md">
                    Список привязанных карт пуст
                </div>
            );
        }

        return items.map( ({id, number='', expiry_date='', is_default=false}, index) => {

            const {niceType, numberFormated, dateFormated} = formatPaycard({number, expiry_date});

            return (
                <label key={index} className="cards__item">
                    <div className="cards__info">
                        <div className="cards__number text text_size_normal text_color_white">{niceType} {numberFormated}</div>
                        <div className="cards__date text text_size_sm text_color_gray">{dateFormated}</div>
                    </div>
                    <div className="cards__field">
                        <FieldContainer
                            id={id}
                            radioName={this.state.radioName}
                            mode={mode}
                            is_default={is_default}
                            onChange={onChange}
                            onDelete={onDelete}
                        />
                    </div>
                </label>
            )
        });
    };

    render() {

        const {
            mode = 'checkbox',
            editable = false,
            paycards,
            onEditClick
        } = this.props;

        const {
            loaded
        } = paycards;

        if(!loaded) return false;

        let items = paycards.items;
        if(mode === 'delete') items = this.state.items;

        //console.log('paycards.items', items);

        return (
            <div className="cards">
                <div className="cards__list">
                    {this.drawCards(items, mode, this.onChange, this.onDelete)}
                </div>
                <EditBtn editable={editable && items.length} onClick={onEditClick}/>
            </div>
        )
    }
}

const FieldCheckbox = ({id, radioName, is_default, onChange}) => {
    return (
        <div className="field-checkbox field-checkbox_style_round field-checkbox_margin_none" name="card">
            <input
                className="field-checkbox__field"
                name={radioName} type="radio"
                checked={is_default}
                onChange={onChange(id)}
            /><b></b><span className="text text_size_smdd text_inline"></span>
        </div>
    )
};

const FieldDelete = ({id, onDelete}) => {
    return (
        <div
            className="icon icon_style_x-lg"
            onClick={onDelete(id)}>
        </div>
    );
};

const FieldContainer = ({id, radioName, mode, is_default, onChange, onDelete}) => {

    switch(mode) {
        case 'checkbox':
            return <FieldCheckbox id={id} radioName={radioName} is_default={is_default} onChange={onChange}/>;

        case 'delete':
            return <FieldDelete id={id} onDelete={onDelete}/>;

        default:
            return false;
    }
};

const EditBtn = ({editable, onClick}) => {
    if(!editable) return false;

    return (
        <div className="text text_align_center">
            <div
                className="btn btn_style_round btn_bg_gray btn_color_white cards__edit-btn"
                onClick={onClick}
            >
                <div className="btn__label">
                    <div className="btn__text">
                        <div className="text text_size_sm">Изменить</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        paycards: state.paycards
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        showPreloader,
        hidePreloader,
        updatePaycards,
        paycardToDelete,
        paycardSelectRequest: paycardSelectRequest(clientService),
        loadPaycards: loadPaycards(clientService)
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(PayCards);