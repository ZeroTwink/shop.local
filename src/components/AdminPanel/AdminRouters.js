import React, {Component} from 'react';
import {Route} from 'react-router-dom';

export default class AdminRouters extends Component {
    render() {
        let {match} = this.props;

        console.log(match);
        return (
            <div>
                <div id="admin_wrapper">
                    <div id="content">
                        {/*<Route exact path={`${match.path}/:topicId`} component={CarsAdd}/>*/}
                        <Route path={match.path} render={() => <b>lol</b>}/>
                    </div>
                </div>
            </div>
        )
    }
}