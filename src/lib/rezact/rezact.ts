export const createElement = document.createElement.bind(document);
export const createTextNode = document.createTextNode.bind(document);
export const createComment = document.createComment.bind(document);
export const createDocumentFragment =
  document.createDocumentFragment.bind(document);
export const isArray = Array.isArray;

export let createComponent = (tagName, attributes = null) =>
  tagName(attributes);

export const setCreateCompFunc = (func) => (createComponent = func);

export function xCreateElement(tagName, attributes, ...children) {
  if (tagName === xFragment) return children;
  if (typeof tagName === "function") {
    attributes = attributes || {};
    attributes.children = children;
    return createComponent(tagName, attributes);
  }
  const elm = createElement(tagName);
  if (attributes) handleAttributes(elm, attributes);
  const childLen = children.length;
  for (let i = 0; i < childLen; i++) {
    appendChild(elm, children[i]);
  }
  return elm;
}

export let attributeHandlers = [];

export const addAttributeHandler = (item) => attributeHandlers.unshift(item);

const evKeys = { onClick: "click" };
function handleAttributes(elm, attrs) {
  const keys = Object.keys(attrs);
  const keyLen = keys.length;
  outer: for (let i = 0; i < keyLen; i++) {
    const key = keys[i];
    const attrVal = attrs[key];
    if (evKeys[key] && typeof attrs[key] === "function") {
      elm.addEventListener(evKeys[key], attrVal);
      continue;
    }
    if (typeof key === "boolean" && key) {
      elm.setAttribute(key, "");
      continue;
    }
    const attrHandlerLen = attributeHandlers.length;
    for (let x = 0; x < attrHandlerLen; x++) {
      const hook = attributeHandlers[x];
      if ((hook.matches as any)(attrs, key, attrVal)) {
        (hook.handler as any)(elm, key, attrVal, attrs);
        continue outer;
      }
    }

    elm.setAttribute(key, attrVal);
  }
}

export const childArrayHandler: any = {
  matches: (child) => isArray(child),
  handler: (parent, child) => {
    const childLen = child.length;
    for (let i = 0; i < childLen; i++) {
      appendChild(parent, child[i]);
    }
  },
};

export const childNodeHandler: any = {
  matches: (child) => child instanceof Node,
  handler: (parent, child) => parent.appendChild(child),
};

let appendChildHooks: any = [childArrayHandler, childNodeHandler];

export const addAppendChildHook = (item) => appendChildHooks.unshift(item);

export let appendChild = (parent, child, ...args) => {
  const appendChildHookLen = appendChildHooks.length;
  if (
    typeof child === "undefined" ||
    child === null ||
    typeof child === "boolean"
  )
    return;

  for (let i = 0; i < appendChildHookLen; i++) {
    const hook = appendChildHooks[i];
    if ((hook.matches as any)(child))
      return (hook.handler as any)(parent, child, ...args);
  }

  parent.appendChild(createTextNode(String(child)));
};

const afterRenderHooks = [];
export const addAfterRenderHook = (item) => afterRenderHooks.push(item);

export function render(root, tagName, attributes: any = {}) {
  const elm = createComponent(tagName, attributes);
  appendChild(root, elm);
  afterRenderHooks.forEach((func) => func());
}
export const xFragment = [];

let handleInputValue = null;
export function useInputs() {
  if (handleInputValue) return;
  handleInputValue = true;
  function getInputVal(elm: HTMLInputElement) {
    const radioVal = elm.id || elm.value;
    if (elm.type === "radio" && elm.checked) return radioVal;
    if (elm.type === "radio" && !elm.checked) return "";
    if (elm.type === "checkbox") return elm.checked;
    if (elm.type === "number") return +elm.value;
    if (elm.value) return elm.value;
    return "";
  }

  function setInputVal(elm: any, val: any) {
    const radioVal = elm.id || elm.value;
    if (elm.type === "radio" && val === radioVal) return (elm.checked = true);
    if (elm.type === "radio" && val !== radioVal) return (elm.checked = false);
    if (elm.type === "checkbox") return (elm.checked = !!val);
    elm.value = val;
  }

  const handleInputAttr = (element, attributeValue, attributes) => {
    setInputVal(element, attributeValue.value);

    attributeValue.subscribe(
      (newVal: string) => {
        setInputVal(element, newVal);
      },
      { elm: element }
    );

    if (
      !Object.keys(attributes).includes("onChange") &&
      !Object.keys(attributes).includes("onInput")
    ) {
      const evType = element.type === "text" ? "input" : "change";
      element.addEventListener(evType, () => {
        attributeValue.setValue(getInputVal(element));
      });
    }
  };

  const attributeInputValueHandler = {
    matches: (_attrs, key, attrVal) =>
      key === "value" && attrVal.state && handleInputValue,
    handler: (elm, _key, attrVal, attrs) =>
      handleInputAttr(elm, attrVal, attrs),
  };

  addAttributeHandler(attributeInputValueHandler);
}