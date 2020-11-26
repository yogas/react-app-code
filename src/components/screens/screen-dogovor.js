import React, {Component} from 'react';
import ScreenText from '../../components/screen-text';
import {connect} from 'react-redux';
import {setScreen, updateUserAuth} from '../../actions';
import getDogovors, {onDogovorClick} from '../../utils/dogovors';

class ScreenDogovor extends Component {

    componentDidMount() {
        this.props.updateUserAuth({
            doc1: true,
            doc2: true,
            doc3: true
        })
    }

    onClose = () => {
        this.props.setScreen('contract');
    };

    isConfirmed = () => {
        const {
            doc1,
            doc2,
            doc3
        } = this.props.user;

        return doc1 && doc2 && doc3;
    };

    /**
     * Нужна для того, чтобы проверить подтвержение всех договоров при
     * изменении чекбокса, иначе редьюсер обновляется после того как
     * изменился чекбокс.
     * @param code
     * @param checked
     * @returns {*}
     */
    checkConfirmedAll = (code='', checked=false) => {
        const docs = ['doc1', 'doc2', 'doc3', 'doc4'];
        let confirmed = checked;
        docs.forEach((item) => {
            if(item !== code) {
                if(!this.props.user[item]) {
                    confirmed = false;
                }
            }
        });

        return confirmed;
    };

    onBtnClick = () => {
        if(this.isConfirmed()) {
            this.props.updateUserAuth({confirm: true});
            this.props.setScreen('contract');
        }
    };

    onChange = (code) => ({target: {checked}}) => {
        const confirm = this.checkConfirmedAll(code, checked);

        this.props.updateUserAuth({
            [code]: checked,
            confirm
        });
    };

    onLinkClick = (href) => () => {
        onDogovorClick(href, this.props.device.os);
        return false;
    };

    render() {

        const {
            doc1,
            doc2,
            doc3
        } = this.props.user;

        const params = {
            title: 'Документы',
            text: Dogovor({doc1, doc2, doc3, onChange: this.onChange, onLinkClick: this.onLinkClick}),
            onClose: this.onClose,
            btn: {
                show: true,
                text: 'Принять',
                disabled: !this.isConfirmed(),
                action: this.onBtnClick
            }
        };

        return (
            <ScreenText {...params} />
        )
    }
}

const Dogovor = ({doc1, doc2, doc3, onChange, onLinkClick}) => {
    const links = getDogovors(doc1, doc2, doc3);

    return (
        <div className="dogovor-checkbox">
            {links.map(({code, name, href, checked},idx) => {
               return (
                   <div key={idx} className="dogovor-checkbox__row">
                       <div className="field-checkbox field-checkbox_color_black field-checkbox_style_box">
                           <input
                               className="field-checkbox__field hidden"
                               type="checkbox"
                               onChange={onChange(code)}
                               checked={checked}
                           />
                           <i className="field-checkbox__checkbox hidden"><b/></i>
                           <span className="text text_size_smdd text_inline">
                                <span
                                    className="text__link dogovor-checkbox__link"
                                    onClick={onLinkClick(href)}
                                >{name}</span>
                            </span>
                       </div>
                   </div>
               )
            })}
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        user: state.user,
        device: state.device
    };
};

const mapDispatchToProps = {
    setScreen,
    updateUserAuth
}

export default connect(mapStateToProps, mapDispatchToProps)(ScreenDogovor);
