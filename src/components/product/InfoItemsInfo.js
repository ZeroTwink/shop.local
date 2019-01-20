import React, {Component} from 'react';
import {connect} from 'react-redux';
import Moment from 'react-moment';
import * as UI from "@vkontakte/vkui/dist/vkui";

import Icon24helpOutline from '@vkontakte/icons/dist/24/help_outline';


import categories from "../../utils/categories";

class InfoItemsInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            displayAllText: false,
            tooltipHelp: false,
        };
    }

    substr(text) {
        if(!text) {
            text = "";
        }

        text = text.toString().replace(/(\r\n|\n\r|\r|\n){2,}/g, "\n\n");
        if(this.state.displayAllText) {
            return text;
        }

        let title = "";

        let t = text;
        if(text.length > 120) {
            t = text.slice(0, 120);

            title = "Показать полностью…";
        }

        let title2 = "";
        if(t.length < 1) {
            title2 = "Без описания";
        }

        return (
            <div>
                {t}
                <UI.Link onClick={() => this.setState({displayAllText: true})}>
                    {title? (<div>{title}</div>) : null}
                </UI.Link>
                {title2}
            </div>
        );
    }

    stateDisplayCheck(subShow = true) {
        let show = true;
        if(+this.props.product.category === 4 || +this.props.product.category === 7) {
            show = false;
        }

        if(+this.props.product.category && +this.props.product.subcategory === 9) {
            show = true;
        }

        if(+this.props.product.category === 1 && +this.props.product.subcategory === 2) {
            show = false;
        }

        if(!subShow) {
            show = false;
        }

        return show;
    }

    sizeDisplayCheck() {
        let show = false;

        if(this.props.product.size > 0) {
            show = true;
        }

        return show;
    }

    render() {
        return (
            <React.Fragment>
                <UI.List>
                    <UI.Cell>
                        <UI.InfoRow title="Дата публикации">
                            <Moment format="DD.MM.YYYY в H:mm" unix>
                                {(this.props.product.time - 60*60*3) + (60*60*this.props.vk.user['timezone'])}
                            </Moment>
                        </UI.InfoRow>
                    </UI.Cell>
                    {this.stateDisplayCheck()? (
                        <UI.Cell asideContent={
                            <UI.Tooltip
                                text="Состояние товара: Б/у оценивает продавец по пятибалльной системе.
                                            У новых товаров всегда 5 баллов"
                                isShown={this.state.tooltipHelp}
                                onClose={() => this.setState({ tooltipHelp: false })}
                                offsetX={16}
                                offsetY={10}
                                alignX="right"
                            >
                                <Icon24helpOutline fill={UI.colors.blue_400}
                                                   onClick={() => this.setState({
                                                       tooltipHelp: !this.state.tooltipHelp
                                                   })} />
                            </UI.Tooltip>
                        }>
                            <UI.InfoRow title="Состояние товара">
                                {this.props.product["state"]? "Новый" : "Б/у"}
                                <div style={{width: 90}}>
                                    <img src={"/images/stars/stars" + this.props.product["state_balls"] + ".png"}
                                         alt="" />
                                </div>
                            </UI.InfoRow>
                        </UI.Cell>
                    ) : null}
                    <UI.Cell>
                        <UI.InfoRow title="Страна">
                            {this.props.product['country_title']}
                        </UI.InfoRow>
                    </UI.Cell>
                    <UI.Cell>
                        <UI.InfoRow title="Город">
                            {this.props.product['city_title']}
                        </UI.InfoRow>
                    </UI.Cell>
                    <UI.Cell multiline>
                        <UI.InfoRow title="Вид товара">
                            <div style={{display: "inline-block",
                                background: "#ebf1f5",
                                borderRadius: 4,
                                margin: "4px 8px 4px 0",
                                padding: "4px 8px"}}>
                                {categories[this.props.product.category]['title']}
                            </div>
                            <div style={{display: "inline-block",
                                background: "#ebf1f5",
                                borderRadius: 4,
                                padding: "4px 8px"}}>
                                {categories[this.props.product.category]["sub"][this.props.product.subcategory]['title']}
                            </div>
                        </UI.InfoRow>
                    </UI.Cell>

                    {this.sizeDisplayCheck()? (
                        <UI.Cell>
                            <UI.InfoRow title="Размер">
                                {this.props.product['size']}
                            </UI.InfoRow>
                        </UI.Cell>
                    ) : null}

                    <UI.Cell multiline>
                        <UI.InfoRow title="Описание" />
                        <div style={{whiteSpace: "pre-line"}}>
                            {this.substr(this.props.product.description)}
                        </div>
                    </UI.Cell>
                </UI.List>
            </React.Fragment>
        );
    }
}

function mapStateToProps(state) {
    return {
        vk: state.vk
    }
}

export default connect(mapStateToProps)(InfoItemsInfo);