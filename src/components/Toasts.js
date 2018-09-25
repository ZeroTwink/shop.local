import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';
import * as sysActions from '../actions/sys';

import './toasts.scss';

const baseClassNames = UI.getClassName('Toasts');

class Toasts extends Component {
    componentDidMount() {
        let view_popout = document.getElementsByClassName('View__popout')[0];

        view_popout.classList.add("Block_View__popout");

        setTimeout(() => {
            this.props.setPopout(null);
            view_popout.classList.remove("Block_View__popout");
        }, 3000);
    }

    render() {
        return (
            <div ref={(e) => this.el = e} className={baseClassNames}>
                {this.props.children}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setPopout: function (name) {
            dispatch(sysActions.setPopout(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Toasts);