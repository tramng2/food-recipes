import axios from 'axios'
export default class Recipe {
    constructor(id) {
        this.id = id
    }
    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.img = res.data.recipe.image_url
            this.ingredients = res.data.recipe.ingredients
            this.author = res.data.recipe.publisher
            this.url = res.data.recipe.source_url
            this.title = res.data.recipe.title            
        } catch (error) {
            alert(`line 15 Something went wrong ${error}`)
        }
    }
    calcTime() {
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15
    }
    calcServings() {
        this.servings = 4;
    }
    parseIngredients() {

        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];

        const newIngredients = this.ingredients.map(el => {
            // 1. reform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            // 2. remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            //3 parse ingredient into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            
            const unitIndex = arrIng.findIndex(el2 => unitsShort.includes(el2))
            // unitIndex:find index of the unit. take each el of array arrIng to the callback funtion findIndex. 
            // callback function includes: unisShort includes el or not. return true/false. 
            // callback function return true/false. If true, findIndex renturn the index of el. Else, return -1

            let objIng
            if (unitIndex > -1) {
                // there is a unit
                // Ex. 4 1/2 cups, arrCount is [4, 1/2]
                // Ex. 4 cups, arrCount is [4]
                
                const arrCount = arrIng.slice(0, unitIndex);
                
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'))
                   
                    
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'))
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };
            } else if (parseInt(arrIng[0], 10)) {
                //there is NO unit but 1st element is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')                }

            } else if (unitIndex === -1) {
                // there is no unit nor number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }
            return objIng;
        });
        this.ingredients = newIngredients
    }
    updateServings(type) {
        //servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //ingredients
        this.ingredients.forEach(ing => {
            ing.count =  ing.count * ( newServings / this.servings)
        })
        this.servings = newServings;
    }
}


