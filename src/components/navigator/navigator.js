import React, {Component} from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import Auth from '../auth';
import {
    ScreenPhone,
    ScreenCode,
    ScreenContract,
    ScreenDogovor,
    ScreenMapAddress,
    ScreenSugg,
    ScreenTarif,
    ScreenAddition,
    ScreenDopInfo,
    ScreenPay,
    ScreenWaiting,
    ScreenFeed,
    ScreenOrder,
    ScreenRating,
    ScreenInstruction,
    ScreenOffline
} from '../screens';
import {setScreen, showPreloader, updateDevice, showNotify} from '../../actions';
import withClientService from '../hoc/with-client-service';
import {withRouter} from 'react-router-dom';
import queryString from 'query-string';
import {reactLocalStorage} from 'reactjs-localstorage';
import ym from 'react-yandex-metrika';


class Navigator extends Component {

    /**
     * Проверка на внешние параметры для приложения thedriver://
     */
    customUrlSchemeParams = () => {
        window.handleOpenURL = (url) => {
            setTimeout(() => {
                if(url.match(/thedriver:\/\//)) {
                    // do something with outer params
                }
            }, 0);
        };
    };

    onCardAdded = () => {
        this.props.showNotify({type:'okey', message: 'Карта успешно добавлена', desc: 'Нажмите кнопку "Готово"', showbtn: false});
    };

    onCardAddedError = () => {
        this.props.showNotify({type:'alert', message: 'Ошибка добавления карты', desc: 'Нажмите кнопку "Готово"', showbtn: false});
    };

    /**
     * Проверка на параметры переданные странице
     */
    eventListener = (params = {
        cardAdded:'n',
        cardError: 'n',
        cardPayed: 'n',
        cardPayedError: 'n',
        cordova: 'n'
    }) => {

        reactLocalStorage.remove('addCardStatus');
        reactLocalStorage.remove('payCardStatus');

        if(params.cordova === 'y') {
            this.props.updateDevice({nativePreloader: true});
        }

        if(params.cardAdded === 'y') {

            //this.props.showPreloader();
            this.props.setScreen('clear');
            this.onCardAdded();

            reactLocalStorage.setObject('addCardStatus', {code:'success'});
        }

        if(params.cardError === 'y') {

            //this.props.showPreloader();
            this.props.setScreen('clear');
            this.onCardAddedError();

            reactLocalStorage.setObject('addCardStatus', {code:'error'});
        }

        if(params.cardPayed === 'y') {

            //this.props.showPreloader();
            this.props.setScreen('clear');
            this.onCardAdded();

            reactLocalStorage.setObject('payCardStatus', {code:'success'});
        }

        if(params.cardPayedError === 'y') {

            //this.props.showPreloader();
            this.props.setScreen('clear');
            this.onCardAddedError();

            reactLocalStorage.setObject('payCardStatus', {code:'error'});
        }
    };

    componentDidMount() {
        this.customUrlSchemeParams();
        this.eventListener(queryString.parse(this.props.location.search));
    }

    drawScreen = (screen) => {
        switch(screen) {
            case 'clear':
                return false;
            case 'phone':
                return <ScreenPhone />;
            case 'code':
                return <ScreenCode />;
            case 'contract':
                return <ScreenContract />;
            case 'dogovor':
                return <ScreenDogovor />;
            case 'map-address':
                ym('reachGoal', 'map-address');
                return <ScreenMapAddress />;
            case 'sugg':
                return <ScreenSugg />;
            case 'tarif':
                ym('reachGoal', 'tarif');
                return <ScreenTarif />;
            case 'addition':
                ym('reachGoal', 'addition');
                return <ScreenAddition />;
            case 'dop-info':
                return <ScreenDopInfo />;
            case 'pay':
                const {total} = this.props.tarifs;
                ym('reachGoal', 'pay', {total});
                return <ScreenPay />;
            case 'waiting':
                return <ScreenWaiting />;
            case 'feed':
                return <ScreenFeed />;
            case 'order':
                return <ScreenOrder />;
            case 'rating':
                return <ScreenRating />;
            case 'instruction':
                return <ScreenInstruction />;
            case 'offline':
                return <ScreenOffline />;
            default:
                return <Auth />;
        }
    };

    render() {
        return this.drawScreen(this.props.screen);
    }
};

const mapStateToProps = (state) => {
    return {
        screen: state.screen,
        tarifs: state.tarifs
    }
};

const mapDispatchToProps = {
    setScreen,
    showPreloader,
    updateDevice,
    showNotify
};

export default compose(
    withRouter,
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(Navigator);
