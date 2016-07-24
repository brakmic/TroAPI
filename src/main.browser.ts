import { App } from './app';
import { ScannerService, SearchService } from './services';
interface WindowEx extends Window {
    TroApi: any; // for debugging purposes only!
}

const search = new SearchService();
const scanner = new ScannerService();

// Currently, we do not use any of the available JS-frameworks.
const app = new App(scanner, search);

(<WindowEx>window).TroApi = {
    app: app,
    scanner: scanner,
    search: search
};