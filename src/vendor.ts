// Vendor scripts go here
// -----------------------
import 'jquery';

// Angular 2
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/core';
import '@angular/common';
import '@angular/compiler';
import '@angular/http';
import '@angular/router';

// RxJS
import 'rxjs';

// Immutable
import 'immutable';

// Hammjer.js
import 'hammerjs';

// Lodash
import * as _ from 'lodash';
// Themes
import 'bootstrap-loader';
import 'font-awesome-sass-loader';

// Prevent Ghost Clicks (for Hammer.js)
import './platform/helpers/browser-events';

// Circular JSON (for better serializing of complex objects)
import 'circular-json';

if ('production' === ENV) {
  // Production

} else {
  // Development
  require('angular2-hmr');
}
