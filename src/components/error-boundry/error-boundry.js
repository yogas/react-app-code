import React, {Component} from 'react';
import ErrorIndicator from '../error-indicator';

export default class ErrorBoundry extends Component {

    state = {
        hasError: false
    };

    /**
     * Срабатывает если есть ошибка
     */
    /*
    // Приходится отключить чтобы, Яндекс карта не выбрасывала ошибки
    // которые нет возможности пофиксить
    componentDidCatch(error, info) {
        this.setState({hasError: true});
    }
    */

    render() {
        if(this.state.hasError) {
            return <ErrorIndicator />;
        }

        return this.props.children;
    }
}