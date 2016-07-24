import { FieldEntry } from './FieldEntry';
/**
 * Search Query Interface
 * 
 * @export
 * @interface SearchQuery
 */
export interface SearchQuery {
    id: string;
    timeStamp: string;
    fields: FieldEntry[];
}
