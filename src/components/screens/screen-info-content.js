import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import TitleBack from '../title-back';
import {
    showMenuScreen
} from '../../actions';

class ScreenInfoContent extends Component {

    onClickBack = () => {
        this.props.showMenuScreen('info');
    };

    render() {
        const {gradient = true} = this.props;

        return (
            <div className="screen-info screen">
                <div className="wrap">
                    <TitleBack title={this.props.title} onClickBack={this.onClickBack}/>
                </div>
                <div className="screen-info__content screen-info__dogovor-wrap">
                    <div className="screen-info__dogovor">
                        <div className="wrap text text_color_gray text_size_md text_lh_20">{this.props.children}</div>
                    </div>
                    {gradient ? <div className="screen-info__gradient"/> : false}
                </div>
            </div>
        );
    }
}

const mapStateToProps = () => {
    return {}
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        showMenuScreen: showMenuScreen()
    }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ScreenInfoContent);
