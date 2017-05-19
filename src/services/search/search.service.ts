import { Page, HtmlElement,
         HtmlLink, Contact,
         IndexingReport, SearchQuery,
         FieldEntry, SearchResult,
         IndexedDocument } from '../../interfaces';
const htmlParser = require('fast-html-parser');
const cuid = require('cuid');
import * as _ from 'lodash';
const elasticlunr = require('elasticlunr');

/**
 * Provides indexing and search services.
 *
 * @export
 * @class SearchService
 */
export class SearchService {
    private index: any;
    constructor() {
      this.init();
    }
    /**
     * Adds a Page object to the internal index.
     *
     * @param {Page} page
     * @returns {Promise<IndexingReport>}
     */
    public addDocument(page: Page): Promise<IndexingReport> {
        this.index.addDoc({
            id: page.id,
            title: page.title,
            info: page.info,
            url: page.url
        });
        return Promise.resolve(
            {
                id: cuid(),
                docId: page.id,
                succeeded: true,
                timeStamp: new Date().toString()
            } as IndexingReport);
    }
    /**
     * Returns an indexed object with given Id.
     *
     * @param {string} id
     * @returns {Promise<IndexedDocument>}
     */
    public getDocument(id: string): Promise<IndexedDocument> {
        return Promise.resolve(this.index.documentStore.getDoc(id) as IndexedDocument);
    }
    public search(query: string): Promise<SearchResult[]> {
        const results: any[] = this.index.search(query);
        const mapped = _.map(results, (result) => {
            return {
                ref: result.ref,
                score: result.score
            } as SearchResult;
        });
        return Promise.resolve(mapped);
    }
    /**
     * Initializes indexing services.
     *
     * @private
     */
    private init() {
      this.index = elasticlunr(function() {
          this.addField('title');
          this.addField('info');
          this.addField('url');
      });
    }
}
