import React, {Component} from 'react';
import {compose, bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import TitleBack from '../title-back';
import {
    showPreloader,
    hidePreloader,
    showMenuScreen,
    hideMenuScreen,
    loadProfile,
    profileLogout,
    updateProfile,
    deleteProfilePhoto,
    showNotify
} from '../../actions';
import withClientService from '../hoc/with-client-service';
import {null2undefined} from '../../utils';
import {_appUrl} from '../../settings';
import loadImage from 'blueimp-load-image';

class ScreenProfileEdit extends Component {

    ref = null;

    state = {
        first_name: null,
        email: null,
        photo: null,
        uploadPhoto: null
    };

    init = () => {
        const {
            first_name,
            email,
            photo
        } = this.props.profile;

        this.setState({first_name, email, photo});
    };

    componentDidMount() {
        if(!this.props.profile.loaded) {
            this.props.loadProfile(() => {
                this.init();
            });
        } else {
            this.init();
        }
    }

    onClickBack = () => {
        this.props.hideMenuScreen();
    };

    onClickClose = () => {
        this.props.showMenuScreen('profile');
    };

    onClickPhotoEdit = () => {
        this.props.updateProfile({photoEdit: true});
    };

    onPhotoCancel = () => {
        this.props.updateProfile({photoEdit: false});
    };

    // Получение и повторо фотографии если необходимо
    preparePhoto = (photo) => {
        loadImage.parseMetaData(photo, (metaData) => {
            let orientation = 0;

            if(metaData.exif) {
                orientation = metaData.exif.get('Orientation');
            }

            loadImage(
                photo,
                (canvas) => {
                    //here's the base64 data result
                    const base64data = canvas.toDataURL('image/jpeg');
                    //here's example to show it as on imae preview
                    //const img_src = base64data.replace(/^data\:image\/\w+\;base64\,/, '');

                    this.setState({uploadPhoto: base64data, photo: base64data});
                    this.props.updateProfile({photoEdit: false});
                }, {
                    //should be set to canvas : true to activate auto fix orientation
                    canvas: true,
                    orientation: orientation
                }
            );
        });
    };

    onTakePhoto = () => {
        if(this.props.device.mobile) {
            const onSuccess = (imageData) => {
                const uploadPhoto = `data:image/jpeg;base64,${imageData}`;
                //this.setState({uploadPhoto, photo: uploadPhoto});

                this.preparePhoto(uploadPhoto);
            };

            const onFail = (message) => {
                alert('Failed because: ' + message);
            };

            window.navigator.camera.getPicture(onSuccess, onFail, {
                quality: 25,
                destinationType: navigator.camera.DestinationType.DATA_URL,
                correctOrientation: true
            });
        }
    };

    onChoicePhoto = () => {
        this.ref.click();
    };

    onPhotoFileChange = ({target: {files: [photo]}}) => {
        this.preparePhoto(photo);
    };

    onPhotoDelete = () => {
        this.props.deleteProfilePhoto(() => {
            this.setState({photo: null, uploadPhoto: null});
        });
    };

    onFormChange = (field) => ({target: {value=''}}) => {
        this.setState({[field]: value});
    };

    onClickSave = () => {
        const {
            first_name,
            email,
            uploadPhoto
        } = this.state;

        this.props.showPreloader();
        this.props.clientService.editProfile(
            {
                first_name,
                email,
                photo: uploadPhoto,
                //phone: this.props.user.client_id
            }
        )
            .then((data) => {
                if(data.statusCode === 204) {
                    let photo = this.state.photo;
                    if (this.state.uploadPhoto !== null) {
                        photo = this.state.uploadPhoto;
                    }

                    this.props.updateProfile({first_name, email, photo});
                    this.props.showMenuScreen('profile');
                }

                if(data.statusCode === 413) {
                    this.props.showNotify({
                        message: 'Слишком большой размер изображения'
                    })
                }

                this.props.hidePreloader();
                console.log(data);
            })
            .catch((error) => {
                console.log(error);
                this.props.hidePreloader();
            })
    };

    render() {

        const {
            photoEdit
        } = this.props.profile;

        const {
            first_name = '',
            email = ''
        } = null2undefined(this.state);

        const photoMenuProps = {
            photoEdit,
            onPhotoCancel: this.onPhotoCancel,
            onTakePhoto: this.onTakePhoto,
            onChoicePhoto: this.onChoicePhoto,
            onPhotoDelete: this.onPhotoDelete
        };

        let photoImage = `${_appUrl}/img/profile-no-img.svg`;
        if(this.state.photo) {
            photoImage = this.state.photo;
        }

        return (
            <div className="screen-profile screen">
                <div className="screen-profile__content wrap">
                    <TitleBack
                        title="Профиль"
                        onClickBack={this.onClickBack}
                        onClickClose={this.onClickClose}
                    />
                    <div
                        className="screen-profile__photo"
                        style={{backgroundImage: `url(${photoImage})`}}
                        onClick={this.onClickPhotoEdit}
                    ></div>
                    <div className="screen-profile__edit-photo text text_align_center">
                        <div
                            className="text text_color_blue text_size_sm text_inline text_pointer"
                            onClick={this.onClickPhotoEdit}
                        >Редактировать</div>
                    </div>
                    <input
                        className="unvisible"
                        type="file"
                        name="photo"
                        ref={(ref) => this.ref = ref }
                        onChange={this.onPhotoFileChange}
                    />
                    <div className="screen-profile__fields-edit">
                        <div className="profile-fields profile-fields_screen_profile-edit">
                            <div className="profile-fields__row">
                                <div className="profile-fields__row">
                                    <label className="field-input field-input_label field-input_fluent field-input_size_lg field-input_label_size_sm">
                                        <div className="field-input__label text text_size_sm">Имя</div>
                                        <input
                                            className="field-input__field"
                                            type="text"
                                            name="first_name"
                                            value={first_name}
                                            onChange={this.onFormChange('first_name')}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="profile-fields__row">
                                <div className="profile-fields__row">
                                    <label className="field-input field-input_label field-input_fluent field-input_size_lg field-input_label_size_sm">
                                        <div className="field-input__label text text_size_sm">Телефон</div>
                                        <input
                                            className="field-input__field text_color_gray"
                                            type="text"
                                            name="phone"
                                            value={this.props.user.phone}
                                            disabled
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="profile-fields__row">
                                <div className="profile-fields__row">
                                    <label className="field-input field-input_label field-input_fluent field-input_size_lg field-input_label_size_sm">
                                        <div className="field-input__label text text_size_sm">Эл. почта</div>
                                        <input
                                            className="field-input__field"
                                            type="email"
                                            name="email"
                                            value={email}
                                            onChange={this.onFormChange('email')}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="screen-profile__footer wrap wrap_double">
                    <div
                        className="btn btn_style_border btn_size_md btn_fluent btn_color_white btn_bg_white01"
                        onClick={this.onClickSave}
                    >
                        <div className="btn__label">
                            <div className="btn__text">
                                <div className="text text_size_md">Сохранить</div>
                            </div>
                        </div>
                    </div>
                </div>
                <PhotoMenuContainer {...photoMenuProps} />
            </div>
        );
    }
}

const PhotoMenu = ({onPhotoCancel, onTakePhoto, onChoicePhoto, onPhotoDelete}) => {
    return (
        <div className="photo-menu screen text_size_md">
            <div className="photo-menu__content"></div>
            <div className="photo-menu__footer wrap wrap_double screen-profile__footer">
                <div className="btn-group photo-menu__btn-group">
                    <div
                        className="btn btn_bg_white-solid btn_size_md btn_fluent btn_color_gray"
                        onClick={onTakePhoto}
                    >
                        <div className="btn__label">
                            <div className="btn__text">Снять фото</div>
                        </div>
                    </div>
                    <div
                        className="btn btn_bg_white-solid btn_size_md btn_fluent btn_color_gray"
                        onClick={onChoicePhoto}
                    >
                        <div className="btn__label">
                            <div className="btn__text">Выбрать фото</div>
                        </div>
                    </div>
                    <div
                        className="btn btn_bg_white-solid btn_size_md btn_fluent btn_color_gray"
                        onClick={onPhotoDelete}
                    >
                        <div className="btn__label">
                            <div className="btn__text">Удалить фото</div>
                        </div>
                    </div>
                </div>
                <div
                    className="btn btn_style_filled btn_bg_white-solid btn_size_md btn_fluent btn_color_blue"
                    onClick={onPhotoCancel}
                >
                    <div className="btn__label">
                        <div className="btn__text">Отменить</div>
                    </div>
                </div>
            </div>
        </div>
    )
};

const PhotoMenuContainer = (props) => {
    if(!props.photoEdit) return false;

    return <PhotoMenu {...props} />;
};

const mapStateToProps = (state) => {
    return {
        profile: state.profile,
        user: state.user,
        device: state.device
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        showPreloader,
        hidePreloader,
        showNotify,
        showMenuScreen: showMenuScreen(),
        hideMenuScreen: hideMenuScreen(),
        loadProfile: loadProfile(clientService),
        profileLogout: profileLogout(clientService),
        updateProfile: updateProfile,
        deleteProfilePhoto: deleteProfilePhoto(clientService)
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenProfileEdit);
