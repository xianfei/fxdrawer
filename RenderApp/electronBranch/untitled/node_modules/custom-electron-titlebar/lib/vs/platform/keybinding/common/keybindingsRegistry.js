"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeybindingsRegistry = void 0;

const keyCodes_1 = require("../../../base/common/keyCodes");

const platform_1 = require("../../../base/common/platform");

class KeybindingsRegistryImpl {
  constructor() {
    this._coreKeybindings = [];
    this._extensionKeybindings = [];
    this._cachedMergedKeybindings = null;
  }
  /**
   * Take current platform into account and reduce to primary & secondary.
   */


  static bindToCurrentPlatform(kb) {
    if (platform_1.OS === 1
    /* Windows */
    ) {
        if (kb && kb.win) {
          return kb.win;
        }
      } else if (platform_1.OS === 2
    /* Macintosh */
    ) {
        if (kb && kb.mac) {
          return kb.mac;
        }
      } else {
      if (kb && kb.linux) {
        return kb.linux;
      }
    }

    return kb;
  }
  /**
   * Take current platform into account and reduce to primary & secondary.
   */


  static bindToCurrentPlatform2(kb) {
    if (platform_1.OS === 1
    /* Windows */
    ) {
        if (kb && kb.win) {
          return kb.win;
        }
      } else if (platform_1.OS === 2
    /* Macintosh */
    ) {
        if (kb && kb.mac) {
          return kb.mac;
        }
      } else {
      if (kb && kb.linux) {
        return kb.linux;
      }
    }

    return kb;
  }

  registerKeybindingRule(rule) {
    const actualKb = KeybindingsRegistryImpl.bindToCurrentPlatform(rule);

    if (actualKb && actualKb.primary) {
      const kk = keyCodes_1.createKeybinding(actualKb.primary, platform_1.OS);

      if (kk) {
        this._registerDefaultKeybinding(kk, rule.id, rule.args, rule.weight, 0, rule.when);
      }
    }

    if (actualKb && Array.isArray(actualKb.secondary)) {
      for (let i = 0, len = actualKb.secondary.length; i < len; i++) {
        const k = actualKb.secondary[i];
        const kk = keyCodes_1.createKeybinding(k, platform_1.OS);

        if (kk) {
          this._registerDefaultKeybinding(kk, rule.id, rule.args, rule.weight, -i - 1, rule.when);
        }
      }
    }
  }

  setExtensionKeybindings(rules) {
    let result = [],
        keybindingsLen = 0;

    for (let i = 0, len = rules.length; i < len; i++) {
      const rule = rules[i];
      let actualKb = KeybindingsRegistryImpl.bindToCurrentPlatform2(rule);

      if (actualKb && actualKb.primary) {
        result[keybindingsLen++] = {
          keybinding: actualKb.primary,
          command: rule.id,
          commandArgs: rule.args,
          when: rule.when,
          weight1: rule.weight,
          weight2: 0,
          extensionId: rule.extensionId || null
        };
      }
    }

    this._extensionKeybindings = result;
    this._cachedMergedKeybindings = null;
  }

  static _mightProduceChar(keyCode) {
    if (keyCode >= 21
    /* KEY_0 */
    && keyCode <= 30
    /* KEY_9 */
    ) {
        return true;
      }

    if (keyCode >= 31
    /* KEY_A */
    && keyCode <= 56
    /* KEY_Z */
    ) {
        return true;
      }

    return keyCode === 80
    /* US_SEMICOLON */
    || keyCode === 81
    /* US_EQUAL */
    || keyCode === 82
    /* US_COMMA */
    || keyCode === 83
    /* US_MINUS */
    || keyCode === 84
    /* US_DOT */
    || keyCode === 85
    /* US_SLASH */
    || keyCode === 86
    /* US_BACKTICK */
    || keyCode === 110
    /* ABNT_C1 */
    || keyCode === 111
    /* ABNT_C2 */
    || keyCode === 87
    /* US_OPEN_SQUARE_BRACKET */
    || keyCode === 88
    /* US_BACKSLASH */
    || keyCode === 89
    /* US_CLOSE_SQUARE_BRACKET */
    || keyCode === 90
    /* US_QUOTE */
    || keyCode === 91
    /* OEM_8 */
    || keyCode === 92
    /* OEM_102 */
    ;
  }

  _assertNoCtrlAlt(keybinding, commandId) {
    if (keybinding.ctrlKey && keybinding.altKey && !keybinding.metaKey) {
      if (KeybindingsRegistryImpl._mightProduceChar(keybinding.keyCode)) {
        console.warn('Ctrl+Alt+ keybindings should not be used by default under Windows. Offender: ', keybinding, ' for ', commandId);
      }
    }
  }

  _registerDefaultKeybinding(keybinding, commandId, commandArgs, weight1, weight2, when) {
    if (platform_1.OS === 1
    /* Windows */
    ) {
        this._assertNoCtrlAlt(keybinding.parts[0], commandId);
      }

    this._coreKeybindings.push({
      keybinding: keybinding,
      command: commandId,
      commandArgs: commandArgs,
      when: when,
      weight1: weight1,
      weight2: weight2,
      extensionId: null
    });

    this._cachedMergedKeybindings = null;
  }

  getDefaultKeybindings() {
    if (!this._cachedMergedKeybindings) {
      this._cachedMergedKeybindings = [].concat(this._coreKeybindings).concat(this._extensionKeybindings);

      this._cachedMergedKeybindings.sort(sorter);
    }

    return this._cachedMergedKeybindings.slice(0);
  }

}

exports.KeybindingsRegistry = new KeybindingsRegistryImpl();

function sorter(a, b) {
  if (a.weight1 !== b.weight1) {
    return a.weight1 - b.weight1;
  }

  if (a.command < b.command) {
    return -1;
  }

  if (a.command > b.command) {
    return 1;
  }

  return a.weight2 - b.weight2;
}