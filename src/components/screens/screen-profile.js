import React, {Component} from 'react';
import {compose, bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import TitleBack from '../title-back';
import {
    showMenuScreen,
    hideMenuScreen,
    loadProfile,
    profileLogout
} from '../../actions';
import withClientService from '../hoc/with-client-service';
import {null2undefined} from '../../utils';
import {_appUrl} from '../../settings';

class ScreenProfile extends Component {

    componentDidMount() {
        if(!this.props.profile.loaded) {
            this.props.loadProfile();
        }
    }

    onClickBack = () => {
        this.props.hideMenuScreen();
    };

    onEditClick = () => {
        this.props.showMenuScreen('profile-edit');
    };

    onLogoutClick = () => {
        this.props.profileLogout();
    };

    render() {
        const {
            loaded,
            first_name = <div className="text_size_sm">не указано</div>,
            email = <div className="text_size_sm">не указано</div>,
            photo
        } = null2undefined(this.props.profile);

        let photoImage = `${_appUrl}/img/profile-no-img.svg`;
        if(photo) {
            photoImage = photo;
        }

        return (
            <div className="screen-profile screen">
                <div className="screen-profile__content wrap">
                    <TitleBack title="Профиль" onClickBack={this.onClickBack}/>
                    <ProfileFieldsContainer
                        loaded={loaded}
                        first_name={first_name}
                        phone={this.props.user.phone}
                        email={email}
                        photo={photoImage}
                        onEditClick={this.onEditClick}
                    />
                </div>
                <div className="screen-profile__footer wrap wrap_double">
                    <div
                        className="btn btn_style_filled btn_size_md btn_fluent btn_color_white btn_bg_white01"
                        onClick={this.onLogoutClick}
                    >
                        <div className="btn__label">
                            <div className="btn__text">
                                <div className="text text_size_md">Выйти из аккаунта</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const ProfileFields = (props) => {

    const {
        first_name,
        phone,
        email,
        photo,
        onEditClick
    } = props;

    return (
        <React.Fragment>
            <div className="screen-profile__photo" style={{backgroundImage: `url(${photo})`}}></div>
            <div className="screen-profile__fields screen-profile__fields_padding">
                <div className="profile-fields profile-fields_screen_profile">
                    <div className="profile-fields__row">
                        <div className="profile-fields__label text text_color_gray text_size_sm">Имя</div>
                        <div className="profile-fields__value text text_color_white text_size_slg">{first_name}</div>
                    </div>
                    <div className="profile-fields__row">
                        <div className="profile-fields__label text text_color_gray text_size_sm">Телефон</div>
                        <div className="profile-fields__value text text_color_white text_size_slg">{phone}</div>
                    </div>
                    <div className="profile-fields__row">
                        <div className="profile-fields__label text text_color_gray text_size_sm">Эл. почта</div>
                        <div className="profile-fields__value text text_color_white text_size_slg">{email}</div>
                    </div>
                </div>
            </div>
            <div className="text text_align_center">
                <div
                    className="btn btn_style_round btn_bg_gray btn_color_white screen-profile__edit-btn"
                    onClick={onEditClick}
                >
                    <div className="btn__label">
                        <div className="btn__text">
                            <div className="text text_size_sm">Изменить</div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

const ProfileFieldsContainer = (props) => {
    if(!props.loaded) return false;

    return <ProfileFields {...props} />;
};

const mapStateToProps = (state) => {
    return {
        profile: state.profile,
        user: state.user
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const {clientService} = ownProps;
    return bindActionCreators({
        showMenuScreen: showMenuScreen(),
        hideMenuScreen: hideMenuScreen(),
        loadProfile: loadProfile(clientService),
        profileLogout: profileLogout(clientService)
    }, dispatch);
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenProfile);