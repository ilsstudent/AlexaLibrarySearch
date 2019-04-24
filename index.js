/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const https = require('https');
const util = require('util')

//const datetime = require('date-and-time');
let outputText = ""
var search_type_enabled = false
var update = false
var stop_triggered = false
var NUMBER =3

//CONSTANTS --------------------------------------------------------------------------
const SKILL_NAME = 'USC Libraries Search';
const HELP_MESSAGE = 'You say search for title, keyword or author to perform search on our catalogue. You can also update the number of search results listed, by saying update number. How may I help you? ';
const HELP_REPROMPT_1 = 'You can say - Search title Harry Potter, or Search for Author Mark Twain.';
const HELP_REPROMPT_2 = 'Would you like to search by author, title or keyword? ';
const STOP_MESSAGE = 'Thank you for your time. Goodbye and Fight on! ';
const HELP_REPROMPT_4 = 'Sorry, I don\'t understand that. Is there anything else I can help you with? '+ HELP_REPROMPT_2
const ABOUTUSC = 'The University of Southern California is a private research university \
in Los Angeles, California. Founded in 1880, it is the oldest private research university in California. \
USC has historically educated a large number of the nation\'s business leaders and professionals.';


//17 library names
const libnames = [ 'ACCOUNTING','AFA','CINEMA','DOHENY','EAST','BUSINESS','GRANDDEPOS','LEAVEY','MUSIC','MED',
'ONEARCHIVE','PHILOSOPHY','SCIENCE','SPECCOLL','VKC','DEN'];

const displaynames = ['Accounting','Architecture and Fine Arts','Cinematic Arts','Doheny Memorial',
'East Asian','Gaughan and Tiberti','Grand Avenue','Leavey','Music','Norris Medical',
'ONE Archives','Hoose Library of Philosophy','Science and Engineering','Special Collections','VKC',
'Wilson Dental'];

//SEARCH THIS
var NUMBER =3;

const skillBuilder = Alexa.SkillBuilders.custom();

const API_KEY = '<API_KEY>';
const API_KEY_2 = '<API_KEY>';

const QUERY_TYPE = 'Everything'; //'LibraryCatalog'
const TOPIC = 'Hemingway Ernest';
const QUERY = encodeURIComponent(TOPIC);
const SEARCH_TYPE = 'any'; //default
var total= 0
let searchQuery = ''
let searchType = 'any'


// DEFAULT HANDLERS ------------

const StartFAQsHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'LaunchRequest' || request.type === 'IntentRequest' &&
      request.intent.name === 'StartIntent');
  },
  handle(handlerInput) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    const speechOutput = 'Hello Trojan! Helen of Troy welcomes you to USC Libraries Search.'
    + ' I will give you the top 3 results from our catalogue. You can also change the number of search results listed by saying update number.  Would you like to search by author, title or keyword?';
    searchType = 'any'
    sessionAttributes = {
        'number': 3,
        'type': 'any',
        'stop_triggered': false,
        'update_number':false,
        'outputText':''
    };
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);  
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, speechOutput)
      .reprompt(HELP_REPROMPT_2)
      .getResponse();
  },
};


const NumberIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' &&
      request.intent.name === 'NumberIntent')
  },
  handle(handlerInput) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
   
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    
    const request = handlerInput.requestEnvelope.request;
    console.log("Number Handler --- update number "+sessionAttributes.update_number)
    sessionAttributes['stop_triggered'] = false
    if(!sessionAttributes.update_number){
       sessionAttributes['update_number'] = false
       handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
       return AnswerIntentHandler.handle(handlerInput)
    }
    const query = request.intent.slots.number.value
    sessionAttributes['number'] =query
    let outputSpeech = 'I have updated the default number of search results to ' + query+  '. <break time="0.s"/>';
    outputText ='The default number of search results has been updated to' + query+  ' successfully. \n';
    sessionAttributes['update_number'] = false
    
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return handlerInput.responseBuilder
      .speak(outputSpeech+ HELP_REPROMPT_2)
      .withSimpleCard(SKILL_NAME, outputText+"\n" + HELP_REPROMPT_1)
      .reprompt(HELP_REPROMPT_1)
      .getResponse();
    
  },
};

const DefaultHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' &&
      request.intent.name === 'UpdateDefaultIntent')
  },
  handle(handlerInput) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
   
   var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    const request = handlerInput.requestEnvelope.request;
    console.log("Default_Handler:")
    sessionAttributes['stop_triggered'] = false
    
    //SLOT VALUE FOR SEARCHED QUERY
    const query = request.intent.slots.number.value;
    let outputSpeech = '';
    outputText = '';
    let speech = ''
    if(query == undefined){
      sessionAttributes['update_number'] = true
      let speech = 'We are updating the number of search results listed. How many do you prefer?'
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
      return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(speech)
      .withSimpleCard(SKILL_NAME,speech)
      .getResponse();
    } 
      sessionAttributes['update_number'] = false
      sessionAttributes['number'] =query
      outputSpeech = 'Okay! I have updated the default number of search results to ' + query+ ' .<break time="1s"/>';
      outputText ='The default number of search results has been updated to' + query+  ' successfully. \n';
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return handlerInput.responseBuilder
      .speak(outputSpeech+ HELP_REPROMPT_2)
      .withSimpleCard(SKILL_NAME, outputText+"\n" + HELP_REPROMPT_1)
      .reprompt(HELP_REPROMPT_1)
      .getResponse();
  },
};
const RepeatHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.RepeatIntent')
  },
  handle(handlerInput) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
   
   var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    var output
    if (outputText == ''){
      output  = 'Sorry, I don\'t have any data to repeat. '
    }else{
      output = 'Here you go. <break time="0.5s"/>'+ outputText
    }
    outputText = output
    sessionAttributes['stop_triggered'] = false
    sessionAttributes['update_number'] = false
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return handlerInput.responseBuilder
      .speak(output+ HELP_REPROMPT_2)
      .withSimpleCard(SKILL_NAME, output+"\n" + HELP_REPROMPT_1)
      .reprompt(HELP_REPROMPT_1)
      .getResponse();
  },
};

const UserSearchRequestIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' &&
      request.intent.name === 'UserSearchRequestIntent')
  },
  
  handle(handlerInput) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
   
   var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    sessionAttributes['stop_triggered'] = false
    sessionAttributes['update_number'] = false
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
   return handlerInput.responseBuilder
      .speak( HELP_REPROMPT_2)
      .withSimpleCard(SKILL_NAME,  HELP_REPROMPT_2)
      .reprompt(HELP_REPROMPT_2)
      .getResponse();},
};


const TypeOfSearchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
      return (request.type === 'IntentRequest' &&
      request.intent.name === 'TypeOfSearchIntent');
  },
  handle(handlerInput) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
   
   var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    const request = handlerInput.requestEnvelope.request;
    var type = '';
    sessionAttributes['stop_triggered'] = false
    sessionAttributes['update_number'] = false
    console.log("Type of Search Slots: %j", request.intent);
    let query ='a'
    if(arrayContains('Title',request.intent.name)){
      type = 'TITLE';
    }else if (arrayContains('Author',request.intent.name)){
      type = 'AUTHOR';
    }else if (arrayContains('Keyword',request.intent.name)){
      type = 'any'
    }else{
    //SLOT VALUE FOR SEARCHED QUERY
       query = request.intent.slots.author_p;
       if(query == undefined || query.value == undefined){
         query = request.intent.slots.title_p;
         if(query == undefined || query.value == undefined){
         query = request.intent.slots.keyword_p;
         }else{
           type = 'TITLE';
           console.log('search type is ----------------- title search');
         }
       }else{
         type = 'AUTHOR';
         console.log('search type is ----------------- author search');
      }
    }
    let outputSpeech = '';
    outputText = '';
    let speech = ''
    if(query == undefined){
      outputSpeech = HELP_REPROMPT_4
      outputText = HELP_REPROMPT_4 +'\n';
    } else {
      console.log('Type detected - '+ type)
      search_type_enabled = true
      if (type == 'AUTHOR'){
        sessionAttributes['type'] = 'creator'
        speech = 'Okay, please tell me the author name to perform the search on<break time="0.5s"/> '
        outputText = 'Okay, please tell me the author name to perform the search on. '
      }else if (type == 'TITLE'){
        sessionAttributes['type'] = 'title'
        speech = 'Sure, Please tell me the title name you are looking for. <break time="0.5s"/> '
        outputText = 'Sure, Please tell me the title name you are looking for.'
      }else{
        sessionAttributes['type'] = 'any'
        outputText = 'Sure, What are you looking for ? You can say search for Thermodynamics <break time="0.5s"/> '
        outputText = 'Sure, What are you looking for ? You can say search for Thermodynamics.'
      }
      console.log('Updated Search Type to '+ sessionAttributes['type'])
    }
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return handlerInput.responseBuilder
      .speak(outputText)
      .reprompt(outputText)
      .withSimpleCard(SKILL_NAME, outputText)
      .getResponse();
  },
};

const YesHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return ( request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.YesIntent');
  },
  handle(handlerInput) {
    console.log('Yes Intent reached')
    return handlerInput.responseBuilder
      .speak('Okay! That\'s great. Let\'s continue.')
      .withSimpleCard(SKILL_NAME, 'Okay! That\'s great. Let\'s continue.')
      .reprompt(HELP_REPROMPT_2)
      .getResponse();
  },
};

const NoHandler = {
  
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return ( request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
     return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .withSimpleCard(SKILL_NAME, STOP_MESSAGE)
      .getResponse();
  },
};


const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'LaunchRequest' || request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.HelpIntent');
  },
  handle(handlerInput) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
   
   var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    sessionAttributes['stop_triggered'] = false
    sessionAttributes['update_number'] = false
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .withSimpleCard(SKILL_NAME, HELP_MESSAGE)
      .reprompt(HELP_REPROMPT_2)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.CancelIntent' ||
        request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
   
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    if(sessionAttributes['stop_triggered']){
      sessionAttributes['update_number'] = false
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
      return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .withSimpleCard(SKILL_NAME, STOP_MESSAGE)
      .withShouldEndSession(true)
      .getResponse();
    }
    sessionAttributes['stop_triggered'] = true
    sessionAttributes['update_number'] = false
    let message = 'Ok, Is there anything else I can help you with? I can lookup title, author or any keyword from our catalogue.'
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(message)
      .withSimpleCard(SKILL_NAME, message)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
   
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    console.log('Session ended: %j',handlerInput.requestEnvelope.request.error);
    return handlerInput.responseBuilder
            .speak('Session Ended due to '+handlerInput.requestEnvelope.request.reason)
            .withShouldEndSession(true)
            .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
   
   var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    console.log(`Error handled: ${error.message}`);
    return handlerInput.responseBuilder
      .speak('Sorry, an error must have occurred.  Please try again. ')
      .reprompt('Sorry, an error must have occurred. Please try again.' )
      .withSimpleCard(SKILL_NAME, 'Sorry, an error must have occurred. Please try again ')
      .getResponse();
  },
};


/* Search Handlers
*  Title Handler
*  Author Handler
*  Keyword Handler
*  AnyWord Handler alias AnswerIntentHandler
*/
const TitleSearchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' &&
      request.intent.name === 'TitleSearchIntent');
  },

  async handle(handlerInput) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    const request = handlerInput.requestEnvelope.request;
    sessionAttributes['stop_triggered'] = false
    sessionAttributes['update_number'] = false
    const query = request.intent.slots.titleName.value;
    console.log('title search query is -----------------' + query);
    if(query == undefined){
      return TypeOfSearchHandler.handle(handlerInput)
    }else{
      return processData(query, 'title', handlerInput)
    }
  },

};

const AuthorSearchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' &&
      request.intent.name === 'AuthorSearchIntent');
  },

  async handle(handlerInput) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)   
    const request = handlerInput.requestEnvelope.request;
    sessionAttributes['stop_triggered'] = false
    sessionAttributes['update_number'] = false
    //SLOT VALUE FOR SEARCHED QUERY
    const query = request.intent.slots.authorName.value;
    console.log('AuthorSearchHandler query is -----------------' + query);
    return processData(query,'creator',handlerInput)
  },

};

const KeywordSearchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' &&
      request.intent.name === 'KeywordSearchIntent');
  },

  async handle(handlerInput) {
    console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    console.log('Session Attributes %j',sessionAttributes)
    const request = handlerInput.requestEnvelope.request;
    sessionAttributes['stop_triggered'] = false
    sessionAttributes['update_number'] = false
    var query = request.intent.slots.keyword.value;
    console.log('Keyword Search Query is -----------------' + query);
    if(query == undefined){
     return TypeOfSearchHandler.handle(handlerInput)
    }
    else{
    query = query.toLowerCase() ;
    return processData(query, 'any', handlerInput)
    }
  },

};

const AuthorNameIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AuthorNameIntent';
  },

  async handle(handlerInput) {
  console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
   var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
   console.log('Session Attributes %j',sessionAttributes)
   
   return AuthorSearchHandler.handle(handlerInput)
  },
};

const AnswerIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent';
  },

  async handle(handlerInput) {
  console.log('Intent Received: %j', handlerInput.requestEnvelope.request.intent)
  var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
  console.log('Session Attributes %j',sessionAttributes)
  const slots = handlerInput.requestEnvelope.request.intent.slots;
  var reply =''
  if(slots['word'] == undefined){
     reply = slots['number'].value
  }else{
     reply = slots['word'].value;
  }
  sessionAttributes['stop_triggered'] = false
  sessionAttributes['update_number'] = false
  console.log("User Said --- " + reply )
  console.log('Search Type is '+ sessionAttributes['type'])
  return processData(reply, sessionAttributes['type'], handlerInput)
       
  },
};


//HELPER METHODS --------------------------------------------------------------------------

function httpsGet(query, searchtype) {

  return new Promise(((resolve, reject) => {

    let result = '';
    const url2 = 'https://api-na.hosted.exlibrisgroup.com/primo/v1/search?q=' + searchtype + ',contains,' +
      encodeURIComponent(query) + '&offset=0&limit=10&vid=01USC_INST:01USC&tab=' + QUERY_TYPE +
      '&apikey=<API_KEY>&qInclude=facet_rtype,include,books&scope=MyInst_and_CI&sortby=rank'
    console.log("API URL :----- " + url);
    // HTTPS GET CALL TO API
    https.get(url2, (resp) => {

      //EMPTY VARIABLES
      let data = '';
      let jsondata = '';
      let result = [];
      console.log("response code --------" + resp.statusCode);

      //RECEIVE CHUNK OF DATA
      resp.on('data', (chunk) => {
        data += chunk;
      });

      //AFTER RECEIVING ENTIRE DATA
      resp.on('end', () => {
        jsondata = JSON.parse(data);
        var size = jsondata.docs.length;
        var isvalidquery = jsondata.info.total;
        //LOG RECEIVED INFO AND TITLE
        console.log("INFO_TOTAL ---" + jsondata.info.total);
        total = jsondata.info.total
        
        if (isvalidquery !== 0) {
          let count = 0;
          //  if(size>NUMBER)
          //  size = NUMBER;

          for (var i = 0; i < size; i++) {

            let speech = '';
            speech = jsondata.docs[i].pnx.sort.title + "..";
            //ADD AUTHOR IF ONLY TITLE SEARCH
            if (searchtype === 'title' && jsondata.docs[i].pnx.sort.author)
              speech += "By author : " + jsondata.docs[i].pnx.sort.author + "..";

            //REMOVE '&'
            speech = format(speech);
            result.push(speech);
            /* var found = array.find((element, index) => (array.indexOf(element) != index)); */
            result = result.filter((element, index) => (result.indexOf(element) == index));
            count = result.length;
            console.log(result + " "+ count);
            if (count === NUMBER)
              break;

          }

          resolve(result);
        }

        else {
          result = 'Sorry. No data found';
          reject(result);
        }


      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      result = 'Sorry. No data found';
      reject(result);
    });
  }));
}

async function processData(query, type, handlerInput){
    var sessionAttributes =  handlerInput.attributesManager.getSessionAttributes()
    let outputSpeech = '';
    outputText = '';
    query = handleQueryErrors(query)
    try {
       console.log('Search Type is '+ type)
       NUMBER = sessionAttributes['number']
       const responses = await httpsGet(query, type);
       if(type === 'any'){
         type = 'keyword'
       }else if(type === 'creator'){
         type = 'author'
       }
       var min = find_min(total, NUMBER)
       let tot_res = 'I found '+ total +' results for the search by '+type+' '+ query+' ';
       outputSpeech = tot_res+ '<break time=".6s"/> Here are top ' + min + ' results : ';
       outputText = tot_res+'Here are top ' + min + ' results :\n ';
       
       for (var i = 0; i < min; i++) {
         outputSpeech += (i + 1) + ': ' + responses[i] + '. <break time="0.5s"/> ';
         outputText += (i + 1) + ': ' + responses[i] + '\n';
       } 
      outputSpeech += "What else can I help you with?"+HELP_REPROMPT_2
      outputText+="What else can I help you with?"+HELP_REPROMPT_2+"\n"
      sessionAttributes['type'] = 'any'
    }
    catch (error) {
      outputSpeech = 'Sorry but I am unable to find "' + query + '" from our catalog. Can you please repeat that again ?';
      outputText = 'Sorry but I am unable to find "' + query + '" from our catalog. Can you please repeat that again ? \n';
      console.log(`Intent: ${handlerInput.requestEnvelope.request.intent.name}: message: ${error.message}`);
    }
    
    console.log(outputSpeech);
    console.log(outputText);
    
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .withSimpleCard(SKILL_NAME, outputText + "\n" )
      .getResponse();
    
}

function arrayContains(search, array)
{
    console.log('Checking presence of '+ search + ' in  '+ array)
    return (array.indexOf(search) > -1);
}


function format(line) {
  return line.replace(/&/g, ' and ');
}

function find_min(a,b){
  if (a <b) return a
  return b
  
}

function handleQueryErrors(query){
  if(arrayContains('hemmingway', query.toLowerCase())){
      query = query.replace(/hemmingway/gi, 'Hemingway');
  }
  return query
}

exports.handler = skillBuilder
  .addRequestHandlers(
    StartFAQsHandler,
    HelpHandler,
    ExitHandler,
    TitleSearchHandler,
    AuthorSearchHandler,
    KeywordSearchHandler,
    RepeatHandler,
    TypeOfSearchHandler,
    DefaultHandler,
    YesHandler,
    NoHandler,
    NumberIntentHandler,
    AnswerIntentHandler,
    UserSearchRequestIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
