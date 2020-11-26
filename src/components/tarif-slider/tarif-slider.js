import React from 'react';
import AliceCarousel from 'react-alice-carousel';
import "react-alice-carousel/lib/alice-carousel.css";

/**
 * Компонент отображающий тарифы с изображениями
 */
const TarifSlider = ({items, tarif, _baseHostUrl, onTarifChange, cls=''}) => {
    //const img = _baseHostUrl + tarif.image;
    const index = items.findIndex(({id}) => id===tarif.id);
    console.log(index);

    return (
        <div className={`tarif-slider${cls}`}>
            <div className="tarif-slider__tabs">
                {
                    items.map(({id, name}, index) => {
                        const activeCls = id===tarif.id?' tarif-slider__tab_active':'';
                        return (
                            <div
                                key={index}
                                className={`tarif-slider__tab${activeCls}`}
                                onClick={onTarifChange(id)}
                            >
                                <div className="tarif-slider__tab-label">{name}</div>
                            </div>
                        )
                    })
                }
            </div>
            {/*<div className="tarif-slider__slide" style={{backgroundImage: `url(${img})`}}></div>*/}
            <AliceCarousel
                swipeDisabled={false}
                mouseDragEnabled={true}
                buttonsDisabled={true}
                dotsDisabled={true}
                slideToIndex={index}
                onSlideChanged={(event) => {
                    const item = items.find(({id},idx) => event.slide===idx);
                    onTarifChange(item.id)();
                }}
            >
                {
                    items.map(({image}, idx) => {
                       return (
                           <div
                               key={idx}
                               className="tarif-slider__slide"
                               style={{backgroundImage: `url(${_baseHostUrl}${image})`}}
                           />
                       )
                    })
                }
            </AliceCarousel>
        </div>
    );
};

export default TarifSlider;
