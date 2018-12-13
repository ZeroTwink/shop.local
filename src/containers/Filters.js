import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as UI from '@vkontakte/vkui';

import axios from '../utils/axios';

// import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
// import Icon24Back from '@vkontakte/icons/dist/24/back';
// import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import Icon24Filter from '@vkontakte/icons/dist/24/filter';

import * as sysActions from '../actions/sys';
import * as filtersActions from '../actions/filters';
import * as gdsFiltersActions from '../actions/gdsFilters';

import categories from '../utils/categories';

import getCurrencyCode from '../helpers/getCurrencyCode';

// import InfiniteScroll from 'react-infinite-scroll-component';

import InfiniteScroll from '../components/InfiniteScroll';

class Filters extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // activeTab: "filters",
            // gds: [],
            // hasMore: true
        };

        this.timerId = null;
    }

    componentDidMount() {
        window.scroll(0, this.props.sys['scroll']['filters']);

        // if(this.props.gdsFilters.items.length) {
        //     this.props.history.push("/filters/result");
        // }
    }

    componentWillUnmount() {
        this.props.setScroll({
            filters: window.pageYOffset
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

    getSelectedCountry() {
        let country = {
            id: 1,
            title: "Россия"
        };

        if(this.props.vk.user['country']) {
            country = this.props.vk.user['country'];

            if(this.props.vk.user['country']['id'] > 4) {
                country = {
                    id: 1,
                    title: "Россия"
                };
            }
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

        if(this.props.vk.user['country'] && this.props.vk.user['country']['id'] > 4) {
            city = null;
        }

        if(city && city.id === 0) {
            city = null;
        }

        return city;
    }

    onChangeSearch(search) {
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

    onChangeState(e) {
        this.props.setValues({
            state: e.target.value
        });
    }

    submitForm(e) {
        e.preventDefault();

        this.props.setPopout(<UI.ScreenSpinner />);

        this.props.gdsFiltersSet({
            items: [],
            hasMore: true,
            page: 0
        });

        this.loadNextItems(() => {
            this.props.setPopout(null);

            this.props.history.push("/filters/result");

            window.scroll(0, 0);
        }, 0);
    }

    loadNextItems(cb, page, e) {
        axios.get("/api/filters.php", {
            params: {
                sorting: this.props.filters.sorting,
                category: this.props.filters.category,
                subcategory: this.props.filters.subcategory,
                country_id: this.getSelectedCountry()['id'],
                city_id: this.getSelectedCity()? this.getSelectedCity()['id'] : "",
                search: this.props.filters.search,
                state: this.props.filters.state,
                page: page || page === 0? page : this.props.gdsFilters.page
            }
        }).then(res => {
            if(res.data.error) {
                this.displayError(res.data.error.message);

                return;
            }

            if(cb) {
                cb();
            }

            let hasMore = true;
            if(+this.props.filters.sorting === 3
                || +this.props.filters.sorting === 4
                || !res.data.response.gds.length
                || res.data.response.gds.length < 10) {
                hasMore = false;
            }

            this.props.gdsFiltersSet({
                items: [...this.props.gdsFilters.items, ...res.data.response.gds],
                hasMore: hasMore,
                page: this.props.gdsFilters.page + 1
            });
        }).catch(error => {
            console.log(error);

            this.props.setPopout(null);
        });
    }

    clickMainFilters() {
        this.props.gdsFiltersSet({
            items: [],
            hasMore: true,
            page: 0
        });

        this.props.history.push("/filters");
    }

    render() {
        // const osname = UI.platform();

        let items = [];
        this.props.gdsFilters.items.map((e, i) => {
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
                         bottomContent={
                             <div className="price" style={{color: UI.colors.blue}}>
                                 <div style={{color: "#fff"}}>
                                     {e.price + " " + getCurrencyCode(this.getSelectedCountry()['id'])}
                                 </div>
                             </div>
                         }
                         size="l"
                         description={categories[e.category]['title']}
                         onClick={() => (this.props.history.push("/product/" + e.id))}>
                    {e.title}
                </UI.Cell>
            );

            return true;
        });

        return (
            <UI.Panel id={this.props.id}>
                <UI.PanelHeader noShadow
                                left={this.props.match.params.pId? <UI.HeaderButton
                                    onClick={this.clickMainFilters.bind(this)}>{<Icon24Filter/>}
                                    </UI.HeaderButton> : null}
                >
                    Фильтры
                </UI.PanelHeader>

                {!this.props.match.params.pId? (
                    <UI.Search value={this.props.filters.search} onChange={this.onChangeSearch.bind(this)}/>
                ) : null}

                <UI.Group>
                    {!this.props.match.params.pId? (
                        <UI.FormLayout>
                            <UI.Select value={this.props.filters.sorting}
                                       onChange={this.onChangeSorting.bind(this)}
                                       top="Сортировка">
                                <option key="0" value="0">Новые (по дате)</option>
                                <option key="1" value="1">Сперва дешевле</option>
                                <option key="2" value="2">Сперва дороже</option>
                                {/*<option key="3" value="3">Новые (по дате) - дешевле</option>*/}
                                {/*<option key="4" value="4">Новые (по дате) - дороже</option>*/}
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

                            <UI.Select value={this.props.filters.state}
                                       onChange={this.onChangeState.bind(this)}
                                       top="Состояние товара" placeholder="Показать все">
                                <option key="0" value="0">Б/у</option>
                                <option key="1" value="1">Новый</option>
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
                                loadMore={this.loadNextItems.bind(this)}
                                hasMore={this.props.gdsFilters.hasMore}
                                loader={<UI.Div>
                                    <UI.Spinner size={20} strokeWidth={2}/>
                                </UI.Div>}>
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
        filters: state.filters,
        sys: state.sys,
        gdsFilters: state.gdsFilters
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
        },
        setScroll: function (name) {
            dispatch(sysActions.setScroll(name))
        },
        gdsFiltersSet: function (name) {
            dispatch(gdsFiltersActions.gdsFiltersSet(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Filters);