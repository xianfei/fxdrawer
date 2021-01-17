"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileAccess = exports.RemoteAuthorities = exports.Schemas = void 0;

const uri_1 = require("./uri");

const platform = require("./platform");

var Schemas;

(function (Schemas) {
  /**
   * A schema that is used for models that exist in memory
   * only and that have no correspondence on a server or such.
   */
  Schemas.inMemory = 'inmemory';
  /**
   * A schema that is used for setting files
   */

  Schemas.vscode = 'vscode';
  /**
   * A schema that is used for internal private files
   */

  Schemas.internal = 'private';
  /**
   * A walk-through document.
   */

  Schemas.walkThrough = 'walkThrough';
  /**
   * An embedded code snippet.
   */

  Schemas.walkThroughSnippet = 'walkThroughSnippet';
  Schemas.http = 'http';
  Schemas.https = 'https';
  Schemas.file = 'file';
  Schemas.mailto = 'mailto';
  Schemas.untitled = 'untitled';
  Schemas.data = 'data';
  Schemas.command = 'command';
  Schemas.vscodeRemote = 'vscode-remote';
  Schemas.vscodeRemoteResource = 'vscode-remote-resource';
  Schemas.userData = 'vscode-userdata';
  Schemas.vscodeCustomEditor = 'vscode-custom-editor';
  Schemas.vscodeNotebook = 'vscode-notebook';
  Schemas.vscodeNotebookCell = 'vscode-notebook-cell';
  Schemas.vscodeSettings = 'vscode-settings';
  Schemas.webviewPanel = 'webview-panel';
  /**
   * Scheme used for loading the wrapper html and script in webviews.
   */

  Schemas.vscodeWebview = 'vscode-webview';
  /**
   * Scheme used for loading resources inside of webviews.
   */

  Schemas.vscodeWebviewResource = 'vscode-webview-resource';
  /**
   * Scheme used for extension pages
   */

  Schemas.extension = 'extension';
})(Schemas = exports.Schemas || (exports.Schemas = {}));

class RemoteAuthoritiesImpl {
  constructor() {
    this._hosts = Object.create(null);
    this._ports = Object.create(null);
    this._connectionTokens = Object.create(null);
    this._preferredWebSchema = 'http';
    this._delegate = null;
  }

  setPreferredWebSchema(schema) {
    this._preferredWebSchema = schema;
  }

  setDelegate(delegate) {
    this._delegate = delegate;
  }

  set(authority, host, port) {
    this._hosts[authority] = host;
    this._ports[authority] = port;
  }

  setConnectionToken(authority, connectionToken) {
    this._connectionTokens[authority] = connectionToken;
  }

  rewrite(uri) {
    if (this._delegate) {
      return this._delegate(uri);
    }

    const authority = uri.authority;
    let host = this._hosts[authority];

    if (host && host.indexOf(':') !== -1) {
      host = `[${host}]`;
    }

    const port = this._ports[authority];
    const connectionToken = this._connectionTokens[authority];
    let query = `path=${encodeURIComponent(uri.path)}`;

    if (typeof connectionToken === 'string') {
      query += `&tkn=${encodeURIComponent(connectionToken)}`;
    }

    return uri_1.URI.from({
      scheme: platform.isWeb ? this._preferredWebSchema : Schemas.vscodeRemoteResource,
      authority: `${host}:${port}`,
      path: `/vscode-remote-resource`,
      query
    });
  }

}

exports.RemoteAuthorities = new RemoteAuthoritiesImpl();

class FileAccessImpl {
  asBrowserUri(uriOrModule, moduleIdToUrl) {
    const uri = this.toUri(uriOrModule, moduleIdToUrl);

    if (uri.scheme === Schemas.vscodeRemote) {
      return exports.RemoteAuthorities.rewrite(uri);
    }

    return uri;
  }

  asFileUri(uriOrModule, moduleIdToUrl) {
    const uri = this.toUri(uriOrModule, moduleIdToUrl);
    return uri;
  }

  toUri(uriOrModule, moduleIdToUrl) {
    if (uri_1.URI.isUri(uriOrModule)) {
      return uriOrModule;
    }

    return uri_1.URI.parse(moduleIdToUrl.toUrl(uriOrModule));
  }

}

exports.FileAccess = new FileAccessImpl();