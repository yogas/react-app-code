import React, {Component} from 'react';
import ScreenInner from './screen-inner';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {
    showPreloader,
    hidePreloader,
    setScreen,
    updateTarifs
} from '../../actions';
import TitleBack from '../title-back';
import withClientService from '../hoc/with-client-service';
import numeralize from 'numeralize-rus-ukr';
import TarifSlider from '../tarif-slider';

import {kmLimit} from "../../settings";

import "./screen-tarif.css";

class ScreenTarif extends Component {

    componentDidMount() {
        if(!this.props.tarifs.loaded) {
            this.props.showPreloader();
            this.props.clientService.getTarifs()
                .then((data) => {
                    console.log(data);
                    const {items} = data.result;

                    this.props.updateTarifs({
                        items,
                        selectedId: items[0].id,
                        loaded: true
                    });

                    this.props.hidePreloader();
                })
                .catch((error) => {
                    console.error(error);
                    this.props.updateTarifs({
                        items: [],
                        loaded: false
                    });
                    this.props.hidePreloader();
                });
        } else {
            this.props.updateTarifs({fromComments: false});
        }
    }

    onClickBack = () => {
        this.props.setScreen('map-address');
    };

    onTarifChange = (id) => () => {
        this.props.updateTarifs({selectedId: id});
    };

    onHoursChange = (hours) => () => {
        this.props.updateTarifs({hours});
    };

    onAutoRenewalChange = ({target: {checked}}) => {
        this.props.updateTarifs({autorenewal: checked});
    };

    onAdditionClick = (type='') => () => {
        if(type === 'comment') {
            this.props.updateTarifs({fromComments: true});
        }

        this.props.setScreen('addition');
    };

    onOrderClick = () => {
        this.props.setScreen('pay');
    };

    render() {

        const {
            loaded,
            items,
            selectedId,
            hours,
            autorenewal,
            total,
            additionSelectedId,
            additionComment
        } = this.props.tarifs;

        const props = {
            loaded,
            items,
            selectedId,
            _baseHostUrl: this.props.clientService._baseHostUrl,
            hours,
            autorenewal,
            total,
            additionSelectedId,
            additionComment,
            onClickBack: this.onClickBack,
            onTarifChange: this.onTarifChange,
            onHoursChange: this.onHoursChange,
            onAutoRenewalChange: this.onAutoRenewalChange,
            onAdditionClick: this.onAdditionClick,
            onOrderClick: this.onOrderClick
        };

        return (
            <ScreenInner>
                <Tarifs {...props} />
            </ScreenInner>
        );
    }
}

/**
 * Компонент отображения часов по тарифу
 */
const TarifHours = ({tarif, hoursSelected, autorenewal, onHoursChange, onAutoRenewalChange}) => {

    const hours = [5, 10];
    const km = tarif.name === 'Водитель' ? '' : '  (25 км)';
    const distance = tarif.name === 'Водитель' ? <div>&nbsp;</div>  : <React.Fragment>Поездки до {kmLimit[hoursSelected]} км</React.Fragment>;

    return (
        <div className="tarif-hours screen-tarif__hours text text_align_center">
            <div className="field-btn-group">
                {
                    hours.map((item, index) => {
                        const activeCls = hoursSelected===item?' field-btn-group__btn_active':'';
                        return (
                            <div
                                key={index}
                                className={`field-btn-group__btn${activeCls}`}
                                onClick={onHoursChange(item)}
                            >
                                <div className="field-btn-group__btn-label"><span className="text_weight_medium">{item}</span> часов</div>
                            </div>
                        );
                    })
                }
            </div>
            <div className="tarif-hours__time text text_size_smd text_color_white">{distance}</div>
            <div className="text text_size_smd text_color_white">Продление поездки:</div>
            <div className="tarif-hours__note text text_size_sm text_color_gray"><span className="text_color_gold">+</span> 1 час{km} - стоимость {tarif.additional_hour_price} рублей</div>
            <label className="field-checkbox field-checkbox_color_gold field-checkbox_style_box tarif-hours__checkbox hidden">
                <input
                    className="field-checkbox__field"
                    type="checkbox"
                    checked={autorenewal}
                    onChange={onAutoRenewalChange}
                /><b></b><span className="text text_size_smdd text_inline">
                <div className="text text_color_white">Автопродление</div></span>
            </label>
        </div>
    )
};

/**
 * Компонент отображени доп. услуг
 */
const Addition = ({additionSelectedId, additionComment, onAdditionClick}) => {
    const cnt = additionSelectedId.length;
    const additionCls = cnt ? '' : ' hidden';
    const additionText = `${cnt} ${numeralize.pluralize(cnt, ['услуга','услуги','услуг'])}`;
    const commentCls = additionComment === '' ? ' hidden' : '';

    return (
        <div className="tarif-addition screen-tarif__addition">
            <div className="tarif-addition__item">
                <div className="btn-icon tarif-addition__btn-icon" onClick={onAdditionClick()}>
                    <div className="icon icon_style_plus icon_inline btn-icon__icon"/>
                    <div className="btn-icon__note text text_size_xxs-s text_color_gray">Доп. услуги</div>
                    <div className={`btn-icon__content text text_size_xm-s text_color_white${additionCls}`}>{additionText}</div>
                </div>
            </div>
            <div className="tarif-addition__line"></div>
            <div className="tarif-addition__item">
                <div className="btn-icon tarif-addition__btn-icon" onClick={onAdditionClick('comment')}>
                    <div className="icon icon_style_comment icon_inline btn-icon__icon"/>
                    <div className="btn-icon__note text text_size_xxs-s text_color_gray">Комментарий</div>
                    <div className={`btn-icon__content text text_size_xm-s text_color_white${commentCls}`}>{additionComment}</div>
                </div>
            </div>
        </div>
    );
};

/**
 * Компонент отвечающий за отрисовку экрана тарфиов
 */
const Tarifs = (props) => {

    const {
        loaded,
        items,
        selectedId,
        _baseHostUrl,
        hours,
        autorenewal,
        total,
        additionSelectedId,
        additionComment,
        onClickBack,
        onTarifChange,
        onHoursChange,
        onAutoRenewalChange,
        onAdditionClick,
        onOrderClick
    } = props;

    if(!loaded) {
        return false;
    }

    const tarif = items.find(({id}) => id===selectedId);

    return (
        <div className="screen-tarif screen">
            <div className="screen-tarif__top wrap">
                <TitleBack
                    title="Тарифы"
                    onClickBack={onClickBack}
                />
                <TarifSlider
                    items={items}
                    tarif={tarif}
                    _baseHostUrl={_baseHostUrl}
                    onTarifChange={onTarifChange}
                />
                <div className="screen-tarif__center">
                    <TarifHours
                        tarif={tarif}
                        hoursSelected={hours}
                        autorenewal={autorenewal}
                        onHoursChange={onHoursChange}
                        onAutoRenewalChange={onAutoRenewalChange}
                    />
                </div>
            </div>
            <div className="screen-tarif__bottom wrap">
                <Addition
                    additionSelectedId={additionSelectedId}
                    additionComment={additionComment}
                    onAdditionClick={onAdditionClick}
                />
                <div
                    className="btn btn_style_border btn_size_md btn_width_fluent"
                    onClick={onOrderClick}
                >
                    <div className="btn__label">
                        <div className="btn__text"><span className="text text_weight_medium">{total}</span><span className="text text_weight_normal"> рублей</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

const mapStateToProps = (state) => {
    const {order, tarifs, loading} = state;
    return {
        order,
        tarifs,
        loading
    }
};

const mapDispatchToProps = {
    showPreloader,
    hidePreloader,
    setScreen,
    updateTarifs
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenTarif);
