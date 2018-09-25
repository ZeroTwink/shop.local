import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';

class Filters extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }


    componentDidMount() {

    }

    render() {
        const osname = UI.platform();

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader
                    left={<UI.HeaderButton onClick={() => this.props.history.goBack()}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    О приложении
                </UI.PanelHeader>

                <UI.Group>
                    <UI.Div>
                        {`«ZSboard» — новейшее приложение, созданное на базе недавно опубликованной платформы «ВКонтакте» (VK apps).`}
                    </UI.Div>
                </UI.Group>

                <UI.Group>
                    <UI.Div>
                        Приложение представляет собой уникальную онлайн-площадку для опубликования объявлений
                        о купле-продаже новых и подержанных товаров. Пользователи с легкостью могут выставить
                        на продажу или найти для приобретения такие виды товаров как: мебель, музыкальные
                        инструменты, спортивные товары, автомобили, детские товары, мотоциклы, фотоаппараты,
                        мобильные телефоны и многое другое
                    </UI.Div>
                </UI.Group>

                <UI.Group>
                    <UI.Div>
                        Уникальность приложения заключается в том, что пользователи получают возможность
                        совершать покупки и продавать товары, не покидая официальное приложения «ВКонтакте».
                        Теперь отсутствует необходимость открывать сразу несколько сторонних приложений,
                        чем в разы ускоряется процедура использования и, что самое важное, значительно экономится
                        Ваше время.
                    </UI.Div>
                </UI.Group>
            </UI.Panel>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        vk: state.vk
    }
}

export default connect(mapStateToProps)(Filters);