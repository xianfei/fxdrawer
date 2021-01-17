"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolBar = void 0;

require("../../../../css!./toolbar");

const nls = require("../../../../nls");

const actions_1 = require("../../../common/actions");

const actionbar_1 = require("../actionbar/actionbar");

const lifecycle_1 = require("../../../common/lifecycle");

const types_1 = require("../../../common/types");

const codicons_1 = require("../../../common/codicons");

const event_1 = require("../../../common/event");

const dropdownActionViewItem_1 = require("../dropdown/dropdownActionViewItem");

const toolBarMoreIcon = codicons_1.registerIcon('toolbar-more', codicons_1.Codicon.more);
/**
 * A widget that combines an action bar for primary actions and a dropdown for secondary actions.
 */

class ToolBar extends lifecycle_1.Disposable {
  constructor(container, contextMenuProvider, options = {
    orientation: 0
    /* HORIZONTAL */

  }) {
    super();
    this.submenuActionViewItems = [];
    this.hasSecondaryActions = false;
    this._onDidChangeDropdownVisibility = this._register(new event_1.EventMultiplexer());
    this.onDidChangeDropdownVisibility = this._onDidChangeDropdownVisibility.event;
    this.disposables = new lifecycle_1.DisposableStore();
    this.options = options;
    this.lookupKeybindings = typeof this.options.getKeyBinding === 'function';
    this.toggleMenuAction = this._register(new ToggleMenuAction(() => {
      var _a;

      return (_a = this.toggleMenuActionViewItem) === null || _a === void 0 ? void 0 : _a.show();
    }, options.toggleMenuTitle));
    this.element = document.createElement('div');
    this.element.className = 'monaco-toolbar';
    container.appendChild(this.element);
    this.actionBar = this._register(new actionbar_1.ActionBar(this.element, {
      orientation: options.orientation,
      ariaLabel: options.ariaLabel,
      actionRunner: options.actionRunner,
      actionViewItemProvider: action => {
        if (action.id === ToggleMenuAction.ID) {
          this.toggleMenuActionViewItem = new dropdownActionViewItem_1.DropdownMenuActionViewItem(action, action.menuActions, contextMenuProvider, {
            actionViewItemProvider: this.options.actionViewItemProvider,
            actionRunner: this.actionRunner,
            keybindingProvider: this.options.getKeyBinding,
            classNames: toolBarMoreIcon.classNamesArray,
            anchorAlignmentProvider: this.options.anchorAlignmentProvider,
            menuAsChild: !!this.options.renderDropdownAsChildElement
          });
          this.toggleMenuActionViewItem.setActionContext(this.actionBar.context);
          this.disposables.add(this._onDidChangeDropdownVisibility.add(this.toggleMenuActionViewItem.onDidChangeVisibility));
          return this.toggleMenuActionViewItem;
        }

        if (options.actionViewItemProvider) {
          const result = options.actionViewItemProvider(action);

          if (result) {
            return result;
          }
        }

        if (action instanceof actions_1.SubmenuAction) {
          const result = new dropdownActionViewItem_1.DropdownMenuActionViewItem(action, action.actions, contextMenuProvider, {
            actionViewItemProvider: this.options.actionViewItemProvider,
            actionRunner: this.actionRunner,
            keybindingProvider: this.options.getKeyBinding,
            classNames: action.class,
            anchorAlignmentProvider: this.options.anchorAlignmentProvider,
            menuAsChild: true
          });
          result.setActionContext(this.actionBar.context);
          this.submenuActionViewItems.push(result);
          this.disposables.add(this._onDidChangeDropdownVisibility.add(result.onDidChangeVisibility));
          return result;
        }

        return undefined;
      }
    }));
  }

  set actionRunner(actionRunner) {
    this.actionBar.actionRunner = actionRunner;
  }

  get actionRunner() {
    return this.actionBar.actionRunner;
  }

  set context(context) {
    this.actionBar.context = context;

    if (this.toggleMenuActionViewItem) {
      this.toggleMenuActionViewItem.setActionContext(context);
    }

    for (const actionViewItem of this.submenuActionViewItems) {
      actionViewItem.setActionContext(context);
    }
  }

  getElement() {
    return this.element;
  }

  getItemsWidth() {
    let itemsWidth = 0;

    for (let i = 0; i < this.actionBar.length(); i++) {
      itemsWidth += this.actionBar.getWidth(i);
    }

    return itemsWidth;
  }

  setAriaLabel(label) {
    this.actionBar.setAriaLabel(label);
  }

  setActions(primaryActions, secondaryActions) {
    this.clear();
    let primaryActionsToSet = primaryActions ? primaryActions.slice(0) : []; // Inject additional action to open secondary actions if present

    this.hasSecondaryActions = !!(secondaryActions && secondaryActions.length > 0);

    if (this.hasSecondaryActions && secondaryActions) {
      this.toggleMenuAction.menuActions = secondaryActions.slice(0);
      primaryActionsToSet.push(this.toggleMenuAction);
    }

    primaryActionsToSet.forEach(action => {
      this.actionBar.push(action, {
        icon: true,
        label: false,
        keybinding: this.getKeybindingLabel(action)
      });
    });
  }

  getKeybindingLabel(action) {
    var _a, _b;

    const key = this.lookupKeybindings ? (_b = (_a = this.options).getKeyBinding) === null || _b === void 0 ? void 0 : _b.call(_a, action) : undefined;
    return types_1.withNullAsUndefined(key === null || key === void 0 ? void 0 : key.getLabel());
  }

  clear() {
    this.submenuActionViewItems = [];
    this.disposables.clear();
    this.actionBar.clear();
  }

  dispose() {
    this.clear();
    super.dispose();
  }

}

exports.ToolBar = ToolBar;

class ToggleMenuAction extends actions_1.Action {
  constructor(toggleDropdownMenu, title) {
    title = title || nls.localize('moreActions', "More Actions...");
    super(ToggleMenuAction.ID, title, undefined, true);
    this._menuActions = [];
    this.toggleDropdownMenu = toggleDropdownMenu;
  }

  async run() {
    this.toggleDropdownMenu();
  }

  get menuActions() {
    return this._menuActions;
  }

  set menuActions(actions) {
    this._menuActions = actions;
  }

}

ToggleMenuAction.ID = 'toolbar.toggle.more';