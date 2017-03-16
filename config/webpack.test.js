const helpers = require('./helpers');
const path = require('path');

/**
 * Webpack Plugins
 */
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'test';

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function(options) {
  return {
  /**
   * Source map for Karma from the help of karma-sourcemap-loader &  karma-webpack
   *
   * Do not change, leave as is or it wont work.
   * See: https://github.com/webpack/karma-webpack#source-maps
   */
  devtool: 'inline-source-map',

  /**
   * Options affecting the resolving of modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#resolve
   */
  resolve: {

    /**
     * An array of extensions that should be used to resolve modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
     */
    extensions: ['.ts', '.js'],

    /**
    * Make sure root is src
    */
    modules: [ helpers.root('src'), 'node_modules' ]

  },

  /**
   * Options affecting the normal modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#module
   */
  module: {

    /**
     * An array of automatically applied loaders.
     *
     * IMPORTANT: The loaders here are resolved relative to the resource which they are applied to.
     * This means they are not resolved relative to the configuration file.
     *
     * See: http://webpack.github.io/docs/configuration.html#module-loaders
     */
    rules: [

      /**
       * Tslint loader support for *.ts files
       *
       * See: https://github.com/wbuchwalter/tslint-loader
       */
      {
        enforce: 'pre',
        test: /\.ts$/,
        use: 'tslint-loader',
        exclude: [helpers.root('node_modules'),
                  helpers.root('src/app/apis/definitions/images.ts'),
                  helpers.root('src/app/apis/definitions/logons.ts'),
                  helpers.root('src/app/apis/definitions/menus.ts'),
                  helpers.root('src/app/apis/definitions/retail.ts'),
                  helpers.root('src/app/services/module/gridconfig_demo.ts')]
      },

      /**
       * Source map loader support for *.js files
       * Extracts SourceMaps for source files that as added as sourceMappingURL comment.
       *
       * See: https://github.com/webpack/source-map-loader
      */
      // {
      //     enforce: 'pre',
      //     test: /\.js$/,
      //     use: 'source-map-loader',
      //     exclude: [
      //     // these packages have problems with their sourcemaps
      //     helpers.root('node_modules/rxjs'),
      //     helpers.root('node_modules/@angular'),
      //     helpers.root('src/platform/helpers/bows-alt'),
      //   ]
      // },
      {
         test: /\.ts$/,
         use: [
            'awesome-typescript-loader?sourceMap=false,inlineSourceMap=true,compilerOptions{}=removeComments:true',
            'angular2-template-loader',
             'angular-router-loader'
         ],
         exclude: [/\.e2e\.ts$/]
      },
      {
         test: /\.(html|css)$/,
         use: 'raw-loader',
         exclude: [helpers.root('src/index.html')]
      },
      /**
       * Json loader support for *.json files.
       *
       * See: https://github.com/webpack/json-loader
       */
      {
        test: /\.json$/,
        use: 'json-loader',
        exclude: [helpers.root('src/index.html')]
      },
      /*
      * Load Sass Styles
      * See: See: https://github.com/jtangelder/sass-loader
      */
      {
        test: /\.scss$/,
        use: ['to-string-loader','raw-loader', 'sass-loader'],
        exclude: [helpers.root('src/index.html')]
      },

      /**
       * Instruments JS files with Istanbul for subsequent code coverage reporting.
       * Instrument only testing sources.
       *
       * See: https://github.com/deepsweet/istanbul-instrumenter-loader
       */
      // {
      //   enforce: 'post',
      //   test: /\.(js|ts)$/,
      //   use: 'istanbul-instrumenter-loader',
      //   include: helpers.root('src'),
      //   exclude: [
      //     /\.(e2e|spec)\.ts$/,
      //     /node_modules/,
      //     /vendor/,
      //     /bows-alt/
      //   ]
      // }

    ]
  },

  /**
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [


    /**
    * Plugin LoaderOptionsPlugin (experimental)
    *
    * See: https://gist.github.com/sokra/27b24881210b56bbaff7
    */
    new LoaderOptionsPlugin({
      debug: true,
      options: {
        context: __dirname,
        output: {
          path: helpers.root('dist')
        },
        /**
         * Static analysis linter for TypeScript advanced options configuration
         * Description: An extensible linter for the TypeScript language.
         *
         * See: https://github.com/wbuchwalter/tslint-loader
         */
        tslint: {
          emitErrors: false,
          failOnHint: false,
          resourcePath: 'src'
        },

      }
    }),
    /**
     * Plugin: DefinePlugin
     * Description: Define free variables.
     * Useful for having development builds with debug logging or adding global constants.
     *
     * Environment helpers
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
     */
    // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
    new DefinePlugin({
      'ENV': JSON.stringify(ENV),
      'HMR': false,
      'process.env': {
        'ENV': JSON.stringify(ENV),
        'NODE_ENV': JSON.stringify(ENV),
        'HMR': false,
      }
    }),

    /**
     * Plugin: ContextReplacementPlugin
     * Description: Provides context to Angular's use of System.import
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
     * See: https://github.com/angular/angular/issues/11580
     */
    new ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      helpers.root('src') // location of your src
    ),

  ],

  /**
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
   *
   * See: https://webpack.github.io/docs/configuration.html#node
   */
  node: {
    global: true,
    process: true,
    crypto: 'empty',
    module: false,
    clearImmediate: false,
    setImmediate: false
  }

  };

};
