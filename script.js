(function () {
    // Заполнить фильтр чекбоксами
    const checkboxContainer = document.querySelector('#search-filter');
    const templateCheckbox = document.querySelector('#template-checkbox').innerHTML.trim();

    const checkboxSet = [
        'devil',
        'angel',
        'boss',
        'treasure',
        'shop',
        'curse',
        'secret',
        'crawl',
        'active',
        'passive',
        'trinket',
        'pills',
        'runes',
        'cards',
    ];

    checkboxSet.forEach(item => {
        const templateCheckboxEl = document.createElement('template');
        templateCheckboxEl.innerHTML = templateCheckbox;

        const content = templateCheckboxEl.content;
        content.querySelector('input').dataset.filter = item;
        content.querySelector('.checkbox__label').textContent = item[0].toUpperCase() + item.substring(1);

        checkboxContainer.appendChild(content.firstChild);
    });



    // Кнопка "вверх"
    const scrollToUpButton = document.querySelector('.scroll-to-up-button');
    scrollToUpButton.addEventListener('click', e => window.scrollTo(0,0));



    /*function fetch(url) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send();

        if (xhr.status != 200) {
            console.log(xhr.status, xhr.statusText);
            return [];
        }

        return JSON.parse(xhr.responseText);
    }*/


    function makeSearchable(item) {
        const descTemplate = document.createElement('template');
        descTemplate.innerHTML = item.desc.trim();

        item.search = {
            name: item.name.toLowerCase(),
            nameRus: item.nameRus.toLowerCase(),
            desc: descTemplate.content.textContent.toLowerCase(), // Из html-разметки извлечь чистый текст для поиска
        };
    }

    function reduce(data, option) {
        return data.reduce((accumulator, section, sectionIndex) => {
            // Извлечь названия поколений из заголовков артефактов и брелков
            // У остальных просто взять заголовок, если он и есть поколение
            const generation = ['collectibles', 'trinkets'].some(item => item === option) ? section.title.match(/\((.+)\)/)[1] : section.title;

            section.content.forEach(item => {
                item.generation = generation;

                if (option && option !== 'pills') { // Не закрепляем имаги за пилюлями, они у них всегда разные
                    item.img = `img/${option}/${item.img}`;

                    if (option === 'collectibles') {
                        item.type = sectionIndex % 2 ? 'passive' : 'active';

                        if (!item.types) item.types = [];
                        item.types.push(item.type);
                    } else if (option === 'trinkets') {
                        if (!item.types) item.types = [];
                        item.types.push('trinket');
                    }
                }

                makeSearchable(item);
            });

            return accumulator.concat(section.content);
        }, []);
    }


    // Преобразовать элементы, разделенные по поколениям, в плоский массив и слить вместе
    const dataSetSectioned = [
        'collectibles',
        'trinkets',
        'pills',
    ];

    let dataReduced = dataSetSectioned.reduce((accum, dataSetItem) => {
        // return accum.concat(reduce(fetch('trinkets.json'), dataSetItem));
        return accum.concat(reduce(JSON.parse(window[dataSetItem]), dataSetItem));
    }, []);


    // Слить массивы элементов без поколений
    const dataSet = [
        'runes',
        'cards',
    ];

    dataSet.forEach(dataSetItem => {
        let data = JSON.parse(window[dataSetItem]);

        data = data.map(item => {
            item.img = `img/${dataSetItem}/${item.img}`;
            makeSearchable(item);
            return item;
        });

        dataReduced = dataReduced.concat(data);
    });


    // Статус ожидания
    function raf(fn) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fn();
            });
        });
    }

    // const viewPending = status => searchButtonEl.classList[status ? 'add' : 'remove']('search__button--pending');

    function findHandler(e) {
        formFoundList(this.value.toLowerCase());

        // Задействовать статус ожидания
        /*viewPending(true);

        raf(() => {
            formFoundList(this.value.toLowerCase());
            raf(() => viewPending(false));
        });*/
    }

    // Обработчики кнопок и инпутов
    const searchInputEl = document.querySelector('#search-input');
    searchInputEl.addEventListener('change', findHandler);

    const searchButtonEl = document.querySelector('#search-button');
    searchButtonEl.addEventListener('click', findHandler.bind(searchInputEl));


    const clearButtonEl = document.querySelector('#clear-button');

    clearButtonEl.addEventListener('click', function (e) {
        searchInputEl.value = '';
    });



    // Изменить фильтр по клику на чекбоксы
    const filter = {};
    const filterButtonEls = checkboxContainer.querySelectorAll('input[data-filter]');

    Array.from(filterButtonEls).forEach(item => {
        filter[item.dataset.filter] = false;

        item.addEventListener('click', () => {
            filter[item.dataset.filter] = item.checked;
        });
    });





    // Пометить найденный текст
    function highlight(regex, string) {
        return regex ? string.replace(regex, matched => `<span class="found">${matched}</span>`) : string;
    }


    const contentEl = document.querySelector('#content');
    const template = document.querySelector('#template').innerHTML.trim();

    const renderItem = (row, searchRegex) => {
        const rowTemplateEl = document.createElement('template');

        // Присвоить таблеткам произвольную иконку
        if (row.types && row.types.some(type => type === 'pills')) {
            row.img = `img/pills/${~~(Math.random() * 13 + 1)}.png`;
        }

        /*rowTemplateEl.innerHTML = template
            .replace('__generation__', row.generation)
            .replace('__name__', highlight(regex, row.name))
            .replace('__name_rus__', highlight(regex, row.nameRus))
            .replace('__img__', row.img)
            .replace('__desc__', highlight(regex, row.desc));*/

        rowTemplateEl.innerHTML = template;
        const content = rowTemplateEl.content;
        const item = content.firstChild;


        const topEl = content.querySelector('.top');

        // Убрать блок с для поколения, если поколения нет
        if (row.generation) {
            topEl.textContent = row.generation;
        } else {
            topEl.remove();
        }

        content.querySelector('.name').innerHTML = highlight(searchRegex, row.name);
        content.querySelector('.name-rus').innerHTML = highlight(searchRegex, row.nameRus);
        content.querySelector('img').src = row.img;
        content.querySelector('.bottom').innerHTML = highlight(searchRegex, row.desc);

        // Отметить тип артефактов, активный, или пассивный
        if (row.hasOwnProperty('type')) {
            item.classList.add(row.type);
        }

        contentEl.appendChild(item);
    };


    // Спрятать контейнер для элементов, если он пуст
    function handleContentVisibility(list) {
        if (list.length) {
            contentEl.removeAttribute('style');
        } else {
            contentEl.style.display = 'none';
        }
    }


    // Фильтровать элементы в соответствии с фильтром и поиском
    function filterList(list, search) {
        const activeFilters = Object.keys(filter).filter(filterItem => filter[filterItem]);
        const isFilterSet = activeFilters.length;

        return list.filter(item => {
            const isTextFound = ~item.search.name.indexOf(search) ||
                ~item.search.nameRus.indexOf(search) ||
                ~item.search.desc.indexOf(search);

            if (!isFilterSet) return isTextFound;

            return item.hasOwnProperty('types') && isTextFound &&
                activeFilters.every(filterItem => item.types.some(type => type === filterItem));
        });
    }



    let dataFiltered = [];
    let searchRegex;


    const bodyEl = document.querySelector('#body-container');

    function fillContent() {
        while (bodyEl.getBoundingClientRect().bottom - 1000 <= window.innerHeight && dataFiltered.length) {
            renderItem(dataFiltered.shift(), searchRegex);
        }
    }

    const countEl = document.querySelector('#search-count');

    const formFoundList = search => {
        while (contentEl.firstChild) contentEl.removeChild(contentEl.firstChild); // Очистить контент
        dataFiltered = filterList(dataReduced, search);
        countEl.textContent = dataFiltered.length;
        handleContentVisibility(dataFiltered);
        searchRegex = search ? new RegExp(search, 'gi') : null;

        // Отрендерить все сразу
        // dataFiltered.forEach(row => renderItem(row, searchRegex));

        // Отрендерить только те, что влезут в экран
        raf(() => { // Чтоб сначала отрендерить, затем считать размеры для прокрутки
            fillContent();
        });
    };



    // Бесконенчная прокрутка
    let scrollThrottleFlag;

    function scrollHandler() {
        if (!scrollThrottleFlag) {
            scrollThrottleFlag = true;

            setTimeout(() => {
                fillContent();
                scrollThrottleFlag = false;
            }, 500);
        }
    }

    window.addEventListener('scroll', scrollHandler);
})();
