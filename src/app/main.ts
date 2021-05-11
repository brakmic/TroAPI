import './loader';
const domready = require('domready');
const htmlParser = require('fast-html-parser');
const troUrl =
'http://troisdorf.de/web/de/stadt_rathaus/buergerservice/dienstleistungen.htm?selection=';
const logger = require('bows')('App');
// Lodash
import * as _ from 'lodash';
// RxJS
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
// Interfaces
import { Contact, HtmlElement, HtmlLink, Page } from '../interfaces';
// Services
import { ScannerService, SearchService } from '../services';

/**
 * Main class
 */
export class App {
  private root: string = '#page-list-root';
  private pagesObservable: Observable<Page>;
  private pagesSubscription: Subscription;
  private siteRoot: string = 'http://localhost:3000/buergerservice/';
  constructor(private scanner: ScannerService,
              private search: SearchService) {
    this.loadDocuments();
    this.initSearchTools();
  }
  /**
   * Here we register our handlers for processing the stream of future `Pages`.
   * Also, we set-up all the needed templates to dynamically group and insert
   * documents.
   *
   * Notice: to function correctly when querying document from the original server
   * at www.troisdorf.de we must run a separate Hapi-Server instance (or any other compatible
   * NodeJS web server). This is to avoid CORS (cross-origin) problems as we can't simply
   * request a document from a foreign domain. The usage of Hapi isn't mandatory as it's also
   * possible to query for locally available documents. There are a few of them located under
   * `views`. Just change the `siteRoot` variable to point to this directory and also
   * define the `ids` array to contain the names of available view*.html documents. One can
   * easily expand this collection by simply querying an HTML page from
   * `http://troisdorf.de/web/de/stadt_rathaus/buergerservice/dienstleistungen.htm?selection=NUM`
   * and saving it under a new name, e.g. `view23.html`. Don't forget to replace NUM with
   * a valid, three-digit selection number, for example: 056, 097, 045
   */
  private loadDocuments(): void {
    const rootEl = $(`${this.root}`);
    const ids: string[] = ['035', '036',
      '067', '096',
      '045', '049',
      '042', '041',
      '079', '164',
      '077', '010',
      '039'];
    // Alternative array of IDs when loading html docs locally.
    // Also don't forget to change `siteRoot` to the local 'views/' directory
    // The Hapi server isn't needed when dealing with local view*.html files.
    /*
    *
    * ['view1.html',
        'view2.html',
        'view3.html',
        'view4.html',
        'view5.html',
        'view6.html',
        'view7.html',
        'view8.html'];
    *
    */

    /**
     * This is just a simple demo comprising of several jQuery calls and a few
     * super-simple HTML templates. As this demo avoids using any of the available
     * frameworks (Angular, React etc.) it tries to remain `bare bones`.
     */
    this.pagesSubscription = this.scanner.getPages().subscribe((page) => {
      page.then((data) => {
        this.search.addDocument(data).then((report) => logger(report));
        rootEl.append(this.getListGroupItemTemplate(`${data.id}-root`, data.title));
        const localRoot = $(`#${data.id}-root`);
        if (!_.isEmpty(data.documents)) {
          localRoot.append(this.getListGroupItemTemplate(`${data.id}-documents`, 'Dokumente'));
          _.each(data.documents, (doc) => {
            $(`#${data.id}-documents`).append(
              this.getListGroupItemEntryTemplate(doc.url, doc.title));
          });
        }
        if (!_.isEmpty(data.attachments)) {
          localRoot.append(this.getListGroupItemTemplate(`${data.id}-attachments`, 'Anhänge'));
          _.each(data.attachments, (doc) => {
            $(`#${data.id}-attachments`).append(
              this.getListGroupItemEntryTemplate(doc.url, doc.title));
          });
        }
        if (!_.isEmpty(data.linkList)) {
          localRoot.append(this.getListGroupItemTemplate(`${data.id}-linklist`, 'Links'));
          _.each(data.linkList, (doc) => {
            $(`#${data.id}-linklist`).append(
              this.getListGroupItemEntryTemplate(doc.url, doc.title)
            );
          });
        }
        if (!_.isEmpty(data.noList)) {
          localRoot.append(this.getListGroupItemTemplate(`${data.id}-nolist`,
            'Weiterführende Links'));
          _.each(data.noList, (doc) => {
            $(`#${data.id}-nolist`).append(
              this.getListGroupItemEntryTemplate(doc.url, doc.title)
            );
          });
        }
        if (!_.isEmpty(data.contacts)) {
          localRoot.append(`
              <a href="#${data.id}-contacts" class="list-group-item" data-toggle="collapse">
                <i class="glyphicon glyphicon-chevron-right"></i>Ansprechpartner
              </a>
              <div class="list-group collapse" id="${data.id}-contacts">
                <div class="panel panel-default">
                  <div class="panel-body">
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th>Kontakt</th>
                          <th>Telefon</th>
                          <th>Fax</th>
                          <th>Email</th>
                        </tr>
                      </thead>
                      <tbody id="${data.id}-address-rows">
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            `);
          _.each(data.contacts, (doc) => {
            $(`#${data.id}-address-rows`).append(
              `<tr>
                   <td>${doc.fullName}</td>
                   <td>${doc.phone}</td>
                   <td>${doc.fax}</td>
                   <td>${doc.email}</td>
                </tr>`
            );
          });
        }
        $(() => {
          $('.list-group-item').unbind('click');
          $('.list-group-item').on('click', () => {
            $('.glyphicon', this)
              .toggleClass('glyphicon glyphicon-chevron-up glyphicon glyphicon-chevron-down');
          });
        });
      });
    });
    _.each(ids, (id) => this.scanner.next(this.siteRoot + id));
  }
  private initSearchTools() {
    const self = this;
    const rootId = '#search-tools';
    const searchResultsId = 'search-results';
    const searchBtnId = 'do-search';
    const searchTermId = 'search-term';
    const template = `
<div class="panel">
    <div class="panel-heading">Suche</div>
    <div class="panel-body">
      <div class="input-group">
        <input id="${searchTermId}" type="text" class="form-control" placeholder="Suchen nach...">
        <span class="input-group-btn">
          <button id="${searchBtnId}" class="btn btn-default" type="button">Los!</button>
        </span>
      </div>
    </div>
</div>
      `;
    $(rootId).append(template);
    $(`#${searchBtnId}`).on('click', () => {
      const documents = $(`#${searchResultsId}`).
        empty().
        append('<div class="list-group"></div>');
      const term = $(`#${searchTermId}`).val();
      self.search.search(term).then((results) => {
        _.each(results, (result) => {
          self.search.getDocument(result.ref).then((doc) => {
            let _url = doc.url;
            if (_url.includes('localhost')) {
              const split = _url.split('/');
              _url = `${troUrl}${split[split.length - 1]}`;
            }
            documents.append(`<li class="list-group-item">
              <a href="${_url}">${doc.title}</a>
              </li>`);
          });
        });
      });
    });
  }
  /**
   * Helper function for creating the item-group headers.
   *
   * @private
   * @param {string} id
   * @param {string} title
   * @returns
   */
  private getListGroupItemTemplate(id: string, title: string) {
    return `
              <a href="#${id}" class="list-group-item" data-toggle="collapse">
                <i class="glyphicon glyphicon-chevron-right"></i>${title}
              </a>
               <div class="list-group collapse" id="${id}"></div>
            `;
  }
  /**
   * Helper function for creating item-group entries.
   *
   * @private
   * @param {string} url
   * @param {string} title
   * @returns
   */
  private getListGroupItemEntryTemplate(url: string, title: string) {
    return ` <a href="${url}" class="list-group-item">${title}
                  <span class="glyphicon glyphicon-download"></span></a>
                </a>
              `;
  }
}
