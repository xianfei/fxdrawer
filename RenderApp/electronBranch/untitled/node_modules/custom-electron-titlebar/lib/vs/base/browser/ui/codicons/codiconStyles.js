"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatRule = exports.CodiconStyles = void 0;

require("../../../../css!./codicon/codicon");

require("../../../../css!./codicon/codicon-modifications");

require("../../../../css!./codicon/codicon-animations");

const codicons_1 = require("../../../common/codicons");

exports.CodiconStyles = new class {
  constructor() {
    this.onDidChange = codicons_1.iconRegistry.onDidRegister;
  }

  getCSS() {
    const rules = [];

    for (let c of codicons_1.iconRegistry.all) {
      rules.push(formatRule(c));
    }

    return rules.join('\n');
  }

}();

function formatRule(c) {
  let def = c.definition;

  while (def instanceof codicons_1.Codicon) {
    def = def.definition;
  }

  return `.codicon-${c.id}:before { content: '${def.character}'; }`;
}

exports.formatRule = formatRule;