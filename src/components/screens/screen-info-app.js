import React, {Component} from 'react';
import ScreenInfoContent from './screen-info-content';
import {onDogovorClick} from '../../utils/dogovors';
import {connect} from 'react-redux';
import {compose, bindActionCreators} from 'redux';
import {
    getAppVersion,
} from '../../actions/';
import withClientService from '../hoc/with-client-service';
import {appVersion} from "../../settings";

class ScreenInfoApp extends Component {

    componentDidMount() {
        this.props.getAppVersion({confirm: true});
    }

    render() {
        return (
            <ScreenInfoContent title="Приложение">
                <div className="margin__5">Версия приложения: {appVersion}</div>
                <div className="margin__20">Связаться с разработчиком:&nbsp;
                    <a
                        href="mailto:ai@the-driver.ru"
                        className="dogovor-checkbox__link"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                            window.open(`mailto://ai@the-driver.ru`, '_system');
                            return false;
                        }}
                    >ai@the-driver.ru
                    </a>
                </div>
                <div className="margin__5">
                    <div
                        className="dogovor-checkbox__link"
                        onClick={() => {
                            onDogovorClick('https://yandex.ru/legal/maps_termsofuse/');
                        }}
                    >Условия использования Яндекс.Карт
                    </div>
                </div>
            </ScreenInfoContent>
        )
    }
};

const mapStateToProps = (state) => {
    return {}
}

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;

    return bindActionCreators({
        getAppVersion: getAppVersion(clientService),
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenInfoApp);
