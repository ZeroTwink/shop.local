import React, {Component} from 'react';
import PropTypes from 'prop-types';

class InfiniteScroll extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showLoader: false,
            actionTriggered: false
        };

        this.onScrollListener = this.onScrollListener.bind(this)
    }

    componentDidMount() {
        window.addEventListener('scroll', this.onScrollListener);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.onScrollListener);
    }

    componentWillReceiveProps(props) {
        if (this.props.dataLength === props.dataLength) return;

        this.setState({
            showLoader: false,
            actionTriggered: false
        });
    }

    onScrollListener(event) {
        let target =
            this.props.height
                ? event.target
                : document.documentElement.scrollTop
                    ? document.documentElement
                    : document.body;

        if (this.state.actionTriggered) {
            return;
        }

        const clientHeight =
            target === document.body || target === document.documentElement
                ? window.screen.availHeight
                : target.clientHeight;

        // Если элементов не хватает для заполнения всего пространства
        // То есть нет прокрутки
        // console.log(target.scrollTop + clientHeight, target.scrollHeight - this.props.scrollThreshold);
        if(target.scrollHeight <= clientHeight) {
            return;
        }

        let atBottom = false;
        if(target.scrollTop + clientHeight >= target.scrollHeight - this.props.scrollThreshold) {
            atBottom = true;
        }

        if (atBottom && this.props.hasMore) {
            this.setState({
                actionTriggered: true,
                showLoader: true
            });
            this.props.loadMore();
        }
    }

    render() {
        return (
            <div>
                {this.props.children}
                {this.state.showLoader && this.props.hasMore && this.props.loader}
            </div>
        )
    }
}

export default InfiniteScroll;

InfiniteScroll.defaultProps = {
    scrollThreshold: 180
};

InfiniteScroll.propTypes = {
    loadMore: PropTypes.func,
    hasMore: PropTypes.bool,
    scrollThreshold: PropTypes.number,
    loader: PropTypes.node.isRequired,
    dataLength: PropTypes.number.isRequired
};