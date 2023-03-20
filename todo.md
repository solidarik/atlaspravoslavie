Обнаружил ошибки:
1. В карточке святого:
- Дата рождения в формате "330" подтягивается, а в формате "IV век" нет. (в поиске подтягивается, а в самой карточке нет)
- Не подтягивается дата подвига
- Дата и место смерти и захоронения не подтягивается. Точнее дату берёт не из столбца AI, а из столбца L. Место не видит вообще.
- Дата канонизации: меняет местами дату и месяц, если они есть, год оставляет

Предложения:

1. В карточке святого:
[v] - Формулировку унифицировать: Если "Дата и место рождения", то и в остальных местах лучше выбрать формулировку "Дата и место подвига(смерти)", а то вразнобой получается.

2. Поиск на странице "person":
[v]- Дата рождения; Место рождения; Столбец "Имя на сайте", но чтобы отображалось как "Имя"; Дата смерти; Место смерти (либо даты почитания вместо даты и места смерти);
[v] - Пустые данные, чтобы отображались как "-" или "...", в крайнем случае пустым местом, как сейчас имя и фамилия, но не "ed.ed.undefined" или "/>".

3. Выбор точки на карте:
- "Имя в монашестве" убрать, оно не критично.
[v] - ФИО, чтобы имя было из столба E, а не Q.
[v] - В списке подвигов добавить "Рождение" и "Смерть". Смерть оказывается есть, но опять же из столбца AI, скорее всего
Получится такой список:
Рождение      Москва      1879
Подвиг        Москва      1937
Смерть        Бутово      1937
- Может быть сделать эти строки кликабельны, центрующие карту на данную точку?

4. Файл в EXCEL:
- Определиться с терминологией часто используемых точек. Например "пос. Бутово" или "Бутовский полигон, Московская область, СССР". Или, как вариант, в графе "место подвига" писать Бутово, а в "Смерть" полигон.
[v] - Жизнеописание давать кратко. После ремонта столбца AG будет "Подробнее".

[v] Нужно показывать "имя для сайта", там самая правильная идентификация

Ошибка в координатах "Маргарита Закачурина"

Коллеги, есть несколько вопросов:
1. Не отображается место рождения. Пример - стр. 291, Конон Исаврийский. Есть координаты, в описании нет места рождения,
2. Не отображается место сметри, хотя оно есть на карте - строка 292
[v] 3. Не открываются некоторые ссылки, например: https://azbyka.ru//days/sv-lavrentij-chernigovskij-proskura


[v] Да, "Имя" и "Имя в монашестве" берётся из одного столбца Q. Например строка 319. Имя "Николай", в монашестве "Нил". На сайте отображается "Нил" в обоих столбцах.


Строка 670. Место смерти не подцепляется и на карте не показывается. И так у всех. Проверил человек 5 - картина одна и та же