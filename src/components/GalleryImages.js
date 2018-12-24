import React, {Component} from "react";
import * as UI from '@vkontakte/vkui';

import Hammerjs from 'hammerjs';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import * as sysActions from "../actions/sys";
import {connect} from "react-redux";

import VKConnect from '../utils/VKConnect';

class GalleryImages extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoadedImage: true
        };

        this.hammer = null;
        this.galleryItem = React.createRef();
        this.imageContainerRef = React.createRef();
        this.hudRef = React.createRef();

        this.imageUrl = 'https://source.unsplash.com/random';
        this.imageContainer = null;
        this.hud = null;

        this.minScale = 1;
        this.maxScale = 4;
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.containerWidth = 0;
        this.containerHeight = 0;
        this.displayImageX = 0;
        this.displayImageY = 0;
        this.displayImageScale = 1;

        this.displayDefaultWidth = undefined;
        this.displayDefaultHeight = undefined;

        this.rangeX = 0;
        this.rangeMaxX = 0;
        this.rangeMinX = 0;

        this.rangeY = 0;
        this.rangeMaxY = 0;
        this.rangeMinY = 0;

        this.displayImageRangeY = 0;

        this.displayImageCurrentX = 0;
        this.displayImageCurrentY = 0;
        this.displayImageCurrentScale = 1;

        this.displayImage = null;


        this.popstateHandler = this.popstateHandler.bind(this);

        this.resizeContainer = this.resizeContainer.bind(this);
    }

    componentDidMount() {
        window.removeEventListener('hashchange', this.popstateHandler, false);
        window.addEventListener('hashchange', this.popstateHandler, false);

        VKConnect.send("VKWebAppSetViewSettings", {"status_bar_style": "light", "action_bar_color": "#000000"});

        this.displayImage = this.galleryItem.current;
        this.imageContainer = this.imageContainerRef.current;
        this.hud = this.hudRef.current;

        this.rangeX = Math.max(0, this.displayDefaultWidth - this.containerWidth);
        this.rangeY = Math.max(0, this.displayDefaultHeight - this.containerHeight);


        this.hammer = new Hammerjs(this.galleryItem.current);

        window.addEventListener('resize', this.resizeContainer, true);

        this.imageContainer.addEventListener('wheel', e => {
            this.displayImageScale = this.displayImageCurrentScale = this.clampScale(this.displayImageScale + (e.wheelDelta / 800));
            this.updateRange();
            this.displayImageCurrentX = this.clamp(this.displayImageCurrentX, this.rangeMinX, this.rangeMaxX);
            this.displayImageCurrentY = this.clamp(this.displayImageCurrentY, this.rangeMinY, this.rangeMaxY);

            // this.displayImageX = this.displayImageCurrentX;
            // this.displayImageY = this.displayImageCurrentY;

            this.updateDisplayImage(this.displayImageCurrentX, this.displayImageCurrentY, this.displayImageScale);
        }, false);

        this.hammer.get('pinch').set({ enable: true });
        this.hammer.get('pan').set({ direction: Hammerjs.DIRECTION_ALL });

        this.hammer.on('pan', ev => {
            // console.log(this.displayImageX + ev.deltaX, this.rangeMaxX);
            // if(this.rangeMinX > this.displayImageX + ev.deltaX) {
            //     this.updateDisplayImage(this.displayImageX + ev.deltaX, this.displayImageCurrentY, this.displayImageScale);
            //     return;
            // }
            //
            // if(this.displayImageX + ev.deltaX > this.rangeMaxX) {
            //     this.updateDisplayImage(this.displayImageX + ev.deltaX, this.displayImageCurrentY, this.displayImageScale);
            //     return;
            // }

            this.displayImageCurrentX = this.clamp(this.displayImageX + ev.deltaX, this.rangeMinX, this.rangeMaxX);
            this.displayImageCurrentY = this.clamp(this.displayImageY + ev.deltaY, this.rangeMinY, this.rangeMaxY);
            this.updateDisplayImage(this.displayImageCurrentX, this.displayImageCurrentY, this.displayImageScale);
        });

        this.hammer.on('pinch pinchmove', ev => {
            this.displayImageCurrentScale = this.clampScale(ev.scale * this.displayImageScale);
            this.updateRange();
            this.displayImageCurrentX = this.clamp(this.displayImageX + ev.deltaX, this.rangeMinX, this.rangeMaxX);
            this.displayImageCurrentY = this.clamp(this.displayImageY + ev.deltaY, this.rangeMinY, this.rangeMaxY);
            this.updateDisplayImage(this.displayImageCurrentX, this.displayImageCurrentY, this.displayImageCurrentScale);
        });

        this.hammer.on('panend pancancel pinchend pinchcancel', () => {
            this.displayImageScale = this.displayImageCurrentScale;
            this.displayImageX = this.displayImageCurrentX;
            this.displayImageY = this.displayImageCurrentY;

            // this.updateDisplayImage(this.displayImageCurrentX, this.displayImageCurrentY, this.displayImageScale);
        });

        this.resizeContainer();
    }

    componentWillUnmount() {
        // window.removeEventListener('hashchange', this.popstateHandler, false);

        VKConnect.send("VKWebAppSetViewSettings", {"status_bar_style": "light", "action_bar_color": "#4473a9"});
    }

    popstateHandler(e) {
        let self = this;

        window.removeEventListener('hashchange', this.popstateHandler, false);
        console.log(self.props.urlChange);

        self.props.history.push(self.props.urlChange);
    }

    resizeContainer() {
        this.containerWidth = this.imageContainer.offsetWidth;
        this.containerHeight = this.imageContainer.offsetHeight;
        if (this.displayDefaultWidth !== undefined && this.displayDefaultHeight !== undefined) {
            this.displayDefaultWidth = this.displayImage.offsetWidth;
            this.displayDefaultHeight = this.displayImage.offsetHeight;
            this.updateRange();
            this.displayImageCurrentX = this.clamp( this.displayImageX, this.rangeMinX, this.rangeMaxX );
            this.displayImageCurrentY = this.clamp( this.displayImageY, this.rangeMinY, this.rangeMaxY );
            this.updateDisplayImage(
                this.displayImageCurrentX,
                this.displayImageCurrentY,
                this.displayImageCurrentScale );
        }
    }

    clamp(value, min, max) {
        return Math.min(Math.max(min, value), max);
    }

    clampScale(newScale) {
        return this.clamp(newScale, this.minScale, this.maxScale);
    }

    updateDisplayImage(x, y, scale) {
        // console.log(x, y, scale);
        const transform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0px) scale(' + scale + ',' + scale + ')';
        this.displayImage.style.transform = transform;
        this.displayImage.style.WebkitTransform = transform;
        this.displayImage.style.msTransform = transform;

        this.updateHud();
    }

    updateRange() {
        this.rangeX = Math.max(0, Math.round(this.displayDefaultWidth * this.displayImageCurrentScale) - this.containerWidth);
        this.rangeY = Math.max(0, Math.round(this.displayDefaultHeight * this.displayImageCurrentScale) - this.containerHeight);

        this.rangeMaxX = Math.round(this.rangeX / 2);
        this.rangeMinX = 0 - this.rangeMaxX;

        this.rangeMaxY = Math.round(this.rangeY / 2);
        this.rangeMinY = 0 - this.rangeMaxY;
    }

    updateHud() {
        let hudText = `<pre>
            <b>Current</b>
            <b>Scale:</b>     ${this.displayImageCurrentScale.toFixed(4)}
            <b>X:</b>         ${this.displayImageCurrentX}
            <b>Y:</b>         ${this.displayImageCurrentY}
            
            <b>Range</b>
            <b>rangeX:</b>    ${this.rangeX}
            <b>rangeMinX:</b> ${this.rangeMinX}
            <b>rangeMaxX:</b> ${this.rangeMaxX}
            
            <b>rangeY:</b>    ${this.rangeY}
            <b>rangeMinY:</b> ${this.rangeMinY}
            <b>rangeMaxY:</b> ${this.rangeMaxY}
            
            <b>Updated</b>
            <b>Scale:</b>     ${this.displayImageScale.toFixed(4)}
            <b>X:</b>         ${this.displayImageX}
            <b>Y:</b>         ${this.displayImageY}
            </pre>`;
        this.hud.innerHTML = hudText;
    }

    handleImageLoaded() {
        this.setState({
            isLoadedImage: false
        });

        this.imageWidth = this.displayImage.width;
        this.imageHeight = this.displayImage.height;
        this.displayImage.addEventListener('mousedown', e => e.preventDefault(), false);
        this.displayDefaultWidth = this.displayImage.offsetWidth;
        this.displayDefaultHeight = this.displayImage.offsetHeight;
    }

    clickClose() {
        this.props.setPopout(null);

        window.removeEventListener('hashchange', this.popstateHandler, false);
    }

    render() {
        const osname = UI.platform();

        return (
            <UI.PopoutWrapper v="center" h="center">
                <div className="imageGalleryMy">
                    <div ref={this.hudRef} id="hud">dsfds</div>
                    <div className="imageMask"/>

                    {this.state.isLoadedImage? (
                        <UI.Spinner style={{position: "relative", zIndex: 10}} />
                    ) : null}

                    <div className={UI.getClassName('headerGallery')}>
                        <div onClick={this.clickClose.bind(this)} className={UI.getClassName('button')}>
                            {osname === UI.IOS ? <Icon28ChevronBack fill="#fff"/> : <Icon24Back fill="#fff"/>}
                        </div>
                    </div>

                    <div ref={this.imageContainerRef} className="imageContainer">
                        <img ref={this.galleryItem} onLoad={this.handleImageLoaded.bind(this)} src={this.props.image} alt="" />
                    </div>
                </div>
            </UI.PopoutWrapper>
        )
    }
}

function mapStateToProps(state) {
    return {
        sys: state.sys
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setPopout: function (name) {
            dispatch(sysActions.setPopout(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GalleryImages);