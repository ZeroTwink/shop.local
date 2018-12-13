import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';

// import VKConnect from '../utils/VKConnect';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';

class About extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }


    componentDidMount() {
        if(this.props.match.params.pId) {
            let id = document.getElementById(this.props.match.params.pId);

            if(!id) {
                return;
            }

            // VKConnect.send("VKWebAppScroll", {"top": id.offsetTop, "speed": 600});

            let timer = null;
            clearTimeout(timer);
            timer = setTimeout(() => {
                window.scrollTo(0, id.offsetTop);

                clearTimeout(timer);
            }, 500);
        }
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
                        Приложение представляет собой уникальную онлайн-площадку для публикования объявлений
                        о купле-продаже новых и подержанных товаров. Пользователи с легкостью могут выставить
                        на продажу или найти для приобретения такие виды товаров как: мебель, музыкальные
                        инструменты, спортивные товары, автомобили, детские товары, мотоциклы, фотоаппараты,
                        мобильные телефоны и многое другое.
                    </UI.Div>
                </UI.Group>

                <UI.Group>
                    <UI.Div>
                        Уникальность приложения заключается в том, что пользователи получают возможность
                        совершать покупки и продавать товары, не покидая официальное приложение «ВКонтакте».
                        Теперь отсутствует необходимость открывать сразу несколько сторонних приложений,
                        чем в разы ускоряется процедура использования и, что самое важное, значительно экономится
                        Ваше время.
                    </UI.Div>
                </UI.Group>

                <UI.Group id="archive" title="Архив">
                    <UI.Div>
                        Архив - место, куда попадает объявление по истечению 30 дней, с момента его публикации.
                        Объявление не будет отображаться ни в одной из имеющихся категорий.<br />

                        В архиве объявление хранится 7 дней, после чего оно безвозвратно удаляется.<br />

                        Владелец объявления в течении 7 дней может восстановить свое объявление, нажав
                        на кнопку "Восстановить".
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

export default connect(mapStateToProps)(About);