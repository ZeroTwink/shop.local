import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from '../../utils/axios';
import * as UI from '@vkontakte/vkui';

import * as vkActions from '../../actions/vk';

import * as sysActions from '../../actions/sys';
import * as addProductActions from '../../actions/addProduct';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Camera from '@vkontakte/icons/dist/24/camera';

import '@vkontakte/vkui/dist/vkui.css';
import './addProduct.scss';

class AddProduct extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // arrImagesLoad: [],
            // priceInputValue: "",
            // titleInputValue: "",
            // descriptionInputValue: "",
            // stateProductInputValue: 0,
            // stateBallsInputValue: 3
        };

        this.formData = null;
    }


    componentDidMount() {
        this.formData = new FormData();

        if(this.props.addProduct.arrImagesLoad.length) {
            return;
        }

        let arr = [];
        for(let i = 0; i < 5; i++) {
            let data = {
                image: null,
                file: null
            };
            arr.push(data);
        }

        this.props.setValues({
            arrImagesLoad: arr
        });
    }

    displayError(message) {
        this.props.setPopout(
            <UI.Alert
                actions={[{
                    title: 'OK',
                    autoclose: true,
                    style: 'destructive'
                }]}
                onClose={() => this.props.setPopout(null)}
            >
                <h2><div style={{color: "#ff473d", textAlign: "center"}}>Ошибка</div></h2>
                <div style={{textAlign: "center"}}>{message}</div>
            </UI.Alert>
        );
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

        this.props.setValues({
            priceInputValue: val
        })
    }

    onChangeTitle(e) {
        this.props.setValues({
            titleInputValue: e.target.value
        });
    }

    onChangeStateProduct(e) {
        let stateBalls = 3;

        if(+e.target.value === 1) {
            stateBalls = 5;
        }

        this.props.setValues({
            stateProductInputValue: +e.target.value,
            stateBallsInputValue: stateBalls
        });
    }

    onChangeStateBalls(e) {
        this.props.setValues({
            stateBallsInputValue: +e.target.value
        });
    }

    onChangeSliderBalls(balls) {
        this.props.setValues({
            stateBallsInputValue: +balls
        });
    }

    onChangeDescription(e) {
        this.props.setValues({
            descriptionInputValue: e.target.value
        });
    }

    onChangeEmail(e) {
        this.props.setValues({
            emailInputValue: e.target.value
        });
    }

    onChangePhoneNumber(e) {
        this.props.setValues({
            phoneNumberInputValue: e.target.value
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
        this.props.setPopout(<UI.ScreenSpinner />);

        for(let i = 0; i < 5; i++) {
            if(this.props.addProduct.arrImagesLoad[i]['file'] !== null) {
                this.formData.append('img[]', this.props.addProduct.arrImagesLoad[i]['file']);
            }
        }

        if(this.props.addProduct.priceInputValue !== "") {
            this.formData.append('price', this.props.addProduct.priceInputValue);
        } else {
            this.displayError("Нужно указать цену на товар");
            return;
        }

        if(this.props.addProduct.country || this.props.vk.user['country']) {
            let id = null;
            let title = "";
            if(this.props.addProduct.country) {
                id = this.props.addProduct.country['id'];
                title = this.props.addProduct.country['title'];
            } else {
                id = this.props.vk.user['country']['id'];
                title = this.props.vk.user['country']['title'];
            }

            this.formData.append('country_id', id);
            this.formData.append('country_title', title);
        } else {
            this.displayError("Не указана страна");
            return;
        }

        if(this.props.addProduct.city || this.props.vk.user['city']) {
            let id = null;
            let title = "";
            if(this.props.addProduct.city) {
                id = this.props.addProduct.city['id'];
                title = this.props.addProduct.city['title'];
            } else {
                id = this.props.vk.user['city']['id'];
                title = this.props.vk.user['city']['title'];
            }

            this.formData.append('city_id', id);
            this.formData.append('city_title', title);
        } else {
            this.displayError("Не указан город");
            return;
        }

        if(this.props.addProduct.titleInputValue.length > 2) {
            this.formData.append('title', this.props.addProduct.titleInputValue);
        } else {
            this.displayError("Длина названия должна быть не менее 3 символов");
            return;
        }

        this.formData.append('state', this.props.addProduct.stateProductInputValue);

        if(this.props.addProduct.stateBallsInputValue !== "") {
            this.formData.append('state_balls', this.props.addProduct.stateBallsInputValue);
        } else {
            this.displayError("Нужно указать оценку товара");
            return;
        }

        this.formData.append('description', this.props.addProduct.descriptionInputValue);

        axios({
            method: 'post',
            url: "/api/add_product.php",
            data: this.formData,
            config: { headers: {'Content-Type': 'multipart/form-data' }}
        })
        .then((response) => {
            this.props.setPopout(null);

            this.props.history.replace("/product/" + response.data.response["id_product"]);
        })
        .catch((response) => {
            console.log(response);
            this.props.setPopout(null);
        });
    }

    fileChange(e) {
        let file = e.target.files[0];

        this.imageReadPriv(e.target.files[0], (img) => {
            let arr = [...this.props.addProduct.arrImagesLoad];

            for(let i = 0; i < 5; i++) {
                if(arr[i]['image'] === null) {
                    arr[i]['image'] = img;
                    arr[i]['file'] = file;

                    break;
                }
            }

            this.props.setValues({
                arrImagesLoad: arr
            });
        }, (error) => {
            console.log(error);
        });
    }

    deleteFileImgPriv(i) {
        let arr = [...this.props.addProduct.arrImagesLoad];

        arr[i]['image'] = null;
        arr[i]['file'] = null;

        this.props.setValues({
            arrImagesLoad: arr
        });
    }

    getSelectedCountry() {
        let country = "Россия";

        if(this.props.vk.user['country']) {
            country = this.props.vk.user['country']['title'];
        }

        if(this.props.addProduct.country) {
            country = this.props.addProduct.country.title
        }

        return country;
    }

    getSelectedCity() {
        let city = null;

        if(this.props.vk.user['city'] && this.props.addProduct.city !== null) {
            city = this.props.vk.user['city']['title'];
        }

        if(this.props.addProduct.city) {
            city = this.props.addProduct.city.title
        }

        return city;
    }

    getEmail() {
        let email = this.props.vk.email? this.props.vk.email : null;

        if(this.props.addProduct.emailInputValue) {
            email = this.props.addProduct.emailInputValue;
        }

        return email;
    }

    getPhoneNumber() {
        let phoneNumber = this.props.vk.phoneNumber? this.props.vk.phoneNumber : null;

        if(this.props.addProduct.phoneNumberInputValue) {
            phoneNumber = this.props.addProduct.phoneNumberInputValue;
        }

        return phoneNumber;
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

                <UI.Group title="Новый товар">
                    <UI.FormLayout>
                        <UI.Input type="number" top={<span>Цена ₽ <span style={{color: "#4CAF50"}}>*</span></span>}
                                  defaultValue={this.props.addProduct.priceInputValue}
                                  onChange={this.onChangePrice.bind(this)} />

                        <UI.Input type="text"
                                  defaultValue={this.props.addProduct.titleInputValue}
                                  top={<span>Название <span style={{color: "#4CAF50"}}>*</span></span>}
                                  onChange={this.onChangeTitle.bind(this)} />

                        <UI.SelectMimicry
                            top="Выберите страну"
                            placeholder="Не выбрана"
                            onClick={() => this.props.setActiveView("selectCountries")}
                        >
                            {this.getSelectedCountry()}
                        </UI.SelectMimicry>

                        <UI.SelectMimicry
                            top="Выберите город"
                            placeholder="Не выбран"
                            onClick={() => this.props.setActiveView("selectCity")}
                        >
                            {this.getSelectedCity()}
                        </UI.SelectMimicry>

                        <div top={<span>Состояние товара <span style={{color: "#4CAF50"}}>*</span></span>}
                             onChange={this.onChangeStateProduct.bind(this)}>
                            <UI.Radio name="type" value="0"
                                      defaultChecked={!this.props.addProduct.stateProductInputValue}
                                      description="Товар был в эксплуатации">Б/у</UI.Radio>
                            <UI.Radio name="type" value="1"
                                      defaultChecked={this.props.addProduct.stateProductInputValue}
                                      description="Не разу не использовался">Новый</UI.Radio>
                        </div>

                        {!this.props.addProduct.stateProductInputValue? (
                            <div top="Оцека состояние">
                                <UI.Slider
                                    step={1}
                                    min={1}
                                    max={5}
                                    value={Number(this.props.addProduct.stateBallsInputValue)}
                                    onChange={this.onChangeSliderBalls.bind(this)}
                                    style={{marginBottom: 10}}
                                />
                                <UI.Select onChange={this.onChangeStateBalls.bind(this)}
                                           value={String(this.props.addProduct.stateBallsInputValue)}>
                                    {this.getOptionsSelect()}
                                </UI.Select>
                            </div>
                        ) : null}

                        <UI.File level="buy" name="img[]" onChange={this.fileChange.bind(this)} top="Загруска фотографий" multiple before={<Icon24Camera />} size="l">
                            Добавить фото
                        </UI.File>

                        <div className="file_img_wrapper">
                            {this.props.addProduct.arrImagesLoad? (
                                this.props.addProduct.arrImagesLoad.map((e, i) => {
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
                                     onChange={this.onChangeDescription.bind(this)}
                                     defaultValue={this.props.addProduct.descriptionInputValue}/>
                    </UI.FormLayout>
                </UI.Group>

                <UI.Group title="Ваши контакты">
                    <UI.FormLayout>
                        <UI.Input type="email" top="E-mail"
                                  defaultValue={this.getEmail()}
                                  onClick={() => {vkActions.fetchEmail()}}
                                  onChange={this.onChangeEmail.bind(this)}/>

                        <UI.Input type="tel" top="Номер телефона"
                                  defaultValue={this.getPhoneNumber()}
                                  onClick={() => {vkActions.fetchPhoneNumber()}}
                                  onChange={this.onChangePhoneNumber.bind(this)}/>
                    </UI.FormLayout>
                </UI.Group>

                <UI.Group>
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
        gds: state.gds,
        vk: state.vk,
        addProduct: state.addProduct
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setActiveView: function (name) {
            dispatch(sysActions.setActiveView(name))
        },
        setValues: function (name) {
            dispatch(addProductActions.setValues(name))
        },
        setPopout: function (name) {
            dispatch(sysActions.setPopout(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddProduct);