/**
 * Represents an HTML element  
 * 
 * @export
 * @interface HtmlElement
 */
export interface HtmlElement {
  attributes: any;
  childNodes: any[];
  classNames: any;
  firstChild: any;
  lastChild: any;
  rawAttributes: any;
  rawAttrs: string;
  rawText: string;
  structuredText: string;
  tagName: string;
  text: string;
  querySelector(selector: any): any;
  querySelectorAll(selector: any): any[];
}
