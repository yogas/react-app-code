import React, {Component} from 'react';
import ScreenInner from './screen-inner';
import TitleBack from '../title-back';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {
    showPreloader,
    hidePreloader,
    setScreen,
    updateTarifs,
    updateAdditionService,
    updateAdditionComments
} from '../../actions';
import withClientService from '../hoc/with-client-service';
import {Popup, PopupContent, PopupButtons, PopupButton} from '../popup';

class ScreenAdditionContainer extends Component {

    state = {
        commentFocus: false
    };

    componentDidMount() {
        if(!this.props.tarifs.additionLoaded) {
            this.props.showPreloader();
            this.props.clientService.getAdditionServices()
                .then((data) => {
                    console.log(data);
                    this.props.updateTarifs({
                        addition: data.result.items,
                        additionLoaded: true
                    });
                    this.props.hidePreloader();
                })
                .catch((error) => {
                    console.log(error);
                    this.props.hidePreloader();
                });
        }
    }

    onClickBack = () => {
        this.props.setScreen('tarif');
    };

    onServiceChange = (id) => ({target: {checked}}) => {
        const type = checked?'add':'remove';

        this.props.updateAdditionService({id}, type);
        if(type === 'remove') {
            this.props.updateAdditionComments({id}, type);
        }

        const {
            comment_title=null
        } = this.props.tarifs.addition.find((el) => el.id===id);

        if(comment_title!==null && checked) {
            this.props.updateTarifs({
                additionDetailId: id,
                showCommentPopup: true,
                commentPopupTitle: comment_title
            });
        }
    };

    onInfoClick = (id) => () => {
        this.props.updateTarifs({additionDetailId: id});
        this.props.setScreen('dop-info');
    };

    onPopupOkeyClick = () => {
        const {additionDetailId, commentPopupText, commentPopupTitle} = this.props.tarifs;

        if(commentPopupText === '') {
            const id = additionDetailId;

            this.props.updateAdditionService({id}, 'remove');
            this.props.updateAdditionComments({id}, 'remove');
        } else {
            const comment = `${commentPopupTitle}: ${commentPopupText}`.toLowerCase();
            this.props.updateAdditionComments({
                id: additionDetailId,
                comment
            }, 'update');
        }

        this.props.updateTarifs({showCommentPopup: false});
    };

    onCommentChange = ({target: {value}}) => {
        this.props.updateTarifs({additionComment: value});
    };

    onPopupCommentChange = ({target: { value }}) => {
        this.props.updateTarifs({commentPopupText: value});
    };

    render() {
        const {
            additionLoaded,
            addition,
            additionSelectedId,
            commentPopupTitle,
            showCommentPopup,
            additionComment,
            comments,
            fromComments
        } = this.props.tarifs;

        const props = {
            loaded: additionLoaded,
            addition,
            additionSelectedId,
            additionComment,
            comments,
            fromComments,
            onClickBack: this.onClickBack,
            onServiceChange: this.onServiceChange,
            onInfoClick: this.onInfoClick,
            onCommentChange: this.onCommentChange
        };

        const popupProps = {
            popup: showCommentPopup,
            commentPopupTitle,
            onPopupOkeyClick: this.onPopupOkeyClick,
            onPopupCommentChange: this.onPopupCommentChange
        };

        return (
            <ScreenInner>
                <ScreenAddition {...props} />
                <CommentPopup {...popupProps} />
            </ScreenInner>
        );
    }
}

/**
 * Попап выбора даты
 */
const CommentPopup = ({popup=false, commentPopupTitle='', onPopupOkeyClick, onPopupCommentChange}) => {
    if(!popup) return false;

    return (
        <Popup>
            <PopupContent className="popup__content">
                <div className="popup-time-ok text_align_center text_color_white">
                    <div className="popup-time-ok__title text text_size_normal">{commentPopupTitle}:</div>
                    <div className="field-textarea field-textarea_style_filled">
                        <textarea
                            className="field-textarea__field"
                            autoFocus={true}
                            onChange={onPopupCommentChange}
                        />
                    </div>
                </div>
            </PopupContent>
            <PopupButtons>
                <PopupButton onClick={onPopupOkeyClick}>OK</PopupButton>
            </PopupButtons>
        </Popup>
    );
};

const AdditionServices = ({items, selectedId, comments, onServiceChange, onInfoClick}) => {
    console.log(comments);
    return (
        <div className="addition-tarifs screen-addition__tarifs wrap scrollable">
            <div className="addition-tarifs__list">
                {
                    items.map(({id, name, price, note='', info=''}, index) => {

                        let noteCls = note===null?' hidden':'';
                        const infoCls = info===null?' hidden':'';
                        const checked = selectedId.find((el) => el.id===id) ? true : false;

                        const comment = comments.find((el) => el.id===id);
                        if(comment) {
                            noteCls = '';
                            note = comment.comment;
                        }

                        let priceText = <React.Fragment><span className="text_color_gold">+</span> {price} рублей</React.Fragment>;
                        if(info.match(/~$/gi)) {
                            if(price === 0) {
                                priceText = 'Расчетная стоимость';
                            }
                        }

                        return (
                            <div key={index} className="addition-tarifs__item">
                                <label className="addition-tarifs__label">
                                    <div className="field-checkbox field-checkbox_style_round addition-tarifs__checkbox">
                                        <input
                                            className="field-checkbox__field"
                                            type="checkbox"
                                            checked={checked}
                                            onChange={onServiceChange(id)}
                                        /><b></b><span className="text text_size_smdd text_inline"></span>
                                    </div>
                                    <div className="addition-tarifs__desc">
                                        <div className="addition-tarifs__name">{name}</div>
                                        <div className="text text_size_sm text_color_gray">{priceText}</div>
                                        <div className={`text text_size_sm text_color_gray addition-tarifs__note${noteCls}`}>({note})</div>
                                    </div>
                                </label>
                                <div className={`addition-tarifs__info-icon${infoCls}`}>
                                    <div
                                        className="icon icon_style_info icon_inline addition-tarifs__info"
                                        onClick={onInfoClick(id)}
                                    />
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
};

/**
 * Компонент отображающий дополнительные услуги
 */
const ScreenAddition = (props) => {
    const {
        addition,
        additionSelectedId,
        additionComment,
        comments,
        fromComments,
        onClickBack,
        onServiceChange,
        onInfoClick,
        onCommentChange
    } = props;

    return (
        <div className="screen-addition screen">
            <div className="wrap">
                <TitleBack
                    title="Дополнительные услуги"
                    onClickBack={onClickBack}
                />
            </div>
            <div className="screen-addition__content">
                <div className="screen-addition__comment-wrap wrap">
                    <div className="addition-comment screen-addition__comment">
                        <div className="icon icon_style_comment-lg addition-comment__icon"></div>
                        <div className="field-textarea field-textarea_transparent field-textarea_resize_none addition-comment__comment">
                            <textarea
                                name="addition-comments"
                                className="field-textarea__field"
                                placeholder="Комментарии и пожелания"
                                autoFocus={fromComments}
                                value={additionComment}
                                onChange={onCommentChange}
                            />
                        </div>
                    </div>
                </div>
                <AdditionServices
                    items={addition}
                    selectedId={additionSelectedId}
                    comments={comments}
                    onServiceChange={onServiceChange}
                    onInfoClick={onInfoClick}
                />
            </div>
            <div className="screen-addition__footer">
                <div className="screen-addition__gradient"></div>
                <div
                    className="btn btn_style_border btn_size_md btn_width_fluent screen-addition__btn"
                    onClick={onClickBack}
                >
                    <div className="btn__label">
                        <div className="btn__text">Применить</div>
                    </div>
                </div>
            </div>
        </div>
    )
};

const mapStateToProps = (state) => {
    return {
        tarifs: state.tarifs
    };
};

const mapDispatchToProps = {
    showPreloader,
    hidePreloader,
    setScreen,
    updateTarifs,
    updateAdditionService,
    updateAdditionComments
};

export default compose(
    withClientService(),
    connect(mapStateToProps, mapDispatchToProps)
)(ScreenAdditionContainer);
