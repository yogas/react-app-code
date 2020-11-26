import React, {Component} from 'react';
import ScreenText from '../../components/screen-text';
import {connect} from 'react-redux';
import {
    setScreen
} from '../../actions';

class ScreenDopInfo extends Component {

    onClose = () => {
        this.props.setScreen('addition');
    };

    render() {

        const { addition, additionDetailId } = this.props.tarifs;
        let {name, info} = addition.find(({id}) => id===additionDetailId);

        info = info.replace(/~$/gi,'');

        const params = {
            title: name,
            text: info,
            onClose: this.onClose,
            btn: {show: false}
        };

        return (
            <ScreenText {...params} />
        )
    }
}

const mapStateToProps = (state) => {
    return {
        tarifs: state.tarifs
    };
};

const mapDispatchToProps = {
    setScreen
};

export default connect(mapStateToProps, mapDispatchToProps)(ScreenDopInfo);
