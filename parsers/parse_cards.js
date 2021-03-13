let result;

(function () {
    const rowEls = document.querySelector('table > tbody > tr > td').children;

    result = Array.from(rowEls).splice(1).map(item => {
        const colEls = item.querySelectorAll('table > tbody > tr > td');

        const resultItem = {
            types: ['cards'],
        };

        Array.from(colEls).forEach((col, index) => {
            if (index === 0) {
                // Извлекаем картинки из третьей колонки
                resultItem.img = col.querySelector('img').dataset.imageKey;

                // Извлекаем оригинальные названия
                const nameEl = col.querySelector('small');
                resultItem.name = nameEl.textContent.trim().match(/[^()]+/)[0];
                nameEl.remove();

                // Извлекаем названия на русском
                resultItem.nameRus = col.textContent.trim();

                return;
            }

            // Извлечь описание с форматированием
            if (index === 1) {
                let desc = col.innerHTML.trim();

                resultItem.desc = desc
                    .replace(/ (href|title|id)=".+?"/g, '') // Убрать атрибуты
                    .replace(/\n\s+/g, '<br>'); // Заменить переносы на html-перенос, убрать лишние отступы

                return;
            }

            return;
        });

        return resultItem;
    });

    console.log(result);
    // console.log(JSON.stringify(result));
})();