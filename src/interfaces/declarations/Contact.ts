/**
 * Represents a contact extracted from the HTML <TABLE> with class `listTable` 
 * 
 * @export
 * @interface Contact
 */
export interface Contact {
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  fax: string;
  email: string;
  address: string;
  room: string;
}
