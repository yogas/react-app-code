import React, {Component} from 'react';
import {compose, bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import TitleBack from '../title-back';
import {
    showMenuScreen,
    hideMenuScreen,
    loadHistory,
    loadTarifs,
    showPreloader,
    showOrderDetail
} from '../../actions';
import withClientService from '../hoc/with-client-service';
import formatHistoryItem from '../../utils/format-history-item';

class ScreenHistory extends Component {

    componentDidMount() {
        const loadTarfisProps = {
            callback:() => {
                if (!this.props.history.loaded) {
                    this.props.loadHistory();
                }
            },
            preloaderHide: false
        };

        if(!this.props.tarifs.loaded) {
            this.props.loadTarifs(loadTarfisProps);
        } else {
            if(this.props.history.pages === null) {
                this.props.loadHistory();
            }
        }
    };

    onClickBack = () => {
        this.props.hideMenuScreen();
    };

    onNextLoad = () => {
        if(!this.props.history.loaded) {
            this.props.loadHistory({page: this.props.history.next})
        }
    };

    onScrollList = ({target: {scrollTop, scrollHeight, offsetHeight}}) => {
        const max = scrollHeight-offsetHeight;
        if(scrollTop >= max-50 && !this.props.loading) {
            this.onNextLoad();
        }
    };

    onOrderClick = (id) => () => {
        this.props.showOrderDetail(id);
    };

    render() {

        return (
            <div className="screen-history screen">
                <div className="wrap">
                    <TitleBack title="История поездок" onClickBack={this.onClickBack} />
                </div>
                <div
                    className="screen-history__history wrap"
                    onScroll={this.onScrollList}
                >
                    <HistoryContainer
                        history={this.props.history}
                        tarifs={this.props.tarifs}
                        onOrderClick={this.onOrderClick}
                    />
                </div>
            </div>  
        );
    }
}

const HistoryItem = ({item, tarifs, onOrderClick}) => {

    const {
        id,
        hours,
        price,
        date,
        hours_text,
        tarif,
        rub_text
    } = formatHistoryItem(item, tarifs);

    return (
        <div
            className="history__item"
            onClick={onOrderClick(id)}
            >
            <div className="history__date-coll">
                <div className="history__row">
                    <div className="text text_color_gray text_size_xs">Дата</div>
                    <div className="text text_color_white text_size_md">{date}</div>
                </div>
                <div className="history__row">
                    <div className="text text_color_gray text_size_xs">Тариф</div>
                    <div className="text text_color_white text_size_md">{tarif.name}</div>
                </div>
            </div>
            <div className="history__time-coll">
                <div className="history__row">
                    <div className="text text_color_gray text_size_xs">Время</div>
                    <div className="text text_color_white text_size_md">{hours} {hours_text}</div>
                </div>
                <div className="history__row">
                    <div className="text text_color_gray text_size_xs">Стоимость</div>
                    <div className="text text_color_white text_size_md">{price} <span className="text_size_xs">{rub_text}</span>
                    </div>
                </div>
            </div>
            <div className="history__icon-coll">
                <div className="icon icon_style_arrow history__icon"></div>
            </div>
        </div>
    );
};

const History = ({history, tarifs, onOrderClick}) => {
    console.log(history);

    return (
        <div className="history">
            <div className="history__list">
                {history.items.map((item) => <HistoryItem
                    key={item.id}
                    item={item}
                    tarifs={tarifs}
                    onOrderClick={onOrderClick}
                />)}
            </div>
        </div>
    )
};

const HistoryContainer = (props) => {
    if(!props.history.items.length) return false;

    return <History {...props} />;
};

const mapStateToProps = (state) => {
    return {
        history: state.history,
        loading: state.loading,
        tarifs: state.tarifs
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        showMenuScreen: showMenuScreen(),
        hideMenuScreen: hideMenuScreen(),
        loadHistory: loadHistory(clientService),
        showOrderDetail: showOrderDetail(),
        loadTarifs: loadTarifs(clientService),
        showPreloader
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenHistory);