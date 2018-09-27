import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';

import axios from '../utils/axios';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';

import * as sysActions from '../actions/sys';
import * as filtersActions from '../actions/filters';

import categories from '../utils/categories';

import InfiniteScroll from 'react-infinite-scroll-component';

class Filters extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: "filters",
            gds: [],
            hasMore: true
        };

        this.page = 0;

        this.timerId = null;
    }


    componentDidMount() {

    }

    getSelectedCountry() {
        let country = {
            id: 1,
            title: "Россия"
        };

        if(this.props.vk.user['country']) {
            country = this.props.vk.user['country'];
        }

        if(this.props.filters.country) {
            country = this.props.filters.country
        }

        return country;
    }

    getSelectedCity() {
        let city = null;

        if(this.props.vk.user['city'] && this.props.filters.city !== null) {
            city = this.props.vk.user['city'];
        }

        if(this.props.filters.city) {
            city = this.props.filters.city
        }

        if(city && city.id === 0) {
            city = null;
        }

        return city;
    }

    onChangeSearch(search) {
        clearTimeout(this.timerId);

        if(this.state.activeTab === 'result') {
            this.timerId = setTimeout(() => {
                this.page = 0;

                this.setState({
                    gds: [],
                    hasMore: true
                });

                this.loadNextItems();

                clearTimeout(this.timerId);
            }, 1000);
        }

        if(search === "") {
            this.props.setValues({
                search: ""
            });

            return;
        }

        this.props.setValues({
            search: search
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

    onChangeSorting(e) {
        this.props.setValues({
            sorting: e.target.value
        });
    }

    submitForm(e) {
        e.preventDefault();

        this.props.setPopout(<UI.ScreenSpinner />);

        this.setState({
            activeTab: "result",
            gds: [],
            hasMore: true
        });

        this.page = 0;

        // this.loadNextItems();
    }

    loadNextItems() {
        axios.get("/api/filters.php", {
            params: {
                sorting: this.props.filters.sorting,
                category: this.props.filters.category,
                subcategory: this.props.filters.subcategory,
                country_id: this.getSelectedCountry()['id'],
                city_id: this.getSelectedCity()? this.getSelectedCity()['id'] : "",
                search: this.props.filters.search,
                page: this.page
            }
        }).then(res => {
            this.props.setPopout(null);

            this.setState({
                gds: [...this.state.gds, ...res.data.response.gds],
                hasMore: res.data.response.gds.length? true : false
            });

            this.page++;
        }).catch(error => {
            console.log(error);

            this.props.setPopout(null);
        });
    }


    render() {
        const osname = UI.platform();

        let items = [];
        this.state.gds.map((e, i) => {
            let image = "";
            if(e['images'] !== "") {
                image = e["images"].split(",")[0];

                image = window.location.protocol + "//" + window.location.hostname +
                    "/sys/files/gds/" + image;
            } else {
                image = "/images/no_photo_info.png";
            }

            let style = {
                backgroundSize: "cover",
                backgroundImage: "url("+image+")",
                backgroundPosition: "center 35%"
            };

            items.push(
                <UI.Cell key={e.id}
                         before={<UI.Avatar type="image" style={style} size={64} />}
                         asideContent={
                             <div className="price" style={{color: UI.colors.blue}}>
                                 <div style={{color: "#fff"}}>{e.price} ₽</div>
                             </div>
                         }
                         description={categories[e.category]['title']}
                         onClick={() => (this.props.history.push("/product/" + e.id))}>
                    {e.title}
                </UI.Cell>
            );

            return true;
        });

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader
                    left={<UI.HeaderButton onClick={() => this.props.history.goBack()}>{osname === UI.IOS ?
                        <Icon28ChevronBack/> : <Icon24Back/>}</UI.HeaderButton>}
                >
                    Фильтры
                </UI.PanelHeader>

                <UI.Search value={this.props.filters.search} onChange={this.onChangeSearch.bind(this)}/>

                <UI.Group>
                    <UI.Tabs>
                        <UI.TabsItem className="tabsl"
                                     onClick={() => this.setState({ activeTab: 'filters' })}
                                     selected={this.state.activeTab === 'filters'}
                        >
                            Фильтры
                        </UI.TabsItem>
                        <UI.TabsItem className="tabsl"
                                     onClick={() => this.setState({ activeTab: 'result' })}
                                     selected={this.state.activeTab === 'result'}
                        >
                            Результат
                        </UI.TabsItem>
                    </UI.Tabs>
                </UI.Group>

                <UI.Group>
                    {this.state.activeTab === 'filters'? (
                        <UI.FormLayout>
                            <UI.Select value={this.props.filters.sorting}
                                       onChange={this.onChangeSorting.bind(this)}
                                       top="Сортировка">
                                <option key="0" value="0">Самые новые</option>
                                <option key="1" value="1">Самые дешевые</option>
                                <option key="2" value="2">Самые дорогие</option>
                            </UI.Select>

                            <UI.Select value={this.props.filters.category}
                                       onChange={this.onChangeCategory.bind(this)}
                                       top="Категория" placeholder="Любая">
                                {categories.map((e, i) => (
                                    <option key={i} value={i}>{e.title}</option>
                                ))}
                            </UI.Select>

                            <UI.Select value={this.props.filters.subcategory}
                                       onChange={this.onChangeSubcategory.bind(this)}
                                       top="Подкатегория" placeholder="Любая">
                                {categories[this.props.filters.category]? (
                                    categories[this.props.filters.category]['sub'].map((e, i) => (
                                        <option key={i} value={i}>{e.title}</option>
                                    ))
                                ) : null}
                            </UI.Select>

                            <UI.SelectMimicry
                                top="Выберите страну"
                                placeholder="Не выбрана"
                                onClick={() => this.props.setActive({view: "choose", panel: "filtersCountry"})}
                            >
                                {this.getSelectedCountry()['title']}
                            </UI.SelectMimicry>

                            <UI.SelectMimicry
                                top="Выберите город"
                                placeholder="Любой город"
                                onClick={() => this.props.setActive({view: "choose", panel: "filtersCity"})}
                            >
                                {this.getSelectedCity()? this.getSelectedCity()['title'] : null}
                            </UI.SelectMimicry>


                            <UI.Button onClick={this.submitForm.bind(this)} level="buy" size="xl">
                                Показать
                            </UI.Button>
                        </UI.FormLayout>
                    ) : (
                        <UI.List className="new_gds">
                            <InfiniteScroll
                                dataLength={items.length}
                                next={this.loadNextItems.bind(this)}
                                hasMore={this.state.hasMore}>
                                {items.length? items : (<div className="message_empty">Поиск не дал резултатов</div>)}
                            </InfiniteScroll>
                        </UI.List>
                    )}
                </UI.Group>

            </UI.Panel>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        gds: state.gds,
        vk: state.vk,
        filters: state.filters
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setActive: function (name) {
            dispatch(sysActions.setActive(name))
        },
        setValues: function (name) {
            dispatch(filtersActions.setValues(name))
        },
        setPopout: function (name) {
            dispatch(sysActions.setPopout(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Filters);