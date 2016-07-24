export interface IndexingReport {
    id: string;
    timeStamp: string;
    docId: string;
    succeeded: boolean;
    errorInfo?: string;
}
