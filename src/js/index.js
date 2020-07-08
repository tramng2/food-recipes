import Search from './models/Search'
import Recipe from './models/Recipe'
import List from './models/List'
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipesView from './views/recipesView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader } from './views/base'

/** SEARCH CONTROLLER
 * - search object
 * - current recipe object
 * - shopping list object
 * - liked recipes  
*/
const state = {}
const controlSearch = async () => {
    // 1 get query from the view
    const query = searchView.getInput()

    if (query) {
        // 2. new search object and add to state
        state.search = new Search(query)
        // 3. prepare UI for results
        searchView.clearResult()
        searchView.clearInput()
        renderLoader(elements.searchRes)

        // 4. search for the recipe
        await state.search.getResults()

        // 5. render the result
        searchView.clearLoader()
        searchView.renderResults(state.search.result)
    }
}
elements.searchForm.addEventListener('submit', el => {
    el.preventDefault();
    controlSearch()
})

elements.searchRes.addEventListener('click', el => {
    const btn = el.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto)
        searchView.clearResult()
        searchView.renderResults(state.search.result, goToPage)

    }
})
/*
// RECIPE CONTROLLER
*/
const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '') // reload ma ko bi mat du lieu

    if (id) {
        // 1 prepare UI for changes
        recipesView.clearResult()
        renderLoader(elements.recipe)

        if (state.search) searchView.highlightSelected(id);

        // 2 new recipe object and add to state
        state.recipe = new Recipe(id)

        try {
            // 3 get recipe data and parse ingredients
            await state.recipe.getRecipe()
            state.recipe.parseIngredients();


            // 4 calculate servings and time
            state.recipe.calcTime()
            state.recipe.calcServings()

            // 5 render recipe
            searchView.clearLoader()
            recipesView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            )


        } catch (error) {
            alert('line 79 error')
            console.log('line 79' + error)
        }

    }
}
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
/*
// LIST CONTROLLER
*/

const controlList = () => {
    // no list, create a new list
    if (!state.list) state.list = new List()

    // add each ingredients to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient)
        listView.renderItem(item)

    });
}


//Handle delete and update list item event 
elements.shoppingList.addEventListener('click', el => {
    const id = el.target.closest('.shopping__item').dataset.itemid;
    //Handle the delete button
    if (el.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state 
        state.list.deleteItem(id)
        //delete from UI
        listView.deleteItem(id)
        //Handle the updateCount to state
    } else if (el.target.matches('.shopping__count-value')) {
        const val = parseFloat(el.target.value, 10)
        state.list.updateCount(id, val)
    }
})

/*
// LIKES CONTROLLER
*/


const controlLike = () => {
    if (!state.likes) state.likes = new Likes()
    const currentId = state.recipe.id

    //user has not yet liked current recipe
    if (!state.likes.isLiked(currentId)) {
        // add like to the state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // toggle thie like button
        likesView.toggleLikeBtn(true)


        // addlike to the UI list
        likesView.renderLike(newLike)
        //user has liked current recipe
    } else {
        // remove like to the state
        state.likes.deleteLike(currentId)

        // toggle thie like button
        likesView.toggleLikeBtn(false)
        // remove like to the UI list
        likesView.deleteLike(currentId)

    }
    likesView.toggleLikeMenu(state.likes.getNumberLikes())
}
// Restore liked recipes on the page load

window.addEventListener('load', () => {
    state.likes = new Likes()
    //Restore likes

    state.likes.readStorage()

    //toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumberLikes())

    //render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like))

})


//Handle recipe button click => show the detailed recipe
elements.recipe.addEventListener('click', el => {
    if (el.target.matches('.btn-decrease, .btn-decrease *')) {
        // increase button clicked
        if (state.recipe.serving > 1) {
            state.recipe.updateServings('dec')
            recipesView.uiUpdateServingsIngredients(state.recipe)
        }

    } else if (el.target.matches('.btn-increase, .btn-increase *')) {
        // decrease button clicked
        state.recipe.updateServings('inc')
        recipesView.uiUpdateServingsIngredients(state.recipe)
    } else if (el.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //Add ingredients to shopping list
        controlList()
    } else if (el.target.matches('.recipe__love, .recipe__love *')) {
        // like controller 
        controlLike()
    }
})
