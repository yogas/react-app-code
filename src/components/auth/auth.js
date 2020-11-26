import React, {Component} from 'react';
import {compose, bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {reactLocalStorage} from 'reactjs-localstorage';
import {
    setScreen,
    updateUserAuth,
    loadActiveOrder,
    getDriverCoords,
    getAppVersion
} from '../../actions';
import withClientService from '../hoc/with-client-service';


class Auth extends Component {
    /**
     * Событие после того как пользователь автизовался
     */
    afterUserAuthorized = () => {
        this.props.loadActiveOrder({callback: () => {
            const {driver_id} = this.props.order;
            if(driver_id) {
                this.props.getDriverCoords(driver_id);
            }
        }});
    };

    /**
     * При создании компонента
     */
    componentDidMount() {
        // Проверить авторизован ли пользователь
        const storageAuth = reactLocalStorage.getObject('auth');
        const user = {...this.props.user, ...storageAuth};

        this.props.updateUserAuth(user);

        this.props.getAppVersion({confirm: true});

        let authStatus = '';
        // если пользователь не авторизован
        if(!user.authorized) { authStatus = 'not_auth' }
        // если не авторизован но запросил код подтвержения
        if(!user.authorized && user.rerequest) { authStatus = 'not_auth_rerequest' }
        // если авторизован, но не согласился с правилами
        if(user.authorized && !user.confirm) { authStatus = 'auth_not_confirm' }
        // если авторизован и согласился с правилами
        if(user.authorized && user.confirm) { authStatus = 'auth_confirm' }

        let prod = true;
        let auth_screen = 'phone';
        if(!prod) {
            auth_screen = 'map-address';
        }

        switch(authStatus) {
            case 'not_auth':
                this.props.setScreen(auth_screen);
                break;

            case 'not_auth_rerequest':
                this.props.setScreen('code');
                break;

            case 'auth_not_confirm':
                this.props.setScreen('contract');
                break;

            case 'auth_confirm':
                this.afterUserAuthorized();
                break;

            default:
                this.props.setScreen(auth_screen);
        }
    }

    render() {
        return (<div className="text_color_gold"></div>);
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        order: state.order
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        updateUserAuth,
        setScreen,
        loadActiveOrder: loadActiveOrder(clientService),
        getDriverCoords: getDriverCoords(clientService),
        getAppVersion: getAppVersion(clientService)
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(Auth);
