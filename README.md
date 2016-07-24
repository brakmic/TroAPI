#### [Troisdorf](https://en.wikipedia.org/wiki/Troisdorf) [API](https://en.wikipedia.org/wiki/Application_programming_interface)

![Troisdorf Logo](https://s32.postimg.org/rijxkp6gj/tro_logo.png)

This is a project to convert the web pages of the [Troisdorf Municipality](http://troisdorf.de/web/en/index.htm) into a:

 - set of JSON-based Web-APIs 
 - full-text search engine    
 - device-, form-factor and vendor-independent service platform

The only requirement is a modern Web Browser like *IE 11*, *Chrome*, *Firefox*, *Safari*, *Opera* etc.

Notice: *This is not an official project of the Troisdorf Municipality.*   

#### Infrastructure

The majority of the project's code is written in TypeScript for enhanced type-safety with some minor
exceptions written in pure JavaScript. Currently, none of the available JavaScript-frameworks is in 
use as this project strives to fulfill the above mentioned goals without using more than the 
`standard libs` like *lodash*, *rxjs*, *babel*, *jQuery* (for UI demos only!) etc. 

Of course, it wouldn't be a problem to use a framework like AngularJS or React but at this stage of development 
any additional weight should rather be avoided. 

##### Transforming HTML Pages into JSON Documents

Like many other municipalities Troisdorf offers a wealth of documents, contact data, links and other 
useful resources for its inhabitants. Usually, one has to click several buttons or try several links 
until the needed document or telephone number appears. And sometimes it's almost impossible to use 
these services, for example when accessing them via a mobile device. Therefore, we have to extract 
all the useful (structural & semantic) information from these web pages and serialize them into a 
more flexible format. Like JSON, for example. This part is done by the [ScannerService](https://github.com/brakmic/TroAPI/blob/master/src/services/scanner/scanner.service.ts#L40) that takes 
HTML documents and extracts certain areas from them. According to several tests the HTML documents
follow some strict conventions regarding their structure and naming of attributes. 

##### Creating a Full-Text Search Engine

As far as I know Troisdorf's citizen services delivers its services via HTML documents and there 
isn't any kind of API (XML or JSON) available. Of course, it would be of much help if an ordinary citizen could
simply type in a few terms he/she understands and let the machine do the searching & filtering business.
Searching for information via HTML is only acceptable if you can find it within a few clicks. But 
searching for things often written in *Legal German* without having any kind of directly 
accessible index (a [search engine](https://github.com/brakmic/TroAPI/blob/master/src/services/search/search.service.ts)) can quickly become very tedious and time-consuming. This is the reason
this project uses the JSON-serialized information to build up a full-text search 
index for direct consumption. Moreover, one can [extend it on-the-fly by simply using its APIs](https://github.com/brakmic/TroAPI/blob/master/src/services/search/search.service.ts#L28).    

##### Device and Vendor Independence with APIs 

Having a lot of valuable information is only a single brick in a much greater structure. The information 
must be free of any kind lock-in like format, vendor (iPhone, Android), form-factor (screen-size, resolution etc.).
This is the reason this project uses only those languages and technologies that do not impose any kind of 
restrictions on the developer and/or future user of these services. 

This projects relies heavily on following OpenSource projects, technologies & formats: 

 - [TypeScript](https://www.typescriptlang.org/)
 - [JSON](http://json.org/)
 - [WebPack](https://webpack.github.io/)
 - [Babel](https://babeljs.io/)
 - [RxJS](http://reactivex.io/)
 - [LoDash](https://lodash.com/)
 - [Elasticlunr.js](http://elasticlunr.com/)

##### Installation 

Clone this repo and then install NPM packages with `npm install`.

##### Running 

*Local Mode*

For local testing without accessing Troisdorf's Web Pages use the HTML pahes saved in `src/views` subdirectory. 
Then change two variables in *main.ts*:
 - the `siteRoot` variable should point to `views` directory
 - the `ids` array should contain names of documents from `views` directory 

To run the application in *local mode* type `npm run start:hmr` and open [http://localhost:3001](http://localhost:3001) in your browser.

*Remote Mode*

For testing by using Troisdorf Municipality Web Pages set the above mentioned `siteRoot` and `ids` to point to the real 
URL respective real three-digit IDs (those IDs point to the public HTML documents). 

The `siteRoot` should be set to: `http://troisdorf.de/web/de/stadt_rathaus/buergerservice/dienstleistungen.htm?selection=`
The `ids` array should contain valid, three-digit IDs like `['042','056','096']`. Notice that the IDs are not of type 
`number` but `string` as they mostly start with a leading zero.

To run in *remote mode* one must start two separate NodeJS processes:

 - Hapi-Server for remote access (to avoid CORS errors)
 - Local in-browser Client-App that'll use the Hapi-Server to request real HTML documents.

 To start Hapi type `npm run api`. 

 ![HapiServer](https://s31.postimg.org/56zgd629l/tro_api_server.png)

 To start the client app type `npm run start:hmr`.

 ##### Client Application 

 For testing the parsing and indexing services there's a simple, jQuery-based client application available.
 Its UI comprises of two parts:

 - A collection of currently parsed HTML documents shown in *collapsible item groups*.
 - A *search tool* for querying the index.

 ![Demo App](http://imageup.info/upload/big/2016/07/24/57951a46029f1.png)

 An item can contain different categories (documents, attachments, contacts, links etc.).

 ![Items](https://s31.postimg.org/7rmnhqdjt/troapi_2.png)

 The search tool utilizes the full-text indexing engine to deliver links to Troisdorf Municipality Web Pages.

 ![Search Tool](https://s31.postimg.org/jjswbo9gp/troapi_3.png)

 #### License 

 [MIT](https://github.com/brakmic/TroAPI/blob/master/LICENSE)