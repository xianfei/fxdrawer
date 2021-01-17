"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodiconLabel = void 0;

const dom_1 = require("../../dom");

const codicons_1 = require("../../codicons");

class CodiconLabel {
  constructor(_container) {
    this._container = _container;
  }

  set text(text) {
    dom_1.reset(this._container, ...codicons_1.renderCodicons(text !== null && text !== void 0 ? text : ''));
  }

  set title(title) {
    this._container.title = title;
  }

}

exports.CodiconLabel = CodiconLabel;