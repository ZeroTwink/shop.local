import React, {Component} from 'react';

class InfiniteScroll extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gds: [],
            waitLoadProduct: false
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleOnScroll.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleOnScroll);
    }

    handleOnScroll() {
        let scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
        let scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
        let clientHeight = document.documentElement.clientHeight || window.innerHeight;
        let scrolledToBottom = Math.ceil(scrollTop + clientHeight + 250) >= scrollHeight;

        if (scrolledToBottom) {
            this.props.loadMore(1);
        }
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        )
    }
}

export default InfiniteScroll;