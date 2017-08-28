/* eslint-disable  func-names */
/* eslint-disable  dot-notation */
/* eslint-disable  new-cap */
/* eslint quote-props: ['error', 'consistent']*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports en-US lauguage.
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-trivia
 **/

'use strict';

const Alexa = require('alexa-sdk');
const USDA = require('./usda');
const Trigger = require('./trigger');

const SKILL_STATES = {
    SKILL: '_SKILLMODE',
    START: '_STARTMODE', // Entry point, start the game.
    HELP: '_HELPMODE', // The user is asking for help.
};
const APP_ID = 'amzn1.ask.skill.2716f325-dc0b-404e-9221-441ede542f3f';

/**
 * When editing your questions pay attention to your punctuation. Make sure you use question marks or periods.
 * Make sure the first answer is the correct one. Set at least ANSWER_COUNT answers, any extras will be shuffled in.
 */
const languageString = {
    'en': {
        'translation': {
            'SKILL_NAME': 'Allergy Central',
            'START_MESSAGE': 'I will remember your allergies. You can tell me an allergy, ask whether you can eat a food, or ask whether you can eat a food given an allergy',
            'HELP_MESSAGE': 'I will remember your allergies. You can tell me an allergy, ask whether you can eat a food, or ask whether you can eat a food given an allergy',
            'ASK_MESSAGE_START': 'Would you like to start?',
            'HELP_REPROMPT': 'Tell me an allergy, or ask whether you can eat a food. ',
            'STOP_MESSAGE': 'Would you like to keep going?',
            'CANCEL_MESSAGE': 'Ok, let\'s talk again soon.',
            'NO_MESSAGE': 'Ok, we\'ll talk another time. Goodbye!',
            'SKILL_UNHANDLED': 'Unhandled skill',
            'HELP_UNHANDLED': 'Say yes to continue, or no to end.',
            'START_UNHANDLED': 'Say start to list a new allergy.',
            'WELCOME_MESSAGE': 'Let\'s start',
            'ALLERGIC_MESSAGE': 'You are allergic to this. You can\'t eat it.',
            'NOT_ALLERGIC_MESSAGE': 'You are not allergic to this. You can eat it.',
            'ALLERGY_STORED_MESSAGE': 'Okay. I will remember that you are allergic to ',
            'REPEAT_MESSAGE': 'Please say that again?'
        },
    },
    'en-US': {
        'translation': {
            'SKILL_NAME': 'Allergy Central',
        },
    },
};

const newSessionHandlers = {
    'LaunchRequest': function () {
        this.handler.state = SKILL_STATES.START;
        this.emitWithState('Start', true);
    },
    'AMAZON.HelpIntent': function () {
        this.handler.state = SKILL_STATES.HELP;
        this.emitWithState('helpTheUser', true);
    },
    'Unhandled': function () {
        const speechOutput = this.t('START_UNHANDLED');
        this.emit(':ask', speechOutput, speechOutput);
    },
};


const startStateHandlers = Alexa.CreateStateHandler(SKILL_STATES.START, {
    'Start': function () {
        this.handler.state = SKILL_STATES.SKILL;
        this.emit(':tell', this.t('START_MESSAGE'));
    },
});

const questionStateHandlers = Alexa.CreateStateHandler(SKILL_STATES.TRIVIA, {
    'AllergyAndFoodIntent': function() {
        var ingredients = USDA.getFood(this.event.request.intent.slots.Food.value);
        //Is ingredients a list or a string? If it is a string, turn to list
        var allergies = this.attributes['allergies'];
        allergies.append(this.event.request.intent.slots.Allergy.value);

        var allergiesInFood = Trigger.whatAmIAllergicTo(ingredients, allergies);
        if (allergiesInFood.length > 0){
            this.emit(':tell', this.t('ALLERGIC_MESSAGE'));
            var allergyNames = "";
            for (var i = 0; i < allergiesInFood.length; i++){
                allergyNames += " " + allergiesInFood[i] + "and"
            }
            allergyNames = allergyNames.substring(0, allergyNames.length - 3); //eliminate final and
            const speechOutput = "You are allergic to " + allergyNames; //Just names first thing for now
            this.emit(':tell', this.t(speechOutput));
        } else {
            this.emit(':tell', this.t('NOT_ALLERGIC_MESSAGE'));
        }

    },

    'GiveAllergyIntent': function() {
        this.attributes['allergies'] = this.attributes['allergies'].append(this.event.request.intent.slots.Allergy.value);
        this.emit(":tell", this.t('ALLERGY_STORED_MESSAGE'));
    },

    'GiveFoodIntent': function() {
        var ingredients = USDA.getFood(this.event.request.intent.slots.Food.value);
        //Is ingredients a list or a string? If it is a string, turn to list
        var allergies = this.attributes['allergies'];
        //Is allergies a list or string? If it is a string, turn to list
        var allergiesInFood = Trigger.whatAmIAllergicTo(ingredients, allergies);
        if (allergiesInFood.length > 0){
            this.emit(':tell', this.t('ALLERGIC_MESSAGE'));
            var allergyNames = "";
            for (var i = 0; i < allergiesInFood.length; i++){
                allergyNames += " " + allergiesInFood[i] + "and"
            }
            allergyNames = allergyNames.substring(0, allergyNames.length - 3); //eliminate final and
            const speechOutput = "You are allergic to " + allergyNames; //Just names first thing for now
            this.emit(':tell', this.t(speechOutput));
        } else {
            this.emit(':tell', this.t('NOT_ALLERGIC_MESSAGE'));
        }
    },

    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.t('REPEAT_MESSAGE'), this.t('REPEAT_MESSAGE'));
    },
    'AMAZON.HelpIntent': function () {
        this.handler.state = SKILL_STATES.HELP;
        this.emitWithState('helpTheUser', false);
    },
    'AMAZON.StopIntent': function () {
        this.handler.state = SKILL_STATES.HELP;
        const speechOutput = this.t('STOP_MESSAGE');
        this.emit(':ask', speechOutput, speechOutput);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('CANCEL_MESSAGE'));
    },
    'Unhandled': function () {
        const speechOutput = this.t('SKILL_UNHANDLED');
        this.emit(':ask', speechOutput, speechOutput);
    },
    'SessionEndedRequest': function () {
        console.log(`Session ended in state: ${this.event.request.reason}`);
    },
});

const helpStateHandlers = Alexa.CreateStateHandler(SKILL_STATES.HELP, {
    'helpTheUser': function (newSession) {
        const askMessage = newSession ? this.t('ASK_MESSAGE_START') : this.t('REPEAT_MESSAGE') + this.t('STOP_MESSAGE');
        const speechOutput = this.t('HELP_MESSAGE') + askMessage;
        const repromptText = this.t('HELP_REPROMPT') + askMessage;
        this.emit(':ask', speechOutput, repromptText);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':tell', this.t('REPEAT_MESSAGE'));
    },
    'AMAZON.HelpIntent': function () {
        const newSession = (this.handler.state == SKILL_STATES.START);
        this.emitWithState('helpTheUser', newSession);
    },
    'AMAZON.StopIntent': function () {
        const speechOutput = this.t('STOP_MESSAGE');
        this.emit(':ask', speechOutput, speechOutput);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('CANCEL_MESSAGE'));
    },
    'Unhandled': function () {
        const speechOutput = this.t('HELP_UNHANDLED');
        this.emit(':ask', speechOutput, speechOutput);
    },
    'SessionEndedRequest': function () {
        console.log(`Session ended in help state: ${this.event.request.reason}`);
    },
});

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageString;
    alexa.registerHandlers(newSessionHandlers, startStateHandlers, questionStateHandlers, helpStateHandlers);
    alexa.execute();
};
