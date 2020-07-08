import { elements, elementString } from './base'

export const getInput = () => elements.searchInput.value

export const clearResult = () => {
    elements.searchReslist.innerHTML = '';
    elements.searchResPages.innerHTML = ''
}
export const clearInput = () => elements.searchInput.value = ''

export const clearLoader = () => {
    const loader = document.querySelector(`.${elementString.loader}`);
    if (loader) loader.parentElement.removeChild(loader)
}

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');
};

const renderRecipe = recipe => {
    const markup = `
    <li>
        <a class="results__link results__link--active" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="${recipe.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>
    `;
    elements.searchReslist.insertAdjacentHTML('beforeend', markup)
}


// 'pasta cheese totmato
// acc: 0, cur: 5 => newtitle: ['pasta']
// acc: 5, cur: 6 => newtitle: ['pasta','cheese']

export const limitRecipeTitle = (title, limit = 17) => {
    if (title.length > limit) {
        const newTitle = []
        title.split(' ').reduce((arr, cur) => {
            if (arr + cur.length <= limit) {
                newTitle.push(cur)
            } return arr + cur.length
        }, 0)
        return `${newTitle.join(' ')} ...`

    } return title
}

const createButton = (page, type) =>
    `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
    </button>
    `

const renderButton = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage)
    let button
    if (page === 1 && pages > 1) {
        button = createButton(page, 'next')
    } else if (page < pages) {
        button = `${createButton(page, 'next')}
                  ${createButton(page, 'prev')}`
    } else if (page === pages && pages > 1) {
        button = createButton(page, 'prev')
    }
    elements.searchResPages.insertAdjacentHTML('afterbegin', button)
}

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    // page = 1 => start: 0; end: 10
    // page = 2 => start: 10; end: 20
    // page = 3 => start: 20; end: 30
    // slice: zero - based and dont incluce the end element
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage
    recipes.slice(start, end).forEach(el => renderRecipe(el));

    renderButton(page, recipes.length, resPerPage)

}