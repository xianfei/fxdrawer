"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThemableCheckboxActionViewItem = void 0;

const checkbox_1 = require("../../../base/browser/ui/checkbox/checkbox");

const styler_1 = require("../common/styler");

class ThemableCheckboxActionViewItem extends checkbox_1.CheckboxActionViewItem {
  constructor(context, action, options, themeService) {
    super(context, action, options);
    this.themeService = themeService;
  }

  render(container) {
    super.render(container);

    if (this.checkbox) {
      this.disposables.add(styler_1.attachCheckboxStyler(this.checkbox, this.themeService));
    }
  }

}

exports.ThemableCheckboxActionViewItem = ThemableCheckboxActionViewItem;