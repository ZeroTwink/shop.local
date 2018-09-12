import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from '../../utils/axios';
import * as UI from '@vkontakte/vkui';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Camera from '@vkontakte/icons/dist/24/camera';

import '@vkontakte/vkui/dist/vkui.css';
import './addProduct.scss';

class AddProduct extends Component {
    constructor(props) {
        super(props);

        this.state = {
            arrImagesLoad: [],
            priceInputValue: "",
            titleInputValue: "",
            descriptionInputValue: "",
            stateProductInputValue: 0,
            stateBallsInputValue: 3
        };

        this.formData = null;
    }


    componentDidMount() {
        this.formData = new FormData();

        let arr = [];
        for(let i = 0; i < 5; i++) {
            let data = {
                image: null,
                file: null
            };
            arr.push(data);
        }

        this.setState({
            arrImagesLoad: arr
        });
    }

    getOptionsSelect () {
        let options = [];
        for (let i = 1; i <= 5; i++) {
            options.push(<option value={`${i}`} key={`${i}`}>{i}</option>)
        }
        return options;
    }

    onChangePrice(e) {
        let val = e.target.value.replace(/[^\d]/g, '');

        this.setState({
            priceInputValue: val
        });
    }

    onChangeTitle(e) {
        this.setState({
            titleInputValue: e.target.value
        });
    }

    onChangeDescription(e) {
        this.setState({
            descriptionInputValue: e.target.value
        });
    }

    onChangeStateProduct(e) {
        let stateBalls = 3;

        if(+e.target.value === 1) {
            stateBalls = 5;
        }

        this.setState({
            stateProductInputValue: +e.target.value,
            stateBallsInputValue: stateBalls
        });
    }

    onChangeStateBalls(e) {
        this.setState({
            stateBallsInputValue: +e.target.value
        });
    }

    imageReadPriv(file, cb, errCb) {
        if(!file.type.startsWith('image/')) {
            errCb({
                error_code: 1,
                message: "Тип файла не является картинкой"
            });
            return;
        }

        let img = document.createElement("img");
        img.file = file;

        let reader = new FileReader();
        reader.onload = ((aImg) => {
            return (e) => {
                aImg.src = e.target.result;

                cb(e.target.result);
            };
        })(img);

        reader.readAsDataURL(file);
    }

    submitForm() {
        for(let i = 0; i < 5; i++) {
            if(this.state.arrImagesLoad[i]['file'] !== null) {
                this.formData.append('img[]', this.state.arrImagesLoad[i]['file']);
            }
        }

        if(this.state.priceInputValue !== "") {
            this.formData.append('price', this.state.priceInputValue);
        } else {
            // TODO сообщение об ошибке
            console.log("Не заполнено поле название");
            return;
        }

        if(this.state.titleInputValue.length > 2) {
            this.formData.append('title', this.state.titleInputValue);
        } else {
            // TODO сообщение об ошибке
            console.log("Не заполнено поле название");
            return;
        }

        this.formData.append('state', this.state.stateProductInputValue);

        if(this.state.stateBallsInputValue !== "") {
            this.formData.append('state_balls', this.state.stateBallsInputValue);
        } else {
            // TODO сообщение об ошибке
            console.log("Не заполнено поле название");
            return;
        }

        this.formData.append('description', this.state.descriptionInputValue);

        axios({
            method: 'post',
            url: "/api/add_product.php",
            data: this.formData,
            config: { headers: {'Content-Type': 'multipart/form-data' }}
        })
        .then((response) => {
            this.props.history.push("/product/" + response.data.response["id_product"]);
        })
        .catch((response) => {
            console.log(response);
        });
    }

    fileChange(e) {
        let file = e.target.files[0];

        this.imageReadPriv(e.target.files[0], (img) => {
            let arr = [...this.state.arrImagesLoad];

            for(let i = 0; i < 5; i++) {
                if(arr[i]['image'] === null) {
                    arr[i]['image'] = img;
                    arr[i]['file'] = file;

                    break;
                }
            }

            this.setState({
                arrImagesLoad: arr
            });
        }, (error) => {
            console.log(error);
        });
    }

    deleteFileImgPriv(i) {
        let arr = [...this.state.arrImagesLoad];

        arr[i]['image'] = null;
        arr[i]['file'] = null;

        this.setState({
            arrImagesLoad: arr
        });
    }

    render() {
        const osname = UI.platform();

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader
                    left={<UI.HeaderButton onClick={() => this.props.history.goBack()}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    Добавить объявление
                </UI.PanelHeader>

                <UI.Group title="Фотографии">
                    <UI.FormLayout>
                        <UI.Input type="text" top={<span>Цена ₽ <span style={{color: "#4CAF50"}}>*</span></span>}
                                  value={this.state.priceInputValue}
                                  onChange={this.onChangePrice.bind(this)} />

                        <UI.Input type="text" top={<span>Название <span style={{color: "#4CAF50"}}>*</span></span>}
                                  onChange={this.onChangeTitle.bind(this)} />

                        <div top={<span>Состояние товара <span style={{color: "#4CAF50"}}>*</span></span>} onChange={this.onChangeStateProduct.bind(this)}>
                            <UI.Radio name="type" value="0" defaultChecked description="Товар был в эксплуатации">Б/у</UI.Radio>
                            <UI.Radio name="type" value="1" description="Не разу не использовался">Новый</UI.Radio>
                        </div>

                        {!this.state.stateProductInputValue? (
                            <div top="Оцека состояние">
                                <UI.Slider
                                    step={1}
                                    min={1}
                                    max={5}
                                    value={Number(this.state.stateBallsInputValue)}
                                    onChange={stateBallsInputValue => this.setState({stateBallsInputValue})}
                                    style={{marginBottom: 10}}
                                />
                                <UI.Select onChange={this.onChangeStateBalls.bind(this)} value={String(this.state.stateBallsInputValue)}>
                                    {this.getOptionsSelect()}
                                </UI.Select>
                            </div>
                        ) : null}

                        <UI.File level="buy" name="img[]" onChange={this.fileChange.bind(this)} top="Загруска фотографий" multiple before={<Icon24Camera />} size="l">
                            Добавить фото
                        </UI.File>

                        <div className="file_img_wrapper">
                            {this.state.arrImagesLoad? (
                                this.state.arrImagesLoad.map((e, i) => {
                                    if(e.image === null) {
                                        return (
                                            <div key={i} className="img_wrap"
                                                 style={{backgroundImage: "url('/images/no_photo_mini.png')", opacity: 0.5}}>

                                            </div>
                                        )
                                    }
                                    return (
                                        <div key={i} className="img_wrap"
                                             style={{backgroundImage: "url("+e.image+")"}}
                                             onClick={this.deleteFileImgPriv.bind(this, i)}>

                                        </div>
                                    )
                                })
                            ) : null}
                        </div>

                        <UI.Textarea top="Описание" placeholder="Описание товара"
                                     onChange={this.onChangeDescription.bind(this)}/>
                    </UI.FormLayout>

                    <UI.Div>
                        <UI.Button onClick={this.submitForm.bind(this)} level="buy" size="xl">
                            Отправить
                        </UI.Button>
                    </UI.Div>
                </UI.Group>
            </UI.Panel>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        gds: state.gds
    }
}

export default connect(mapStateToProps)(AddProduct);