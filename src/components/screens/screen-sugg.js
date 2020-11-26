import React, {Component} from 'react';
import {Map, Placemark, withYMaps } from 'react-yandex-maps';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {showPreloader, hidePreloader, updateCoords, setScreen} from '../../actions';
import withClientService from '../hoc/with-client-service';
import {_appUrl, ymapsBizApiKey} from '../../settings';

class ScreenSugg extends Component {

    state = {
        TID: null
    };

    onClose = () => {
        this.props.setScreen('map-address');
    };

    arrNumber = (arr) => {
        return arr.map((item) => Number(item));
    };

    getSugg = (query) => () => {
        if(query !== '') {
            this.props.updateCoords({loading: true});

            this.props.ymaps.suggest(query, {provider: 'yandex#search'})
              .then((data) => {
                  const suggest = [];
                  for(let item of data) {
                      suggest.push({
                          name: item.displayName,
                          value: item.value,
                          type: item.type
                      })
                  }
                  this.props.updateCoords({suggest, loading: false});
              })
              .then((error) => {
                  console.error(error);
                  this.props.updateCoords({loading: false});
              })

        } else {
            this.props.updateCoords({suggest: [], loading: false});
        }
    };

    onChange = ({target: {value}}) => {
        this.props.updateCoords({suggest_address: value});

        clearTimeout(this.TID);
        this.TID = setTimeout(this.getSugg(value), 300);
    };

    onClear = () => {
        this.props.updateCoords({suggest: [], suggest_address: ''});
    };

    updateCoords = (address, coords) => {
        this.props.updateCoords({
            center: coords,
            placemark: coords,
            address
        });

        this.props.setScreen('map-address');
    }

    onSelectAddress = (address, value, type) => () => {

        switch (type) {
            case 'biz':
                const _ymapsUrl = 'https://search-maps.yandex.ru/v1/';
                const url = `${_ymapsUrl}?apikey=${ymapsBizApiKey}&text=${encodeURIComponent(value)}&type=biz&lang=ru_RU`;

                this.props.showPreloader();

                fetch(url)
                    .then( async (data) => {
                        const json = await data.json();
                        if(json.features.length) {
                            const {description} = json.features[0].properties;
                            const [lon, lat] = json.features[0].geometry.coordinates;
                            this.updateCoords(`${address}, ${description}`, [lat, lon]);
                        }

                        this.props.hidePreloader();
                    })
                  .catch((error) => {
                      console.log(error);
                      this.props.hidePreloader();
                  });

                break;

            case 'geo':
                this.props.showPreloader();
                this.props.clientService.ymapsGeocodeAddress(value)
                    .then((data) => {
                        if(data.statusCode === 200) {
                            const { featureMember } = data.response.GeoObjectCollection;
                            const items = [];
                            featureMember.forEach(({GeoObject}) => {
                                const { Point: { pos }} = GeoObject;
                                const [lon, lat] = this.arrNumber(pos.split(' '));

                                items.push([lat, lon]);
                            });

                            if(items.length) {
                                this.updateCoords(address, items[0]);
                            }
                        }

                        this.props.hidePreloader();
                    })
                    .catch((error) => {
                        console.log(error);
                        this.props.hidePreloader();
                    });
                break;

            default: return false;
        }
    };


    render() {
        const {
            zoom,
            center,
            placemark,
            suggest,
            suggest_address,
            loading
        } = this.props.coords;

        const clearCls = this.state.address === '' ? ' hidden' : '';
        const preloaderCls = loading ? ' field-input_preloader' : '';

        const screen = (
            <div className="screen-sugg">
                <Map
                    className="ymaps screen-map-address__ymaps"
                    state={{ center, zoom, controls: [] }}
                >
                    <Placemark
                        geometry={placemark}
                        defaultOptions={{
                            draggable: true,
                            iconLayout: 'default#image',
                            iconImageHref: `${_appUrl}/img/placemark.svg`,
                            iconImageSize: [68, 68],
                            iconImageOffset: [-33.5, -61]
                        }}
                    />
                </Map>
                <div className="screen-sugg__popup">
                    <div className="screen-sugg__content">
                        <div className="screen-sugg__header">
                            <div
                                className="screen-sugg__close icon icon_style_close"
                                onClick={this.onClose}
                            />
                            <div className={`field-input field-input_style_border-bottom field-input_clear screen-sugg__field${preloaderCls}`}>
                                <input
                                    className="field-input__field"
                                    type="text"
                                    placeholder="Введите ваш адрес"
                                    value={suggest_address}
                                    onChange={this.onChange}
                                />
                                <div className="field-input__preloader icon icon_style_preloader"/>
                                <div
                                    className={`field-input__clear-btn icon icon_style_del${clearCls}`}
                                    onClick={this.onClear}
                                />
                            </div>
                        </div>
                        <div className="screen-sugg__list">
                            {
                                suggest.map(({name, value, type}, idx) => {
                                    return (
                                        <div
                                            key={idx} className="screen-sugg__item"
                                            onClick={this.onSelectAddress(name, value, type)}
                                        >
                                            <div className="screen-sugg__addr">{name}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="text text_align_center">
                            <div
                                className="icon-text screen-sugg__set-on-map"
                                onClick={this.onClose}
                            >
                                <div className="icon-text__icon icon icon_style_map" />
                                <div className="icon-text__text text text_color_gold text_size_md">Указать на карте</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

        try {
            return screen;
        } catch(e) {
            alert(e);
            return false;
        }
    };
}

const mapStateToProps = (state) => {
    return {
        coords: state.coords
    }
};

const mapDispatchToProps = {
    setScreen,
    showPreloader,
    hidePreloader,
    updateCoords
};

export default compose(
    withYMaps,
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenSugg);
