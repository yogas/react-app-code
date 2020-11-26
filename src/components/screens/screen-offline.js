import React from 'react';
import {disptcherPhone} from '../../settings';

const ScreenOffline = () => {
    return (
        <div className="screen-inner">
            <div className="screen-inner__header">
                <div className="top-panel">
                    <div className="top-panel__wrap">
                        <div className="top-panel__side-item">
                        </div>
                        <div className="logo logo_size_sm top-panel__logo"/>
                        <div className="top-panel__helper top-panel__side-item"/>
                    </div>
                </div>
            </div>
            <div className="screen-inner__content">
                <div className="screen-info__menu text_align_center text_color_white">
                    <div className="wrap">
                        <div className="icon icon_style_alert icon_inline"/>
                        <div className="text_size_lg margin__10">Нет интернета</div>
                        <div className="text_size_md margin__20">Проверьте подключение к интернету или сделайте заказ по
                            телефону
                        </div>
                    </div>
                </div>
                <div className="wrap wrap-tb text_align_center">
                    <div className="btn btn_style_border btn_size_md btn_icon_call btn_width_fluent"
                         onClick={()=>{window.open(`tel://${disptcherPhone}`, '_system')}}
                    >
                        <div className="btn__label">
                            <div className="icon icon_style_call icon_inline btn__icon"/>
                            <div className="btn__text">Заказать по телефону</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ScreenOffline;
