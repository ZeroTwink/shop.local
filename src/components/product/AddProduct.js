import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from '../../utils/axios';
import * as UI from '@vkontakte/vkui';

import * as vkActions from '../../actions/vk';

import * as sysActions from '../../actions/sys';
import * as addProductActions from '../../actions/addProduct';
import * as gdsActions from '../../actions/gds';

import categories from '../../utils/categories';

// import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
// import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Camera from '@vkontakte/icons/dist/24/camera';
import Icon32Camera from '@vkontakte/icons/dist/32/camera';

import getCurrencyCode from '../../helpers/getCurrencyCode';

import '@vkontakte/vkui/dist/vkui.css';
import './addProduct.scss';

class AddProduct extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.formData = null;
    }


    componentDidMount() {
        if(this.props.addProduct.arrImagesLoad.length && !this.props.addProduct.isEditProduct) {
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
            descriptionInputValue: "",
            titleInputValue: "",
            priceInputValue: "",
            arrImagesLoad: arr
        });
    }

    componentWillUnmount() {
        this.props.setValues({
            isEditProduct: 0
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
        });
    }

    onChangeTitle(e) {
        this.props.setValues({
            titleInputValue: e.target.value
        });
    }

    onChangeCategory(e) {
        this.props.setValues({
            category: e.target.value
        });
    }

    onChangeSubcategory(e) {
        this.props.setValues({
            subcategory: e.target.value
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

        this.formData = new FormData();

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

        if(this.props.addProduct.titleInputValue.length > 100) {
            this.displayError("Длина названия не должна превышать 100 символов");
            return;
        }

        if(this.props.addProduct.category) {
            this.formData.append('category', this.props.addProduct.category);
        } else {
            this.formData.append('category', 0);
        }

        if(this.props.addProduct.subcategory) {
            this.formData.append('subcategory', this.props.addProduct.subcategory);
        } else {
            this.formData.append('subcategory', 0);
        }

        this.formData.append('state', this.props.addProduct.stateProductInputValue);

        if(this.props.addProduct.stateBallsInputValue !== "") {
            this.formData.append('state_balls', this.props.addProduct.stateBallsInputValue);
        } else {
            this.displayError("Нужно указать оценку товара");
            return;
        }

        this.formData.append('description', this.props.addProduct.descriptionInputValue);

        if(this.getEmail()) {
            this.formData.append('email', this.getEmail());
        } else {
            this.formData.append('email', "");
        }

        if(this.getPhoneNumber()) {
            this.formData.append('phone_number', this.getPhoneNumber());
        } else {
            this.formData.append('phone_number', "");
        }

        axios({
            method: 'post',
            url: "/api/add_product.php",
            data: this.formData,
            config: { headers: {'Content-Type': 'multipart/form-data' }}
        })
        .then((response) => {
            this.props.setPopout(null);

            if(response.data.error) {
                this.displayError(response.data.error.message);

                return;
            }

            let gdsNew = [...this.props.gds['gds_new']];
            gdsNew.unshift(response.data.response["product"]);

            let cats = null;
            if(this.props.gds.categories[this.props.addProduct.category]) {
                let cats = {...this.props.gds.categories};

                cats[this.props.addProduct.category].unshift(response.data.response["product"]);
            }

            this.props.gdsUpdate({
                "gds_new": gdsNew,
                "categories": cats? cats : this.props.gds.categories
            });


            // let arr = [];
            // for(let i = 0; i < 5; i++) {
            //     let data = {
            //         image: null,
            //         file: null
            //     };
            //     arr.push(data);
            // }
            this.props.setValues({
                descriptionInputValue: "",
                titleInputValue: "",
                priceInputValue: "",
                arrImagesLoad: []
            });

            this.props.history.replace("/product/" + response.data.response["product"]['id']);
        })
        .catch((response) => {
            console.log(response);
            this.props.setPopout(null);
        });
    }

    fileChange(e) {
        if(!e.target.files[0]) {
            return;
        }

        let file = e.target.files[0];

        if(file.size > 4 * (1024 * 1024)) {
            this.displayError("Фаил " + file.name + " весит больше чем 4 Мб");

            return;
        }

        if(file.type !== "image/jpeg" && file.type !== "image/png") {
            this.displayError("Фаил " + file.name + " не подходит форматом, дуступные форматы jpeg, jpg, png");

            return;
        }

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
        let country = {
            "id": 1,
            "title": "Россия"
        };

        if(this.props.vk.user['country']) {
            country = this.props.vk.user['country'];
        }

        if(this.props.addProduct.country) {
            country = this.props.addProduct.country
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
        let email = this.props.vk.email? this.props.vk.email : "";

        if(this.props.addProduct.emailInputValue) {
            email = this.props.addProduct.emailInputValue;
        }

        if(this.props.addProduct.emailInputValue === "" && this.props.vk.email) {
            email = this.props.addProduct.emailInputValue;
        }

        return email;
    }

    getPhoneNumber() {
        let phoneNumber = this.props.vk.phoneNumber? this.props.vk.phoneNumber : "";

        if(this.props.addProduct.phoneNumberInputValue) {
            phoneNumber = this.props.addProduct.phoneNumberInputValue;
        }

        if(this.props.addProduct.phoneNumberInputValue === "" && this.props.vk.phoneNumber) {
            phoneNumber = this.props.addProduct.phoneNumberInputValue;
        }

        return phoneNumber;
    }

    getOptionSubcategory() {
        let subcategories = null;
        if(categories[this.props.addProduct.category]) {
            subcategories = categories[this.props.addProduct.category]['sub'].map((e, i) => (
                <option key={i} value={i}>{e.title}</option>
            ))
        } else {
            subcategories = categories[0]['sub'].map((e, i) => (
                <option key={i} value={i}>{e.title}</option>
            ))
        }

        return subcategories;
    }

    clickPhoneNumber() {
        if(this.props.addProduct.phoneNumberInputValue || this.props.vk.phoneNumber) {
            return;
        }

        vkActions.fetchPhoneNumber();
    }

    clickEmail() {
        if(this.props.addProduct.emailInputValue || this.props.vk.email) {
            return;
        }

        vkActions.fetchEmail();
    }

    render() {
        // const osname = UI.platform();

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader>
                    Новое объявление
                </UI.PanelHeader>

                <UI.Group title="Геоданные">
                    <UI.FormLayout>
                        <UI.SelectMimicry
                            top={<span>Страна <span style={{color: "#4CAF50"}}>*</span></span>}
                            placeholder="Не выбрана"
                            onClick={() => this.props.setActive({view: "choose", panel: "addProductCountry"})}
                        >
                            {this.getSelectedCountry()['title']}
                        </UI.SelectMimicry>

                        <UI.SelectMimicry
                            top={<span>Город <span style={{color: "#4CAF50"}}>*</span></span>}
                            placeholder="Не выбран"
                            onClick={() => this.props.setActive({view: "choose", panel: "addProductCity"})}
                        >
                            {this.getSelectedCity()}
                        </UI.SelectMimicry>
                    </UI.FormLayout>
                </UI.Group>

                <UI.Group title="Информация"
                          description={<span>Поля отмеченные <span style={{color: "#4CAF50"}}>*</span> обязательны для заполнения</span>}>
                    <UI.FormLayout>

                        <UI.Input type="number" top={<span>Цена (целое число) {getCurrencyCode(this.getSelectedCountry()["id"])} <span style={{color: "#4CAF50"}}>*</span></span>}
                                  value={this.props.addProduct.priceInputValue}
                                  onChange={this.onChangePrice.bind(this)} />

                        <UI.Input type="text"
                                  value={this.props.addProduct.titleInputValue}
                                  top={<span>Название <span style={{color: "#4CAF50"}}>*</span></span>}
                                  onChange={this.onChangeTitle.bind(this)} />

                        <UI.Select value={this.props.addProduct.category? this.props.addProduct.category : 0}
                                   onChange={this.onChangeCategory.bind(this)}
                                   top={<span>Категория <span style={{color: "#4CAF50"}}>*</span></span>}>
                            {categories.map((e, i) => (
                                <option key={i} value={i}>{e.title}</option>
                            ))}
                        </UI.Select>

                        <UI.Select value={this.props.addProduct.subcategory? this.props.addProduct.subcategory : 0}
                                   onChange={this.onChangeSubcategory.bind(this)}
                                   top={<span>Подкатегория <span style={{color: "#4CAF50"}}>*</span></span>}>
                            {this.getOptionSubcategory()}
                        </UI.Select>

                        <UI.FormLayoutGroup top={<span>Состояние товара <span style={{color: "#4CAF50"}}>*</span></span>}
                             onChange={this.onChangeStateProduct.bind(this)}>
                            <UI.Radio name="type" value="0"
                                      defaultChecked={!this.props.addProduct.stateProductInputValue}
                                      description="Товар был в эксплуатации">Б/у</UI.Radio>
                            <UI.Radio name="type" value="1"
                                      defaultChecked={this.props.addProduct.stateProductInputValue}
                                      description="Не разу не использовался">Новый</UI.Radio>
                        </UI.FormLayoutGroup>

                        {!this.props.addProduct.stateProductInputValue? (
                            <UI.FormLayoutGroup top="Оцека состояние">
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
                            </UI.FormLayoutGroup>
                        ) : null}

                        <UI.File size="xl" name="img[]" accept="image/jpeg,image/png"
                                 onChange={this.fileChange.bind(this)}
                                 top="Фотографии (jpeg, png) вес не более 4 Мб"
                                 multiple
                                 before={<Icon24Camera />}>
                            Добавить фото
                        </UI.File>

                        <div className="file_img_wrapper">
                            {this.props.addProduct.arrImagesLoad? (
                                this.props.addProduct.arrImagesLoad.map((e, i) => {
                                    if(e.image === null) {
                                        return (
                                            <div key={i} className="img_wrap">
                                                <div className="icon_wrap">
                                                    <Icon32Camera />
                                                </div>
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
                                     value={this.props.addProduct.descriptionInputValue}/>
                    </UI.FormLayout>
                </UI.Group>

                <UI.Group title="Контакты">
                    <UI.FormLayout>
                        <UI.Input type="email" top="E-mail"
                                  value={this.getEmail()}
                                  onClick={this.clickEmail.bind(this)}
                                  onChange={this.onChangeEmail.bind(this)}/>

                        <UI.Input type="tel" top="Номер телефона"
                                  value={this.getPhoneNumber()}
                                  onClick={this.clickPhoneNumber.bind(this)}
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
        setActive: function (name) {
            dispatch(sysActions.setActive(name))
        },
        setValues: function (name) {
            dispatch(addProductActions.setValues(name))
        },
        setPopout: function (name) {
            dispatch(sysActions.setPopout(name))
        },
        gdsUpdate: function (name) {
            dispatch(gdsActions.gdsUpdate(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddProduct);