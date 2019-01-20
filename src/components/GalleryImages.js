import React, {Component} from "react";
import * as UI from '@vkontakte/vkui';

import Hammerjs from 'hammerjs';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Replay from '@vkontakte/icons/dist/24/replay';
import Icon24Delete from '@vkontakte/icons/dist/24/delete';
import Icon24Done from '@vkontakte/icons/dist/24/done';
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import Icon24LogoInstagram from '@vkontakte/icons/dist/24/logo_instagram';

import * as sysActions from "../actions/sys";
import {connect} from "react-redux";

import VKConnect from '../utils/VKConnect';
import axios from "../utils/axios";
import * as gdsActions from "../actions/gds";

class GalleryImages extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoadedImage: true,
            activeImage: 0
        };

        this.hammer = null;
        this.galleryItem = React.createRef();
        this.imageContainerRef = React.createRef();
        this.hudRef = React.createRef();
        this.imageContainerNextRef = React.createRef();
        this.imageContainerPrevRef = React.createRef();

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


        this.bubleTapScale = 0;

        this.swipe = false;


        this.rotate = 0;
        this.deleteButtons = false;
        this.setPreviewButtons = false;


        this.timeUpdate = 0;


        this.unBlock = null;


        this.allImages = this.props.allImages;


        this.activePreview = +this.props.product['image_preview'];

        this.popstateHandler = this.popstateHandler.bind(this);

        this.resizeContainer = this.resizeContainer.bind(this);

        this.onSwipe = this.onSwipe.bind(this);
    }

    componentDidMount() {
        if(this.props.activeImage) {
            this.setState({
                activeImage: +this.props.activeImage
            });
        }

        // window.removeEventListener('hashchange', this.popstateHandler, false);
        // window.addEventListener('hashchange', this.popstateHandler, false);

        this.unBlock = this.props.history.block((a, b) => {
            this.unBlock();

            this.props.setPopout(null);

            return false;
        });

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

            this.displayImageX = this.displayImageCurrentX;
            this.displayImageY = this.displayImageCurrentY;

            this.updateDisplayImage(this.displayImageCurrentX, this.displayImageCurrentY, this.displayImageScale);
        }, false);

        this.hammer.get('pinch').set({ enable: true });
        this.hammer.get('pan').set({ direction: Hammerjs.DIRECTION_ALL });

        this.hammer.on('tap', ev => {
            // console.log(ev.tapCount > 1 && !this.bubleTapScale);
            if(this.displayImageCurrentScale > this.maxScale / 2) {
                this.bubleTapScale = 1;
            }

            if(ev.tapCount > 1 && !this.bubleTapScale) {
                this.displayImageScale = this.displayImageCurrentScale = this.maxScale;
                this.updateRange();
                this.displayImageCurrentX = this.clamp(this.displayImageCurrentX, this.rangeMinX, this.rangeMaxX);
                this.displayImageCurrentY = this.clamp(this.displayImageCurrentY, this.rangeMinY, this.rangeMaxY);

                this.displayImageX = this.displayImageCurrentX;
                this.displayImageY = this.displayImageCurrentY;
                this.updateDisplayImage(this.displayImageCurrentX, this.displayImageCurrentY, this.displayImageCurrentScale);
                this.bubleTapScale = 1;

                return;
            }

            if(ev.tapCount > 1 && this.bubleTapScale) {
                this.displayImageScale = this.displayImageCurrentScale = this.minScale;
                this.updateRange();
                this.displayImageCurrentX = this.clamp(this.displayImageCurrentX, this.rangeMinX, this.rangeMaxX);
                this.displayImageCurrentY = this.clamp(this.displayImageCurrentY, this.rangeMinY, this.rangeMaxY);

                this.displayImageX = this.displayImageCurrentX;
                this.displayImageY = this.displayImageCurrentY;
                this.updateDisplayImage(this.displayImageCurrentX, this.displayImageCurrentY, this.displayImageCurrentScale);
                this.bubleTapScale = 0;
            }
        });

        this.hammer.on('swipeleft swiperight', this.onSwipe);

        this.hammer.on('pan', ev => {
            if(!this.swipe) {
                this.imageContainerPrevRef.current.style.transition = "";
                this.imageContainerNextRef.current.style.transition = "";
                this.displayImage.style.transition = "";
            }

            if(this.rangeMinX > this.displayImageX + ev.deltaX) {

                this.moveNextImage(ev);

                this.updateDisplayImage(this.displayImageX + ev.deltaX, this.displayImageCurrentY, this.displayImageScale);
                return;
            }

            if(this.displayImageX + ev.deltaX > this.rangeMaxX) {
                this.movePrevImage(ev);
                this.updateDisplayImage(this.displayImageX + ev.deltaX, this.displayImageCurrentY, this.displayImageScale);
                return;
            }

            this.displayImageCurrentX = this.clamp(this.displayImageX + ev.deltaX, this.rangeMinX, this.rangeMaxX);
            this.displayImageCurrentY = this.clamp(this.displayImageY + ev.deltaY, this.rangeMinY, this.rangeMaxY);
            this.updateDisplayImage(this.displayImageCurrentX, this.displayImageCurrentY, this.displayImageScale);
        });

        this.hammer.on('pinch pinchmove', ev => {
            this.imageContainerPrevRef.current.style.transition = "";
            this.imageContainerNextRef.current.style.transition = "";
            this.displayImage.style.transition = "";

            this.displayImageCurrentScale = this.clampScale(ev.scale * this.displayImageScale);
            this.updateRange();
            this.displayImageCurrentX = this.clamp(this.displayImageX + ev.deltaX, this.rangeMinX, this.rangeMaxX);
            this.displayImageCurrentY = this.clamp(this.displayImageY + ev.deltaY, this.rangeMinY, this.rangeMaxY);
            this.updateDisplayImage(this.displayImageCurrentX, this.displayImageCurrentY, this.displayImageCurrentScale);
        });

        this.hammer.on('panend pancancel pinchend pinchcancel', (ev) => {
            // let startPoint = ev.center.x - ev.deltaX;

            this.imageContainerPrevRef.current.style.transition = "200ms ease-in-out";
            this.imageContainerNextRef.current.style.transition = "200ms ease-in-out";
            this.displayImage.style.transition = "200ms ease-in-out";

            if(this.swipe) {
                return;
            }

            let replaceImage = false;

            if((this.displayImageX + ev.deltaX) - this.displayImageCurrentX < 0 - this.containerWidth * 40 / 100
                && ev.maxPointers < 2) {
                let transform = 'translateX(-'+ this.containerWidth +'px)';
                this.imageContainerNextRef.current.style.transform = transform;
                this.imageContainerNextRef.current.style.WebkitTransform = transform;
                this.imageContainerNextRef.current.style.msTransform = transform;

                replaceImage = true;

                this.replaceCurrentImage('next');
            }

            if((this.displayImageX + ev.deltaX) - this.displayImageCurrentX > this.containerWidth * 40 / 100
                && ev.maxPointers < 2) {
                let transform = 'translateX('+ this.containerWidth +'px)';
                this.imageContainerPrevRef.current.style.transform = transform;
                this.imageContainerPrevRef.current.style.WebkitTransform = transform;
                this.imageContainerPrevRef.current.style.msTransform = transform;

                replaceImage = true;

                this.replaceCurrentImage('prev');
            }

            if(!replaceImage) {
                let transform = 'translateX(0px)';
                this.imageContainerNextRef.current.style.transform = transform;
                this.imageContainerNextRef.current.style.WebkitTransform = transform;
                this.imageContainerNextRef.current.style.msTransform = transform;

                this.imageContainerPrevRef.current.style.transform = transform;
                this.imageContainerPrevRef.current.style.WebkitTransform = transform;
                this.imageContainerPrevRef.current.style.msTransform = transform;
            }


            this.displayImageScale = this.displayImageCurrentScale;
            this.displayImageX = this.displayImageCurrentX;
            this.displayImageY = this.displayImageCurrentY;

            this.updateDisplayImage(this.displayImageCurrentX, this.displayImageCurrentY, this.displayImageScale);
        });

        this.resizeContainer();
    }

    componentWillUnmount() {
        // window.removeEventListener('hashchange', this.popstateHandler, false);

        this.hammer = null;

        this.unBlock();
        this.unBlock = null;

        window.removeEventListener('resize', this.resizeContainer, true);

        VKConnect.send("VKWebAppSetViewSettings", {"status_bar_style": "light", "action_bar_color": "#4473a9"});
    }

    onSwipe(ev) {
        this.swipe = true;

        if(ev.type === "swipeleft") {
            let transform = 'translateX(-'+ this.containerWidth +'px)';
            this.imageContainerNextRef.current.style.transform = transform;
            this.imageContainerNextRef.current.style.WebkitTransform = transform;
            this.imageContainerNextRef.current.style.msTransform = transform;

            this.replaceCurrentImage('next');
        }

        if(ev.type === "swiperight") {
            let transform = 'translateX('+ this.containerWidth +'px)';
            this.imageContainerPrevRef.current.style.transform = transform;
            this.imageContainerPrevRef.current.style.WebkitTransform = transform;
            this.imageContainerPrevRef.current.style.msTransform = transform;

            this.replaceCurrentImage('prev');
        }

        this.displayImageScale = this.displayImageCurrentScale;
        this.displayImageX = this.displayImageCurrentX;
        this.displayImageY = this.displayImageCurrentY;

        this.updateDisplayImage(this.displayImageCurrentX, this.displayImageCurrentY, this.displayImageScale);
    }

    popstateHandler(e) {
        let self = this;

        window.removeEventListener('hashchange', this.popstateHandler, false);
        console.log(self.props.history.location.pathname);

        // if(self.props.history.location.pathname.indexOf('gallery') !== -1) {
        //     return;
        // }

        self.props.history.push(self.props.urlChange);

        // this.props.setPopout(null);
    }

    movePrevImage(ev) {
        if(this.swipe) {
            return;
        }

        let x = (ev.deltaX + this.displayImageX) - this.displayImageCurrentX;
        const transform = 'translateX(' + x + 'px)';
        this.imageContainerPrevRef.current.style.transform = transform;
        this.imageContainerPrevRef.current.style.WebkitTransform = transform;
        this.imageContainerPrevRef.current.style.msTransform = transform;

        this.imageContainerPrevRef.current.style.transition = "";
        this.displayImage.style.transition = "";
    }

    moveNextImage(ev) {
        if(this.swipe) {
            return;
        }

        let x = (this.displayImageX + ev.deltaX) - this.displayImageCurrentX;

        const transform = 'translateX(' + x + 'px)';
        this.imageContainerNextRef.current.style.transform = transform;
        this.imageContainerNextRef.current.style.WebkitTransform = transform;
        this.imageContainerNextRef.current.style.msTransform = transform;

        this.imageContainerNextRef.current.style.transition = "";
        this.displayImage.style.transition = "";
    }

    replaceCurrentImage(type) {
        // this.displayImage.src = 'http://shop.local/sys/files/gds/folder_2/post_92_1.jpg?v=0';

        if(type === "next" && !this.allImages[this.state.activeImage + 1]) {
            const transform = 'translateX(0px)';
            this.imageContainerNextRef.current.style.transform = transform;
            this.imageContainerNextRef.current.style.WebkitTransform = transform;
            this.imageContainerNextRef.current.style.msTransform = transform;

            this.swipe = false;

            return;
        }

        if(type === "prev" && !this.allImages[this.state.activeImage - 1]) {
            const transform = 'translateX(0px)';
            this.imageContainerPrevRef.current.style.transform = transform;
            this.imageContainerPrevRef.current.style.WebkitTransform = transform;
            this.imageContainerPrevRef.current.style.msTransform = transform;

            this.swipe = false;

            return;
        }

        this.displayImage.style.opacity = 0;

        let activeImage = 0;
        if(type === "next") {
            activeImage = this.state.activeImage + 1;
        } else {
            activeImage = this.state.activeImage - 1;
        }

        setTimeout(() => {
            this.setState({
                activeImage: activeImage,
                isLoadedImage: true
            });

            this.displayImage.style.opacity = 1;

            let transform = 'translateX(0px)';
            this.imageContainerNextRef.current.style.transform = transform;
            this.imageContainerNextRef.current.style.WebkitTransform = transform;
            this.imageContainerNextRef.current.style.msTransform = transform;

            transform = 'translateX(0px)';
            this.imageContainerPrevRef.current.style.transform = transform;
            this.imageContainerPrevRef.current.style.WebkitTransform = transform;
            this.imageContainerPrevRef.current.style.msTransform = transform;

            this.imageContainerPrevRef.current.style.transition = "";
            this.imageContainerNextRef.current.style.transition = "";
            this.displayImage.style.transition = "";

            this.minScale = 1;
            this.maxScale = 4;
            this.imageWidth = 0;
            this.imageHeight = 0;
            // this.containerWidth = 0;
            // this.containerHeight = 0;
            this.displayImageX = 0;
            this.displayImageY = 0;
            this.displayImageScale = 1;


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

            this.bubleTapScale = 0;

            this.swipe = false;

            this.resizeContainer();
        }, 200)
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
        let transform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0px) scale(' + scale + ',' + scale + ')';
        if(this.rotate) {
            transform += ' rotate('+ this.rotate +'deg)';
        }

        this.displayImage.style.transform = transform;
        this.displayImage.style.WebkitTransform = transform;
        this.displayImage.style.msTransform = transform;

        if(scale > this.minScale) {
            this.hammer.get('swipe').set({ enable: false });
        } else {
            this.hammer.get('swipe').set({ enable: true });
        }

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
        // this.hud.innerHTML = hudText;
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

    onRotate() {
        this.deleteButtons = false;
        this.setPreviewButtons = false;

        this.rotate = this.rotate + 90;

        this.hammer.get('swipe').set({ enable: false });
        this.hammer.get('pan').set({ enable: false });
        this.hammer.get('tap').set({ enable: false });
        this.hammer.get('pinch').set({ enable: false });

        window.removeEventListener('resize', this.resizeContainer, true);

        if(this.rotate >= 360 || this.rotate === 0) {
            this.rotate = 0;

            this.hammer.get('swipe').set({ enable: true });
            this.hammer.get('pan').set({ enable: true });
            this.hammer.get('tap').set({ enable: true });
            this.hammer.get('pinch').set({ enable: true });

            window.addEventListener('resize', this.resizeContainer, true);
        }

        const transform = 'rotate('+ this.rotate +'deg)';

        this.displayImage.style.transform = transform;
        this.displayImage.style.WebkitTransform = transform;
        this.displayImage.style.msTransform = transform;

        this.forceUpdate();
    }

    rotateApple() {
        this.setState({
            isLoadedImage: true
        });

        axios.get("/api/save_rotate_image.php", {
            params: {
                id: this.props.match.params.pId,
                rotate: this.rotate,
                id_img: this.state.activeImage
            }
        }).then(res => {
            let gdsOpen = [...this.props.gds['open']];
            let upOpen = gdsOpen.map((e, i) => {
                if(+e['id'] === +this.props.match.params.pId) {
                    e['time_update'] = res.data.response['time_update'];
                    return e;
                }

                return e;
            });

            let gdsNew = [...this.props.gds['gds_new']];
            let upGdsNew = gdsNew.map((e, i) => {
                if(+e['id'] === +this.props.match.params.pId) {
                    e['time_update'] = res.data.response['time_update'];
                    return e;
                }

                return e;
            });

            this.props.gdsUpdate({
                "open": upOpen,
                "gds_new": upGdsNew
            });

            this.timeUpdate = res.data.response['time_update'];

            let path = window.location.protocol + "//" + window.location.hostname + "/sys/files/gds/";

            this.displayImage.src = path + this.allImages[this.state.activeImage] + "?v="
                + res.data.response['time_update'];

            this.hammer.get('swipe').set({ enable: true });
            this.hammer.get('pan').set({ enable: true });
            this.hammer.get('tap').set({ enable: true });
            this.hammer.get('pinch').set({ enable: true });

            window.addEventListener('resize', this.resizeContainer, true);

            this.rotate = 0;

            const transform = 'rotate(0deg)';
            this.displayImage.style.transform = transform;
            this.displayImage.style.WebkitTransform = transform;
            this.displayImage.style.msTransform = transform;

            this.forceUpdate();

        }).catch(error => {
            console.log(error);
        });
    }

    rotateCancel() {
        this.rotate = 0;

        window.addEventListener('resize', this.resizeContainer, true);

        const transform = 'rotate('+ this.rotate +'deg)';

        this.displayImage.style.transform = transform;
        this.displayImage.style.WebkitTransform = transform;
        this.displayImage.style.msTransform = transform;

        this.hammer.get('swipe').set({ enable: true });
        this.hammer.get('pan').set({ enable: true });
        this.hammer.get('tap').set({ enable: true });
        this.hammer.get('pinch').set({ enable: true });

        this.forceUpdate();
    }

    onDelete() {
        this.rotate = 0;
        this.setPreviewButtons = false;

        this.deleteButtons = true;

        window.removeEventListener('resize', this.resizeContainer, true);

        this.hammer.get('swipe').set({ enable: false });
        this.hammer.get('pan').set({ enable: false });
        this.hammer.get('tap').set({ enable: false });
        this.hammer.get('pinch').set({ enable: false });

        this.forceUpdate();
    }

    deleteCancel() {
        this.deleteButtons = false;

        window.addEventListener('resize', this.resizeContainer, true);

        this.hammer.get('swipe').set({ enable: true });
        this.hammer.get('pan').set({ enable: true });
        this.hammer.get('tap').set({ enable: true });
        this.hammer.get('pinch').set({ enable: true });

        this.forceUpdate();
    }

    deleteApple() {
        this.setState({
            isLoadedImage: true
        });

        axios.get("/api/delete_image_product.php", {
            params: {
                id: this.props.match.params.pId,
                id_img: this.state.activeImage
            }
        }).then(res => {
            let gdsOpen = [...this.props.gds['open']];
            let upOpen = gdsOpen.map((e, i) => {
                if(+e['id'] === +this.props.match.params.pId) {
                    e['time_update'] = res.data.response['time_update'];
                    e['images'] = res.data.response['images'];
                    return e;
                }

                return e;
            });

            this.allImages = res.data.response['images'].split(",");

            if(!res.data.response['images']) {
                this.allImages = [];

                this.props.setPopout(null);

                return;
            }

            this.timeUpdate = res.data.response['time_update'];

            this.deleteButtons = false;

            this.props.gdsUpdate({
                "open": upOpen
            });

            let activeImage = 0;
            if(this.allImages[this.state.activeImage]) {
                activeImage = this.state.activeImage;
            } else {
                activeImage = this.state.activeImage - 1;
            }

            this.setState({
                activeImage: activeImage
            });


            this.hammer.get('swipe').set({ enable: true });
            this.hammer.get('pan').set({ enable: true });
            this.hammer.get('tap').set({ enable: true });
            this.hammer.get('pinch').set({ enable: true });

            window.addEventListener('resize', this.resizeContainer, true);

        }).catch(error => {
            console.log(error);
        });
    }

    onSetPreview() {
        if(this.activePreview === this.state.activeImage) {
            return;
        }

        this.rotate = 0;
        this.deleteButtons = false;

        this.setPreviewButtons = true;

        window.removeEventListener('resize', this.resizeContainer, true);

        this.hammer.get('swipe').set({ enable: false });
        this.hammer.get('pan').set({ enable: false });
        this.hammer.get('tap').set({ enable: false });
        this.hammer.get('pinch').set({ enable: false });

        this.forceUpdate();
    }

    setPreviewCancel() {
        this.setPreviewButtons = false;

        window.addEventListener('resize', this.resizeContainer, true);

        this.hammer.get('swipe').set({ enable: true });
        this.hammer.get('pan').set({ enable: true });
        this.hammer.get('tap').set({ enable: true });
        this.hammer.get('pinch').set({ enable: true });

        this.forceUpdate();
    }

    setPreviewApple() {
        this.setState({
            isLoadedImage: true
        });

        axios.get("/api/set_preview_image.php", {
            params: {
                id: this.props.match.params.pId,
                id_img: this.state.activeImage
            }
        }).then(res => {
            let gdsNew = [...this.props.gds['gds_new']];
            let gdsOpen = [...this.props.gds['open']];

            let indexOnArr = null;
            gdsNew.filter((e, i) => {
                if(+e.id === +this.props.match.params.pId) {
                    indexOnArr = i;
                    return true;
                }

                return false;
            });
            if(indexOnArr !== null) {
                gdsNew[indexOnArr]['image_preview'] = this.state.activeImage;
            }

            let indexOnArrOpen = null;
            gdsOpen.filter((e, i) => {
                if(+e.id === +this.props.match.params.pId) {
                    indexOnArrOpen = i;
                    return true;
                }

                return false;
            });
            if(indexOnArrOpen !== null) {
                gdsOpen[indexOnArrOpen]['image_preview'] = this.state.activeImage;
            }

            if(indexOnArr !== null || indexOnArrOpen !== null) {
                this.props.gdsUpdate({
                    "gds_new": gdsNew,
                    "open": gdsOpen
                });
            }

            this.activePreview = this.state.activeImage;

            this.setPreviewButtons = false;

            this.setState({
                isLoadedImage: false
            });


            this.hammer.get('swipe').set({ enable: true });
            this.hammer.get('pan').set({ enable: true });
            this.hammer.get('tap').set({ enable: true });
            this.hammer.get('pinch').set({ enable: true });

            window.addEventListener('resize', this.resizeContainer, true);

        }).catch(error => {
            console.log(error);
        });
    }

    render() {
        const osname = UI.platform();

        let timeUpdate = this.timeUpdate? this.timeUpdate : this.props.timeUpdate;

        let path = window.location.protocol + "//" + window.location.hostname + "/sys/files/gds/";

        let activeImage = path + this.allImages[this.state.activeImage] + "?v=" + timeUpdate;
        let nextImage = null;
        if(this.allImages[this.state.activeImage + 1]) {
            nextImage = path + this.allImages[this.state.activeImage + 1] + "?v=" + timeUpdate;
        }

        let prevImage = null;
        if(this.allImages[this.state.activeImage - 1]) {
            prevImage = path + this.allImages[this.state.activeImage - 1] + "?v=" + timeUpdate;
        }

        let access = +this.props.product['id_vk'] === +this.props.vk.user.id;

        return (
            <UI.PopoutWrapper v="center" h="center">
                <div className="imageGalleryMy">
                    {/*<div ref={this.hudRef} id="hud">dsfds</div>*/}
                    <div className="imageMask"/>

                    {this.state.isLoadedImage? (
                        <UI.Spinner style={{position: "relative", zIndex: 10}} />
                    ) : null}

                    <div className={UI.getClassName('headerGallery')}>
                        <div onClick={this.clickClose.bind(this)} className={UI.getClassName('button')}>
                            {osname === UI.IOS ? <Icon28ChevronBack fill="#fff"/> : <Icon24Back fill="#fff"/>}
                        </div>

                        <div style={{color: "#fff", marginLeft: 20}}>
                            {this.state.activeImage + 1 + " из " + this.allImages.length}
                        </div>
                    </div>

                    {prevImage? (
                        <div ref={this.imageContainerPrevRef} className="imageContainerPrev">
                            <img src={prevImage} alt="" />
                        </div>
                    ) : (
                        <div ref={this.imageContainerPrevRef} className="imageContainerPrev">

                        </div>
                    )}

                    <div ref={this.imageContainerRef} className="imageContainer">
                        <img ref={this.galleryItem}
                             onLoad={this.handleImageLoaded.bind(this)} src={activeImage} alt="" />
                    </div>

                    {nextImage? (
                        <div ref={this.imageContainerNextRef} className="imageContainerNext">
                            <img src={nextImage} alt="" />
                        </div>
                    ) : (
                        <div ref={this.imageContainerNextRef} className="imageContainerNext">

                        </div>
                    )}

                    {this.rotate? (
                        <React.Fragment>
                            <div className="textByButtons">
                                Применить поворот?
                            </div>
                            <div className="buttonsAppleWrap">
                                <div onClick={this.rotateApple.bind(this)} className="buttonsAppleItem">
                                    <div className="item_apple_in">
                                        <Icon24Done fill="#346CAD"/>
                                    </div>
                                </div>
                                <div onClick={this.rotateCancel.bind(this)} className="buttonsAppleItem">
                                    <div className="item_apple_in">
                                        <Icon24Cancel fill="#346CAD"/>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    ) : null}

                    {this.deleteButtons? (
                        <React.Fragment>
                            <div className="textByButtons">
                                Удалить фотографию?
                            </div>
                            <div className="buttonsAppleWrap">
                                <div onClick={this.deleteApple.bind(this)} className="buttonsAppleItem">
                                    <div className="item_apple_in">
                                        <Icon24Done fill="#346CAD"/>
                                    </div>
                                </div>
                                <div onClick={this.deleteCancel.bind(this)} className="buttonsAppleItem">
                                    <div className="item_apple_in">
                                        <Icon24Cancel fill="#346CAD"/>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    ) : null}

                    {this.setPreviewButtons? (
                        <React.Fragment>
                            <div className="textByButtons">
                                Установить фотографию как превью?
                            </div>
                            <div className="buttonsAppleWrap">
                                <div onClick={this.setPreviewApple.bind(this)} className="buttonsAppleItem">
                                    <div className="item_apple_in">
                                        <Icon24Done fill="#346CAD"/>
                                    </div>
                                </div>
                                <div onClick={this.setPreviewCancel.bind(this)} className="buttonsAppleItem">
                                    <div className="item_apple_in">
                                        <Icon24Cancel fill="#346CAD"/>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    ) : null}

                    {access? (
                        <div className="imageFooter">
                            <div className="footerItem" onClick={this.onRotate.bind(this)}>
                                <div className="item_in">
                                    <Icon24Replay/>
                                </div>
                            </div>
                            <div className="footerItem" onClick={this.onDelete.bind(this)}>
                                <div className="item_in">
                                    <Icon24Delete/>
                                </div>
                            </div>
                            <div className="footerItem" onClick={this.onSetPreview.bind(this)}>
                                <div className="item_in">
                                    <Icon24LogoInstagram
                                        fill={this.activePreview === this.state.activeImage? "#72e677" : ""}/>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </UI.PopoutWrapper>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        gds: state.gds,
        sys: state.sys
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setPopout: function (name) {
            dispatch(sysActions.setPopout(name))
        },
        gdsUpdate: function (name) {
            dispatch(gdsActions.gdsUpdate(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GalleryImages);