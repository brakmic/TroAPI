import { Page, HtmlElement,
         HtmlLink, Contact,
         IndexingReport, SearchQuery,
         FieldEntry, SearchResult,
         IndexedDocument } from '../../interfaces';
const htmlParser = require('fast-html-parser');
const cuid = require('cuid');
import * as _ from 'lodash';
const elasticlunr = require('elasticlunr');
const config = {
                    fields: {
                        title: {boost: 1},
                        body: { boost: 2}
                    },
                    boolean: 'OR'
                };

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
            body: page.info,
            url: page.url
        });
        console.log(`INDEXED : ${page.title} | ${page.info}`);
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
        const results: any[] = this.index.search(query, config);
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
          this.setRef('id');
          this.addField('title');
          this.addField('body');
          this.addField('url');
      });
    }
}
