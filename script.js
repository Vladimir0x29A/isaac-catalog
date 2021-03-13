(function () {
    // Заполнить фильтр чекбоксами
    const checkboxContainer = document.querySelector('#search-filter');
    const templateCheckbox = document.querySelector('#template-checkbox').innerHTML.trim();

    const checkboxSet = [
        'devil',
        'angel',
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
            desc: descTemplate.content.textContent.toLowerCase(),
        };
    }

    function reduce(data, option) {
        return data.reduce((accumulator, section, sectionIndex) => {
            const generation = ['collectibles', 'trinkets'].some(item => item === option) ? section.title.match(/\((.+)\)/)[1] : section.title;

            section.content.forEach(item => {
                item.generation = generation;

                if (option && option !== 'pills') {
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


    const dataSetSectioned = [
        'collectibles',
        'trinkets',
        'pills',
    ];

    let dataReduced = dataSetSectioned.reduce((accum, dataSetItem) => {
        // return accum.concat(reduce(fetch('trinkets.json'), dataSetItem));
        return accum.concat(reduce(JSON.parse(window[dataSetItem]), dataSetItem));
    }, []);

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

    function raf(fn) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fn();
            });
        });
    }

    function findHandler(e) {
        searchButtonEl.classList.add('search__button--pending');

        raf(() => {
            formList(this.value.toLowerCase());

            raf(() => {
                searchButtonEl.classList.remove('search__button--pending');
            });
        });
    }

    const searchInputEl = document.querySelector('#search-input');
    searchInputEl.addEventListener('change', findHandler);

    const searchButtonEl = document.querySelector('#search-button');
    searchButtonEl.addEventListener('click', findHandler.bind(searchInputEl));


    const clearButtonEl = document.querySelector('#clear-button');

    clearButtonEl.addEventListener('click', function (e) {
        searchInputEl.value = '';
    });




    const filter = {};
    const filterButtonEls = document.querySelectorAll('[data-filter]');

    Array.from(filterButtonEls).forEach(item => {
        filter[item.dataset.filter] = false;

        item.addEventListener('click', () => {
            filter[item.dataset.filter] = item.checked;
        });
    });






    function highlight(regex, string) {
        return regex ? string.replace(regex, matched => `<span class="found">${matched}</span>`) : string;
    }

    const contentEl = document.querySelector('#content');
    const template = document.querySelector('#template').innerHTML.trim();

    const formList = search => {
        while (contentEl.firstChild) contentEl.removeChild(contentEl.firstChild);

        const activeFilters = Object.keys(filter).filter(filterItem => filter[filterItem]);
        const isFilterSet = activeFilters.length;

        const dataFiltered = dataReduced.filter(item => {
            const isTextFound = ~item.search.name.indexOf(search) ||
                ~item.search.nameRus.indexOf(search) ||
                ~item.search.desc.indexOf(search);

            if (!isFilterSet) return isTextFound;

            return item.hasOwnProperty('types') && isTextFound &&
                activeFilters.every(filterItem => item.types.some(type => type === filterItem));
        });

        if (dataFiltered.length) {
            contentEl.removeAttribute('style');
        } else {
            contentEl.style.display = 'none';
        }

        const regex = search ? new RegExp(search, 'gi') : null;

        dataFiltered.forEach(row => {
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

            if (row.generation) {
                topEl.textContent = row.generation;
            } else {
                topEl.remove();
            }

            content.querySelector('.name').innerHTML = highlight(regex, row.name);
            content.querySelector('.name-rus').innerHTML = highlight(regex, row.nameRus);
            content.querySelector('img').src = row.img;
            content.querySelector('.bottom').innerHTML = highlight(regex, row.desc);

            if (row.hasOwnProperty('type')) {
                item.classList.add(row.type);
            }

            contentEl.appendChild(item);
        });
    };
})();
