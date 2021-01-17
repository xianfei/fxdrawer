"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareActions = exports.ActionBar = void 0;

require("../../../../css!./actionbar");

const lifecycle_1 = require("../../../common/lifecycle");

const actions_1 = require("../../../common/actions");

const DOM = require("../../dom");

const types = require("../../../common/types");

const keyboardEvent_1 = require("../../keyboardEvent");

const event_1 = require("../../../common/event");

const actionViewItems_1 = require("./actionViewItems");

class ActionBar extends lifecycle_1.Disposable {
  constructor(container, options = {}) {
    var _a, _b, _c;

    super();
    this._onDidBlur = this._register(new event_1.Emitter());
    this.onDidBlur = this._onDidBlur.event;
    this._onDidCancel = this._register(new event_1.Emitter({
      onFirstListenerAdd: () => this.cancelHasListener = true
    }));
    this.onDidCancel = this._onDidCancel.event;
    this.cancelHasListener = false;
    this._onDidRun = this._register(new event_1.Emitter());
    this.onDidRun = this._onDidRun.event;
    this._onDidBeforeRun = this._register(new event_1.Emitter());
    this.onDidBeforeRun = this._onDidBeforeRun.event;
    this.options = options;
    this._context = (_a = options.context) !== null && _a !== void 0 ? _a : null;
    this._orientation = (_b = this.options.orientation) !== null && _b !== void 0 ? _b : 0
    /* HORIZONTAL */
    ;
    this._triggerKeys = (_c = this.options.triggerKeys) !== null && _c !== void 0 ? _c : {
      keys: [3
      /* Enter */
      , 10
      /* Space */
      ],
      keyDown: false
    };

    if (this.options.actionRunner) {
      this._actionRunner = this.options.actionRunner;
    } else {
      this._actionRunner = new actions_1.ActionRunner();

      this._register(this._actionRunner);
    }

    this._register(this._actionRunner.onDidRun(e => this._onDidRun.fire(e)));

    this._register(this._actionRunner.onDidBeforeRun(e => this._onDidBeforeRun.fire(e)));

    this._actionIds = [];
    this.viewItems = [];
    this.focusedItem = undefined;
    this.domNode = document.createElement('div');
    this.domNode.className = 'monaco-action-bar';

    if (options.animated !== false) {
      this.domNode.classList.add('animated');
    }

    let previousKeys;
    let nextKeys;

    switch (this._orientation) {
      case 0
      /* HORIZONTAL */
      :
        previousKeys = this.options.ignoreOrientationForPreviousAndNextKey ? [15
        /* LeftArrow */
        , 16
        /* UpArrow */
        ] : [15
        /* LeftArrow */
        ];
        nextKeys = this.options.ignoreOrientationForPreviousAndNextKey ? [17
        /* RightArrow */
        , 18
        /* DownArrow */
        ] : [17
        /* RightArrow */
        ];
        break;

      case 1
      /* HORIZONTAL_REVERSE */
      :
        previousKeys = this.options.ignoreOrientationForPreviousAndNextKey ? [17
        /* RightArrow */
        , 18
        /* DownArrow */
        ] : [17
        /* RightArrow */
        ];
        nextKeys = this.options.ignoreOrientationForPreviousAndNextKey ? [15
        /* LeftArrow */
        , 16
        /* UpArrow */
        ] : [15
        /* LeftArrow */
        ];
        this.domNode.className += ' reverse';
        break;

      case 2
      /* VERTICAL */
      :
        previousKeys = this.options.ignoreOrientationForPreviousAndNextKey ? [15
        /* LeftArrow */
        , 16
        /* UpArrow */
        ] : [16
        /* UpArrow */
        ];
        nextKeys = this.options.ignoreOrientationForPreviousAndNextKey ? [17
        /* RightArrow */
        , 18
        /* DownArrow */
        ] : [18
        /* DownArrow */
        ];
        this.domNode.className += ' vertical';
        break;

      case 3
      /* VERTICAL_REVERSE */
      :
        previousKeys = this.options.ignoreOrientationForPreviousAndNextKey ? [17
        /* RightArrow */
        , 18
        /* DownArrow */
        ] : [18
        /* DownArrow */
        ];
        nextKeys = this.options.ignoreOrientationForPreviousAndNextKey ? [15
        /* LeftArrow */
        , 16
        /* UpArrow */
        ] : [16
        /* UpArrow */
        ];
        this.domNode.className += ' vertical reverse';
        break;
    }

    this._register(DOM.addDisposableListener(this.domNode, DOM.EventType.KEY_DOWN, e => {
      const event = new keyboardEvent_1.StandardKeyboardEvent(e);
      let eventHandled = true;

      if (previousKeys && (event.equals(previousKeys[0]) || event.equals(previousKeys[1]))) {
        eventHandled = this.focusPrevious();
      } else if (nextKeys && (event.equals(nextKeys[0]) || event.equals(nextKeys[1]))) {
        eventHandled = this.focusNext();
      } else if (event.equals(9
      /* Escape */
      ) && this.cancelHasListener) {
        this._onDidCancel.fire();
      } else if (this.isTriggerKeyEvent(event)) {
        // Staying out of the else branch even if not triggered
        if (this._triggerKeys.keyDown) {
          this.doTrigger(event);
        }
      } else {
        eventHandled = false;
      }

      if (eventHandled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }));

    this._register(DOM.addDisposableListener(this.domNode, DOM.EventType.KEY_UP, e => {
      const event = new keyboardEvent_1.StandardKeyboardEvent(e); // Run action on Enter/Space

      if (this.isTriggerKeyEvent(event)) {
        if (!this._triggerKeys.keyDown) {
          this.doTrigger(event);
        }

        event.preventDefault();
        event.stopPropagation();
      } // Recompute focused item
      else if (event.equals(2
        /* Tab */
        ) || event.equals(1024
        /* Shift */
        | 2
        /* Tab */
        )) {
          this.updateFocusedItem();
        }
    }));

    this.focusTracker = this._register(DOM.trackFocus(this.domNode));

    this._register(this.focusTracker.onDidBlur(() => {
      if (DOM.getActiveElement() === this.domNode || !DOM.isAncestor(DOM.getActiveElement(), this.domNode)) {
        this._onDidBlur.fire();

        this.focusedItem = undefined;
      }
    }));

    this._register(this.focusTracker.onDidFocus(() => this.updateFocusedItem()));

    this.actionsList = document.createElement('ul');
    this.actionsList.className = 'actions-container';
    this.actionsList.setAttribute('role', 'toolbar');

    if (this.options.ariaLabel) {
      this.actionsList.setAttribute('aria-label', this.options.ariaLabel);
    }

    this.domNode.appendChild(this.actionsList);
    container.appendChild(this.domNode);
  }

  setAriaLabel(label) {
    if (label) {
      this.actionsList.setAttribute('aria-label', label);
    } else {
      this.actionsList.removeAttribute('aria-label');
    }
  }

  isTriggerKeyEvent(event) {
    let ret = false;

    this._triggerKeys.keys.forEach(keyCode => {
      ret = ret || event.equals(keyCode);
    });

    return ret;
  }

  updateFocusedItem() {
    for (let i = 0; i < this.actionsList.children.length; i++) {
      const elem = this.actionsList.children[i];

      if (DOM.isAncestor(DOM.getActiveElement(), elem)) {
        this.focusedItem = i;
        break;
      }
    }
  }

  get context() {
    return this._context;
  }

  set context(context) {
    this._context = context;
    this.viewItems.forEach(i => i.setActionContext(context));
  }

  get actionRunner() {
    return this._actionRunner;
  }

  set actionRunner(actionRunner) {
    if (actionRunner) {
      this._actionRunner = actionRunner;
      this.viewItems.forEach(item => item.actionRunner = actionRunner);
    }
  }

  getContainer() {
    return this.domNode;
  }

  hasAction(action) {
    return this._actionIds.includes(action.id);
  }

  push(arg, options = {}) {
    const actions = Array.isArray(arg) ? arg : [arg];
    let index = types.isNumber(options.index) ? options.index : null;
    actions.forEach(action => {
      const actionViewItemElement = document.createElement('li');
      actionViewItemElement.className = 'action-item';
      actionViewItemElement.setAttribute('role', 'presentation'); // Prevent native context menu on actions

      if (!this.options.allowContextMenu) {
        this._register(DOM.addDisposableListener(actionViewItemElement, DOM.EventType.CONTEXT_MENU, e => {
          DOM.EventHelper.stop(e, true);
        }));
      }

      let item;

      if (this.options.actionViewItemProvider) {
        item = this.options.actionViewItemProvider(action);
      }

      if (!item) {
        item = new actionViewItems_1.ActionViewItem(this.context, action, options);
      }

      item.actionRunner = this._actionRunner;
      item.setActionContext(this.context);
      item.render(actionViewItemElement);

      if (index === null || index < 0 || index >= this.actionsList.children.length) {
        this.actionsList.appendChild(actionViewItemElement);
        this.viewItems.push(item);

        this._actionIds.push(action.id);
      } else {
        this.actionsList.insertBefore(actionViewItemElement, this.actionsList.children[index]);
        this.viewItems.splice(index, 0, item);

        this._actionIds.splice(index, 0, action.id);

        index++;
      }
    });

    if (this.focusedItem) {
      // After a clear actions might be re-added to simply toggle some actions. We should preserve focus #97128
      this.focus(this.focusedItem);
    }
  }

  getWidth(index) {
    if (index >= 0 && index < this.actionsList.children.length) {
      const item = this.actionsList.children.item(index);

      if (item) {
        return item.clientWidth;
      }
    }

    return 0;
  }

  getHeight(index) {
    if (index >= 0 && index < this.actionsList.children.length) {
      const item = this.actionsList.children.item(index);

      if (item) {
        return item.clientHeight;
      }
    }

    return 0;
  }

  pull(index) {
    if (index >= 0 && index < this.viewItems.length) {
      this.actionsList.removeChild(this.actionsList.childNodes[index]);
      lifecycle_1.dispose(this.viewItems.splice(index, 1));

      this._actionIds.splice(index, 1);
    }
  }

  clear() {
    lifecycle_1.dispose(this.viewItems);
    this.viewItems = [];
    this._actionIds = [];
    DOM.clearNode(this.actionsList);
  }

  length() {
    return this.viewItems.length;
  }

  isEmpty() {
    return this.viewItems.length === 0;
  }

  focus(arg) {
    let selectFirst = false;
    let index = undefined;

    if (arg === undefined) {
      selectFirst = true;
    } else if (typeof arg === 'number') {
      index = arg;
    } else if (typeof arg === 'boolean') {
      selectFirst = arg;
    }

    if (selectFirst && typeof this.focusedItem === 'undefined') {
      // Focus the first enabled item
      this.focusedItem = -1;
      this.focusNext();
    } else {
      if (index !== undefined) {
        this.focusedItem = index;
      }

      this.updateFocus();
    }
  }

  focusNext() {
    if (typeof this.focusedItem === 'undefined') {
      this.focusedItem = this.viewItems.length - 1;
    }

    const startIndex = this.focusedItem;
    let item;

    do {
      if (this.options.preventLoopNavigation && this.focusedItem + 1 >= this.viewItems.length) {
        this.focusedItem = startIndex;
        return false;
      }

      this.focusedItem = (this.focusedItem + 1) % this.viewItems.length;
      item = this.viewItems[this.focusedItem];
    } while (this.focusedItem !== startIndex && !item.isEnabled());

    if (this.focusedItem === startIndex && !item.isEnabled()) {
      this.focusedItem = undefined;
    }

    this.updateFocus();
    return true;
  }

  focusPrevious() {
    if (typeof this.focusedItem === 'undefined') {
      this.focusedItem = 0;
    }

    const startIndex = this.focusedItem;
    let item;

    do {
      this.focusedItem = this.focusedItem - 1;

      if (this.focusedItem < 0) {
        if (this.options.preventLoopNavigation) {
          this.focusedItem = startIndex;
          return false;
        }

        this.focusedItem = this.viewItems.length - 1;
      }

      item = this.viewItems[this.focusedItem];
    } while (this.focusedItem !== startIndex && !item.isEnabled());

    if (this.focusedItem === startIndex && !item.isEnabled()) {
      this.focusedItem = undefined;
    }

    this.updateFocus(true);
    return true;
  }

  updateFocus(fromRight, preventScroll) {
    if (typeof this.focusedItem === 'undefined') {
      this.actionsList.focus({
        preventScroll
      });
    }

    for (let i = 0; i < this.viewItems.length; i++) {
      const item = this.viewItems[i];
      const actionViewItem = item;

      if (i === this.focusedItem) {
        if (types.isFunction(actionViewItem.isEnabled)) {
          if (actionViewItem.isEnabled() && types.isFunction(actionViewItem.focus)) {
            actionViewItem.focus(fromRight);
          } else {
            this.actionsList.focus({
              preventScroll
            });
          }
        }
      } else {
        if (types.isFunction(actionViewItem.blur)) {
          actionViewItem.blur();
        }
      }
    }
  }

  doTrigger(event) {
    if (typeof this.focusedItem === 'undefined') {
      return; //nothing to focus
    } // trigger action


    const actionViewItem = this.viewItems[this.focusedItem];

    if (actionViewItem instanceof actionViewItems_1.BaseActionViewItem) {
      const context = actionViewItem._context === null || actionViewItem._context === undefined ? event : actionViewItem._context;
      this.run(actionViewItem._action, context);
    }
  }

  run(action, context) {
    return this._actionRunner.run(action, context);
  }

  dispose() {
    lifecycle_1.dispose(this.viewItems);
    this.viewItems = [];
    this._actionIds = [];
    this.getContainer().remove();
    super.dispose();
  }

}

exports.ActionBar = ActionBar;

function prepareActions(actions) {
  if (!actions.length) {
    return actions;
  } // Clean up leading separators


  let firstIndexOfAction = -1;

  for (let i = 0; i < actions.length; i++) {
    if (actions[i].id === actions_1.Separator.ID) {
      continue;
    }

    firstIndexOfAction = i;
    break;
  }

  if (firstIndexOfAction === -1) {
    return [];
  }

  actions = actions.slice(firstIndexOfAction); // Clean up trailing separators

  for (let h = actions.length - 1; h >= 0; h--) {
    const isSeparator = actions[h].id === actions_1.Separator.ID;

    if (isSeparator) {
      actions.splice(h, 1);
    } else {
      break;
    }
  } // Clean up separator duplicates


  let foundAction = false;

  for (let k = actions.length - 1; k >= 0; k--) {
    const isSeparator = actions[k].id === actions_1.Separator.ID;

    if (isSeparator && !foundAction) {
      actions.splice(k, 1);
    } else if (!isSeparator) {
      foundAction = true;
    } else if (isSeparator) {
      foundAction = false;
    }
  }

  return actions;
}

exports.prepareActions = prepareActions;