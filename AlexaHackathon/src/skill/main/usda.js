const request = require('request');
const Promise = require('es6-promise').Promise;

const API_KEY = 'T2xKo1158ZtXaoKW2LOAJMbbjLgHgbjVS8nfH7fD';

exports.getFood = (query) => {
    return new Promise((resolve, reject) => {
        _getNDBNO(query).then((foodItemParams) => {
            console.log("query", query);
            console.log("query api key", API_KEY);
            console.log("food item params are", foodItemParams);
            console.log(foodItemParams);
            _getIngredients(foodItemParams).then((res) => {
                resolve(res);    
            }).catch((reason) => {
            console.log("reject", reason);
            reject(reason);
        });
    });
    });
};

const _getNDBNO = (query) => {
    return new Promise((resolve, reject) => {
        const url = 'http://api.nal.usda.gov/ndb/search/?type=b&format=json&api_key=' + API_KEY;
        console.log(API_KEY);
        const form ={
            api_key: API_KEY,
            q: query,
            max: '25',
            offset: '0',
            sort: 'r'
        };
        request.post({url: url, form: form}, (error, httpResponse, body) => {
            if(error) reject(error);
            else {
                var item = _getMostRelNDBNO(body)
                console.log("item is", item);
                resolve({name: item.name, ndbno: item.ndbno.toString()});
            }
        });
    });
};

const _getMostRelNDBNO = (body) => {
    let foodItems = JSON.parse(body);
    foodItems = foodItems.list.item.filter((val, idx, arr) => {
        return val.ds === 'BL'
    });
    return foodItems[0];
};

const _cleanIngredients = (ingredientString) => {
    console.log("ingredient string", ingredientString);
    console.log("ingredient string", ingredientString.split(','));
    return ingredientString.split(',');
};

const _getIngredients = (foodItemParams) => {
    return new Promise((resolve, reject) => {
        const url = 'https://api.nal.usda.gov/ndb/V2/reports?ndbno=' +
            foodItemParams.ndbno +
            '&type=b&format=json&api_key=' + API_KEY;
        const form ={
            api_key: API_KEY,
            max: '25',
            offset: '0'
        };
        request.post({url: url, form: form}, (error, httpResponse, body) => {
            if(error) reject(error);
            else {
                var report = JSON.parse(body);
                var ingredients = _cleanIngredients(report.foods[0].food.ing.desc);
                resolve({name: foodItemParams.name, ingredients: ingredients});
            }
        });
    });
};
