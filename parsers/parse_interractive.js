// Взять все названия имаг из их альтов со страниц предметов,
// находящихся в комнатах, сравнить с общим каталогом по именам имаг,
// и присвоить тип, соответствующий комнате

let lis = document.querySelectorAll('li.item');

let imgs = Array.from(lis)
    .filter(item => item.style.display !== 'none')
    .map(item => item.querySelector('img'));

items = Array.from(imgs).map(item => item.getAttribute('alt'));

// console.log(items);

const sections = JSON.parse(window.collectibles);

sections.forEach(section => {
    section.content.forEach(item => {
        if (items.some(img => img === item.img)) {
            if (!item.types) item.types = [];
            item.types.push('treasure'); // Указать тип, который нужно присвоить
        }
    });
});

console.log(sections);