import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Page, HtmlElement, HtmlLink, Contact } from '../../interfaces';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
const htmlParser = require('fast-html-parser');
const cuid = require('cuid');
import * as _ from 'lodash';

/**
 * This Service transforms raw HTML data into objects of type `Page`.
 *
 * @export
 * @class ScannerService
 * @extends {Subject<string>}
 */
export class ScannerService extends Subject<string> {
    private unwantedEntries: string[] = ['E-Mail senden ...'];
    private rootUrl: string = 'http://www.troisdorf.de';
    constructor() {
      super();
    }
    public getPages(): Observable<Promise<Page>> {
      return this.asObservable().map((url) => {
        return fetch(url)
                  .then((response) => response.text())
                  .then((data) => this.parse(url, data));
      });
      // return Observable.fromPromise();
    }
    /**
     * Parse a raw HTML page into an object of type `Page`.
     *
     * @private
     * @param {string} url
     * @param {string} data
     * @returns {Page}
     */
    private parse(url: string, data: string): Page {
      let page: Page = <Page> {
        id: cuid(),
        url,
        documents: [],
        contacts: [],
        attachments: [],
        noList: []
      };
      const root = htmlParser.parse(data);
      const col3Section: HtmlElement = root.querySelector('#col3_content');
      const col3SectionChildren = col3Section.childNodes;
      const contactSection = root.querySelector('#i4mindexsearchhidecontent');
      const title: HtmlElement = root.querySelector('#I4mIndexSearchTitle');
      const generalInfo = _.filter(col3SectionChildren, (c) => c.tagName === 'p')
                            .map((c) => _.replace(_.trim(c.text, '\r \n'), /\s+/g, ' '))
                            .join(' ');
      page.title = title.structuredText;
      page.info = generalInfo;
      const nolist: HtmlLink[] = this.getNoList(col3Section);
      if (!_.isEmpty(nolist)) {
        page.noList = nolist;
      }
      const boxes: HtmlElement[] = root.querySelectorAll('.box');
      _.each(boxes, (box) => {
        const dlist: HtmlLink[] = this.getDocumentList(box);
        if (!_.isEmpty(dlist)) {
          page.documents = dlist;
        }
        const attachments: HtmlLink[] = this.getAttachmentList(box);
        if (!_.isEmpty(attachments)) {
          page.attachments = attachments;
        }
        const llist: HtmlLink[] = this.getLinkList(box);
        if (!_.isEmpty(llist)) {
          page.linkList = llist;
        }
        page.contacts = this.getContactList(contactSection);
      });
      return page;
    }

    /**
     * Returns a list of downloadable documents (server root can be cofigured separately)
     *
     * @private
     * @param {HtmlElement} el
     * @returns {HtmlLink[]}
     */
    private getDocumentList(el: HtmlElement): HtmlLink[] {
      let list: HtmlLink[] = [];
      const dlist = el.querySelector('.dlist');
      if (!_.isEmpty(dlist)) {
          const listItems: HtmlElement[] = this.getItemList(dlist.childNodes);
          const downList = _.flatMap(listItems, (item) => {
              return this.getAnchorList(item.childNodes);
            });
          list = _.flatMap(downList, (down) => {
              return this.getHrefList([down], 'http://www.troisdorf.de');
            });
          }
      return list;
    }
    /**
     * Returns a list of attachments (external sources)
     *
     * @private
     * @param {HtmlElement} el
     * @returns {HtmlLink[]}
     */
    private getAttachmentList(el: HtmlElement): HtmlLink[] {
      const anchors: HtmlLink[] = [];
      const dlist = el.querySelector('.dlist');
      if (!_.isEmpty(dlist)) {
        const items = this.getItemList(dlist.childNodes);
        _.each(items, (li: any) => {
          const divs = _.filter(li.childNodes, (node: any) => node.tagName === 'div');
          _.each(divs, (div: any) => {
            const _anchors = this.getAnchorList(div.childNodes);
            const _hrefs = this.getHrefList(_anchors, this.rootUrl);
            _.concat(anchors, _hrefs);
          });
        });
      }
      return anchors;
    }
    /**
     * Returns a list of contacts (address information, phone, email etc.)
     *
     * @private
     * @param {HtmlElement} el
     * @returns {Contact[]}
     */
    private getContactList(el: HtmlElement): Contact[] {
      let contacts: Contact[] = [];
      const table = el.querySelector('.listTable');
      if (!_.isNil(table)) {
        const _trs = this.getTableRows(table.childNodes);
        contacts = _.map(_trs, (tr: HtmlElement) => {
          const data = this.extractContactData(tr.childNodes);
          const _data = _.split(tr.structuredText, '\n')
                         .filter((a) => !this.unwantedEntries.includes(a));
          const names = _.split(_.toString(data[0]), ',');
          const email = _.toString(data[1]);
          return <Contact> {
            fullName: `${_.trim(names[1])} ${_.trim(names[0])}`,
            firstName: _.trim(names[1]),
            lastName: _.trim(names[0]),
            email,
            phone: _.trim(_.replace(_.toString(data[2]), 'Tel.', '')),
            fax: _.trim(_.replace(_.toString(data[3]), 'Fax', '')),
            address: _data[3],
            room: _data[4]
          };
        });
      }
      return contacts;
    }
    /**
     * Returns a `no-list` based on the original HTML-structure with class `nolist`
     *
     * @private
     * @param {HtmlElement} el
     * @returns {HtmlLink[]}
     */
    private getNoList(el: HtmlElement): HtmlLink[] {
      let result: HtmlLink[] = [];
      const nolist = el.querySelector('.nolist');
      if (!_.isEmpty(nolist)) {
          const items = this.getItemList(nolist.childNodes);
          result = _.flatMap(items, (item) => {
            const anchors = this.getAnchorList(item.childNodes);
            return this.getHrefList(anchors);
          });
      }
      return result;
    }
    /**
     * Returns a list of external links
     *
     * @private
     * @param {HtmlElement} el
     * @returns {HtmlLink[]}
     */
    private getLinkList(el: HtmlElement): HtmlLink[] {
      let result: HtmlLink[] = [];
      const llist = el.querySelectorAll('.ext');
      if (!_.isEmpty(llist)) {
            result = _.flatMap(llist, (item) => {
              const downloads: HtmlElement[] = this.getAnchorList(item.childNodes);
              return this.getHrefList(downloads);
            });
          }
      return result;
    }
    /**
     * Returns an array containing HTML <LI> entries
     *
     * @private
     * @param {HtmlElement[]} nodes
     * @returns {HtmlElement[]}
     */
    private getItemList(nodes: HtmlElement[]): HtmlElement[] {
      return _.filter(nodes, (node: any) => node.tagName === 'li');
    }
    /**
     * Returns an array of HTML <A> entries
     *
     * @private
     * @param {HtmlElement[]} elements
     * @returns {HtmlElement[]}
     */
    private getAnchorList(elements: HtmlElement[]): HtmlElement[] {
      return _.filter(elements, (node: any) => node.tagName === 'a');
    }
    /**
     * Returns a list or HTML <TR> entries internally extracted from a <TBODY>
     *
     * @private
     * @param {HtmlElement[]} elements
     * @returns {HtmlElement[]}
     */
    private getTableRows(elements: HtmlElement[]): HtmlElement[] {
      let rows: HtmlElement[] = [];
      const tbody = _.find(elements, (node: any) => node.tagName === 'tbody');
      if (!_.isNil(tbody)) {
        rows = _.filter(tbody.childNodes, (node: any) => node.tagName === 'tr');
      }
      return rows;
    }
    /**
     * Returns a list of HTML <TD> entries
     *
     * @private
     * @param {HtmlElement[]} elements
     * @returns {HtmlElement[]}
     */
    private getTableDatas(elements: HtmlElement[]): HtmlElement[] {
      let data: HtmlElement[] = [];
      data = _.flatMap(elements, (el: any) => {
        return _.filter(el.childNodes, (node: any) => node.tagName === 'td');
      });
      return data;
    }
    /**
     * Extracts raw data for future composing of contact entries
     *
     * @private
     * @param {HtmlElement[]} elements
     * @returns {HtmlElement[]}
     */
    private extractContactData(elements: HtmlElement[]): HtmlElement[] {
      let data: HtmlElement[] = [];
      data = _.flatMap(elements, (el) => {
        return _.map(el.childNodes, (n: any) => {
          if (n.tagName === 'p') {
            const email = this.extractEMail(n);
            if (!_.isNil(email)) {
              return email;
            }
          }
          if (n.tagName === 'p' ||
              n.tagName === 'span' ||
              n.tagName === 'h5') {
              return n.text;
            }
          return '';
        });
      });
      return _.filter(data, (d) => !_.isEmpty(d));
    }
    /**
     * Extracts the raw email entry from an HTML <INPUT> field
     *
     * @private
     * @param {HtmlElement} el
     * @returns {string}
     */
    private extractEMail(el: HtmlElement): string {
      const inputNode: HtmlElement = _.find(el.childNodes, (node: HtmlElement) =>
                                                              node.tagName === 'input');
      if (!_.isEmpty(inputNode)) {
        return inputNode.rawAttributes.value;
      }
      return undefined;
    }
    /**
     * Returns a list of HTML <HREF> attributes
     *
     * @private
     * @param {HtmlElement[]} entries
     * @param {string} [rootUrl='']
     * @returns {HtmlLink[]}
     */
    private getHrefList(entries: HtmlElement[], rootUrl: string = ''): HtmlLink[] {
      const links = _.map(entries, (dload) => {
                const docTitle = _.trim(dload.structuredText);
                const docPath = dload.attributes.href;
                return <HtmlLink> {
                  title: docTitle,
                  url: `${rootUrl}${docPath}`
                };
              });
      return links;
    }
}
