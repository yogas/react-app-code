/**
 * Нужен для того, чтобы отлавливать ошибки в карте Yandex
 * Иначе ошибка в скрипте Yandex-карты ломает приложение
 */

import {Component} from 'react';

export default class MapErrorBoundry extends Component {
    state = {
        hasError: false
    };

    /**
     * Срабатывает если есть ошибка
     */
    componentDidCatch(error, info) {
        this.setState({hasError: true});
    }

    render() {
        return this.props.children;
    }
}
