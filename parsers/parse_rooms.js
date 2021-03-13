// Взять все названия имаг из их альтов со страниц предметов,
// находящихся в комнатах, сравнить с общим каталогом по именам имаг,
// и присвоить тип, соответствующий комнате

let items = document.querySelectorAll('a img');
items = Array.from(items).map(item => item.getAttribute('alt'));

// console.log(items);

const sections = JSON.parse(window.collectibles);

sections.forEach(section => {
    section.content.forEach(item => {
        if (items.some(img => img === item.img)) {
            if (!item.types) item.types = [];
            //  TODO: Добавить комнату сокровищ
            item.types.push('boss'); // Указать тип, который нужно присвоить
        }
    });
});

console.log(sections);