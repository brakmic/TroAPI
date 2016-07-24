/**
 * Contains information about an indexing attempt
 * 
 * @export
 * @interface IndexingReport
 */
export interface IndexingReport {
    id: string;
    timeStamp: string;
    docId: string;
    succeeded: boolean;
    errorInfo?: string;
}
