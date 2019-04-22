
Ex Libris Requirements -

Create an API key for Alexa Search Skill-

1. Go to https://developers.exlibrisgroup.com/manage/keys/ (to create Primo Search API key)
2. Click "Add API Key" button
3. Fill out API key Name (Alexa app), Description (API key for Alexa search), Add permission (Primo Search), SAVE


Create REST API calls to search for "Ernest Hemingway" by KEYWORD, AUTHOR, TITLE, & SUBJECT -

(Go to https://developers.exlibrisgroup.com/primo/apis/ to learn more about Primo REST API's)

KEYWORD API -
https://api-na.hosted.exlibrisgroup.com/primo/v1/search?q=any,contains,ernest%20hemingway&offset=0&limit=10&vid=01USC_INST:01USC&tab=Everything&apikey=YOUR_INSTITUTIONS_API_KEY&qInclude=facet_rtype,include,books&scope=MyInst_and_CI&sortby=rank

AUTHOR API -
https://api-na.hosted.exlibrisgroup.com/primo/v1/search?q=creator,contains,ernest%20hemingway&offset=0&limit=10&vid=01USC_INST:01USC&tab=Everything&apikey=YOUR_INSTITUTIONS_API_KEY&qInclude=facet_rtype,include,books&scope=MyInst_and_CI&sortby=rank

TITLE API -
https://api-na.hosted.exlibrisgroup.com/primo/v1/search?q=title,contains,ernest%20hemingway&offset=0&limit=10&vid=01USC_INST:01USC&tab=Everything&apikey=YOUR_INSTITUTIONS_API_KEY&qInclude=facet_rtype,include,books&scope=MyInst_and_CI&sortby=rank

SUBJECT API -
https://api-na.hosted.exlibrisgroup.com/primo/v1/search?q=sub,contains,ernest%20hemingway&offset=0&limit=10&vid=01USC_INST:01USC&tab=Everything&apikey=YOUR_INSTITUTIONS_API_KEY&qInclude=facet_rtype,include,books&scope=MyInst_and_CI&sortby=rank




Amazon Alexa Requirements -

USC Libraries Alexa skills have been made available on GitHub. The repository names are -

https://github.com/ilsstudent/AlexaLibrarySearch
https://github.com/ilsstudent/EventsAndHours
https://github.com/ilsstudent/LibrariesFAQ.git

You are welcome to use any of the USC Libraries Search, Events/Hours, or FAQ skills to create your own skill.


To begin the skill making process first -

Create an Alexa Developers Account (https://developer.amazon.com/), then

1. Go to https://developer.amazon.com/alexa and log in
   a. choose 'Alexa Skills Kit'
   b. choose 'Create Skill'

2. Once your skill has been coded, 'Save Model' then 'Build Model'

3. To submit skill for certification, select skill and choose the 'Certification' tab.

4. Once the skill passes the 'Validation and Functional Test' choices, select 'Submission'.



The second step in the skill making process -


Create a AWS - Amazon Web Services account (https://aws.amazon.com/console/), then

1. Go to https://console.aws.amazon.com/console/home?region=us-east-1 and log in

2. Choose Lambda under AWS Services/All Services/Compute/Lambda
   a. choose 'Functions'
   b. choose 'Create Function'

3. Once your index.js file has been coded, select the 'SAVE' button
