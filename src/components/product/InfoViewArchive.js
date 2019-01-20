import React from 'react';
import * as UI from '@vkontakte/vkui';

const InfoViewArchive = props => (
    <UI.Group style={{background: "#fdfcea"}}>
        <UI.Div>
            Данное объявление является архивным. Объявление будет удалено в
            течении 7 дней, если владелец его не обновит.
        </UI.Div>

        {+props.vkUser.id === +props.product['id_vk']? (
            <UI.Div>
                <UI.Button onClick={props.restoreArchiveGds} size="xl">
                    Восстановить
                </UI.Button>
            </UI.Div>
        ) : null}
    </UI.Group>
);

export default InfoViewArchive;