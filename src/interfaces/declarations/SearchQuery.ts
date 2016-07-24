import { FieldEntry } from './FieldEntry';

export interface SearchQuery {
    id: string;
    timeStamp: string;
    fields: FieldEntry[];
}
