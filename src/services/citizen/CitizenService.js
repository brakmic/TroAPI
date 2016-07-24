let baseUrl = 'http://troisdorf.de/web/de/stadt_rathaus/';
const citizenServicePath = 'buergerservice/dienstleistungen.htm?selection=';
const fakeCitizenServicePath = 'buergerservice';
const log = require('bows')('CitizenService');

/**
 * Citizen's Service class for querying the original pages from www.troisdorf.de
 * 
 * @export
 * @class CitizenService
 */
class CitizenService {

  constructor(props) {
    log(`Booting with props: ` + JSON.stringify(props, undefined, 4));
    if (props) {
      this.useLocalApi = props.useLocalApi;
      if (this.useLocalApi) {
        baseUrl = props.apiServer ? props.apiServer : 'http://localhost:3000/';
      }
    }
    this.settings     = null;
    this.postSettings = null;
    this.name         = 'CitizenService';
    this.init();
  }
  getPage(query) {
    const date = new Date().toUTCString();
    let serviceUrl = undefined;
    if (!this.useLocalApi) {
      serviceUrl = `${baseUrl}${citizenServicePath}${query}`;
    } else {
      serviceUrl = `${baseUrl}/${fakeCitizenServicePath}/${query}`;
    }
    log(`[${date}] : [REQUEST] ${serviceUrl}`);
    return this.executeFetch(serviceUrl);
  }
  init() {
    this.settings = {
      method: 'GET',
      // mode: 'no-cors',
      headers: {
          'Access-Control-Allow-Origin': '*',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': '',
        },
    };
    this.postSettings = {
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': '',
      },
    };
  }
  executeFetch(serviceQuery) {
    return fetch(serviceQuery);
  }
}

export {
  CitizenService
}
