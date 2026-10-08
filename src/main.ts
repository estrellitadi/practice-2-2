import './styles.css';
import { Book, formatBook, Catalog} from './task1-types';
import { addBook, removeBook, getBook} from './task2-functions';
import { applyFilters, filterByAuthor, filterByMinYear } from './task3-filters';
import { createBookFromForm } from "./task4-integration";
import { filterByTitle, sortBooks } from './task5-utils';

// ============================================================
// ИСХОДНОЕ СОСТОЯНИЕ
// ============================================================
// TODO (Задание 1): ПЕРЕД этим присваиванием проверьте localStorage:
//   const saved = localStorage.getItem('catalog');
//   if (saved) { ... JSON.parse(saved) ... }
// Если данные в хранилище есть — используйте их вместо начальных.
const savedCatalog = localStorage.getItem('catalog');

let catalog: Catalog = savedCatalog
  ? JSON.parse(savedCatalog)
  : {
    '1': { id: '1', title: 'TypeScript Guide', authors: ['John Doe'], year: 2024 },
    '2': { id: '2', title: 'JavaScript Basics', authors: ['Jane Smith'], year: 2022 },
    };

// ============================================================
// СОХРАНЕНИЕ В localStorage (Задание 1)
// ============================================================
// TODO: Создайте функцию saveCatalog(), которая делает:
//   localStorage.setItem('catalog', JSON.stringify(catalog));
// Её будем вызывать в двух местах: после addBook и после removeBook.
function saveCatalog() {
  localStorage.setItem('catalog', JSON.stringify(catalog));
}

// ============================================================
// DOM-элементы
// ============================================================
const bookList = document.querySelector('#bookList');
const form = document.querySelector('#bookForm') as HTMLFormElement;
const filterBtn = document.querySelector('#applyFilters') as HTMLButtonElement;
const authorInput = document.querySelector('#filterAuthor') as HTMLInputElement;
const yearInput = document.querySelector('#filterYear') as HTMLInputElement;
const errorMessage = document.querySelector('#errorMessage') as HTMLDivElement;

// TODO (Задание 2): получите новые элементы
// const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
// const sortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;
const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
const sortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;

function renderBooks(books: Book[]) {
  if (!bookList) return;
  bookList.textContent = '';

  if (books.length === 0) {
    bookList.textContent = 'Книги не найдены. Попробуйте изменить фильтры.';
    return;
  }

  books.forEach(book => {
    const card = document.createElement('div');
    card.classList.add('book-card', 'fade-in');
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = formatBook(book);
    card.append(titleEl);

    if (book.rating !== undefined) {
      const ratingEl = document.createElement('p');
      ratingEl.textContent = `Рейтинг: ${book.rating}`;
      card.append(ratingEl);
    }

    // ============================================================
    // ЗАДАНИЕ 0: КНОПКА «УДАЛИТЬ»
    // ============================================================
    // TODO: Создайте кнопку deleteBtn («Удалить») через createElement.
    // Повесьте на неё обработчик click:
    //   1. catalog = removeBook(catalog, book.id)
    //   2. renderBooks(Object.values(catalog))
    // Добавьте кнопку в card через card.append(deleteBtn)
    //
    // ВНИМАНИЕ: в index.html эту кнопку добавлять НЕ НУЖНО.
    // Она создаётся динамически для каждой карточки,
    // чтобы знать, какую именно книгу удалять (замыкание на book.id).
const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => {
      catalog = removeBook(catalog, book.id);
      saveCatalog(); 
      updateUI();
    });
    card.append(deleteBtn);    
    bookList.append(card);
  });
}

// ============================================================
// ПЕРВИЧНАЯ ОТРИСОВКА
// ============================================================
// К этому моменту catalog уже должен содержать либо начальные данные,
// либо данные из localStorage (см. TODO в самом верху файла).
updateUI();


// ============================================================
// ОБРАБОТЧИК ФОРМЫ
// ============================================================
form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMessage.textContent = '';
  try{
    const formData = new FormData(form);
    const newBook = createBookFromForm(formData);
    catalog = addBook(catalog, newBook);
    saveCatalog();
    
    // TODO (Задание 1): ВЫЗОВИТЕ saveCatalog() ЗДЕСЬ
    // (после addBook, но до reset и renderBooks)
    
    form.reset();
    updateUI(); 
  } catch(error){
    if(error instanceof Error){   
      errorMessage.textContent = error.message; 
    }
  }
});


// ============================================================
// ОБРАБОТЧИК ФИЛЬТРОВ
// ============================================================
function updateUI() {
  const allBooks = Object.values(catalog);
  const filters = [];

  if (authorInput && authorInput.value.trim()) {
    filters.push(filterByAuthor(authorInput.value.trim()));
  }
  if (yearInput && yearInput.value) {
    filters.push(filterByMinYear(parseInt(yearInput.value, 10)));
  }
  if (searchInput && searchInput.value.trim()) {
    filters.push(filterByTitle(searchInput.value.trim()));
  }

  const filtered = applyFilters(allBooks, filters);
  const sortType = (sortBySelect?.value ?? 'year') as 'year' | 'rating';
  const sorted = sortBooks(filtered, sortType);

  renderBooks(sorted);
}
filterBtn.addEventListener('click', updateUI);
searchInput?.addEventListener('input', updateUI);
sortBySelect?.addEventListener('change', updateUI);