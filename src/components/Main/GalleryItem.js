import React, {Component} from 'react';

export default class GalleryItem extends Component {
    render() {
        let {ad, history} = this.props;

        let image = "";
        if(ad['images'] !== "") {
            image = ad["images"].split(",")[0];

            image = window.location.protocol + "//" + window.location.hostname +
                "/sys/files/gds/" + image;
        } else {
            image = "/images/no_photo_info.png";
        }

        let style = {
            backgroundSize: "cover",
            backgroundImage: "url("+image+")",
        };

        return (
            <div className="img_gallery_wrap" style={style}
                 onClick={() => (history.push("/product/" + ad.id))}>
                <div className="title_wrap">
                    <div className="title">
                        {ad.title}
                    </div>
                </div>
                <div className="price">
                    {ad.price} ₽
                </div>
            </div>
        );
    }
}