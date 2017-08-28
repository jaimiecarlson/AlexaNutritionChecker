

exports.whatAmIAllergicTo = (ingredients, allergies) => {
	console.log("ingredients are", ingredients.ingredients);
    ingredients = ingredients.ingredients.filter((val, idx, array) => {
        val = val.toLowerCase();
        val = val.trim();
        console.log('val is', val);
        return (val.indexOf(allergies) > -1);
    });
    return ingredients[0];
};
