import React, {Component} from 'react';
import {compose, bindActionCreators} from 'redux';
import TitleBack from '../title-back';
import {
    showMenuScreen,
    loadTarifs
} from '../../actions';
import {connect} from 'react-redux';
import TarifSlider from '../tarif-slider';
import withClientService from '../hoc/with-client-service';
import Button from '../button';

import "./screen-info-tarif.css";

class ScreenInfoTarif extends Component {

    state = {
        selectedId: null
    };

    init = () => {
        this.setState({selectedId: this.props.tarifs.items[0].id});
    };

    componentDidMount() {
        if(!this.props.tarifs.loaded) {
            this.props.loadTarifs({
                preloaderHide: true,
                callback: this.init
            });
        } else {
            this.init();
        }
    }

    onClickBack = () => {
        this.props.showMenuScreen('info');
    };

    onTarifChange = (id) => () => {
        this.setState({selectedId: id});
    };

    onMoreInfoClick = () => {
        let options = [
            `hidden=no`,
            "location=no",
            "closebuttoncaption=Закрыть",
            "closebuttoncolor=#0070E9",
            "toolbarcolor=#0B1629",
            "hidenavigationbuttons=yes",
            "toolbar=yes",
            "cleardata=yes",
            "clearcache=yes",
            "clearsessioncache=yes",
            "enableViewportScale=yes",
            "zoom=no"
        ].join(',');
        window.open('https://the-driver.ru/tarifyi/', '_blank', options);
    };

    render() {
        return (
            <div className="screen-info screen">
                <div className="wrap">
                    <TitleBack title="Тарифы" onClickBack={this.onClickBack} />
                </div>
                <TarifSliderContainer
                    tarifs={this.props.tarifs}
                    selectedId={this.state.selectedId}
                    _baseHostUrl={this.props.clientService._baseHostUrl}
                    onTarifChange={this.onTarifChange}
                    onMoreInfoClick={this.onMoreInfoClick}
                />
            </div>
        );
    }
}

const TarifSliderContainer = ({tarifs, selectedId, _baseHostUrl, onTarifChange, onMoreInfoClick}) => {

    if(!tarifs.loaded || selectedId === null) return false;
    const current = tarifs.items.find(({id})=> id===selectedId);
    const {description = `Описание тарифа ${current.name}`} = current;

    const tarifSliderProps = {
        items: tarifs.items,
        tarif: current,
        _baseHostUrl,
        onTarifChange,
        cls: ' tarif-slider_info wrap screen-info__tarif-slider'
    };


    return (
        <React.Fragment>
            <div className="screen-info__content scrollable">
                <TarifSlider {...tarifSliderProps} />

                <div className="screen-info__dogovor">
                    <div
                        className="wrap text text_color_gray text_size_md text_lh_20"
                        dangerouslySetInnerHTML={{__html: description.split("\n").join("<br />")}}
                    >
                    </div>
                </div>
                <div className="screen-info__gradient"></div>
                <div className="screen-info__button-wrap wrap wrap-tb">
                    <Button title="Подробнее о тарифах" onClick={onMoreInfoClick} />
                </div>
            </div>

        </React.Fragment>
    )
};

const mapStateToProps = (state) => {
    return {
        tarifs: state.tarifs
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        showMenuScreen: showMenuScreen(),
        loadTarifs: loadTarifs(clientService)
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenInfoTarif);
