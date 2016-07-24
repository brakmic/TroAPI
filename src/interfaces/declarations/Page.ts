import { HtmlLink } from './HtmlLink';
import { HtmlElement } from './HtmlElement';
import { Contact } from './Contact';

/**
 * Represents a page with accessible elements (links, attachments etc.)
 * 
 * @export
 * @interface Page
 */
export interface Page {
    id: string;
    url: string;
    title?: string;
    info?: string;
    documents?: HtmlLink[];
    attachments?: HtmlLink[];
    linkList?: HtmlLink[];
    noList?: HtmlLink[];
    contacts?: Contact[];
}
