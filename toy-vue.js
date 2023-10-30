export class ToyVue {
  constructor(config) {
    this.template = document.querySelector(config.el);
    this.data = config.data;
    this.traversal(this.template)
  }
  traversal(node) {
    if(node.nodeType === Node.TEXT_NODE) {
      if(node.textContent.trim().match(/^{{([\s\S]+)}}$/)) {
        let name = RegExp.$1.trim();
        console.log(name);
        effect(() => node.textContent = this.data[name]);
      }
    }
    if(node.childNodes && node.childNodes.length) {
      for(let child of node.childNodes) {
        this.traversal(child);
      }
    }
  }
}
let effects = new Map();
let currentEffect = null;
function effect(fn) {
  currentEffect = fn;
  fn();
  currentEffect = null
}
function reactive(object) {
  let observed = new Proxy(object, {
    get(object, property) {
      if(currentEffect) {
        if(!effects.has(object))  {
          effects.set(object, new Map);
        }
        if(!effects.get(object).has(property)) {
          effects.get(object).set(property, new Array);
        }
        effects.get(object).get(property).push(currentEffect);
      }
      return object[property];
    },
    set(object, property, value) {
      object[property] = value;
      if(effects.has(object) && effects.get(object).has(property)) {
        for(let effect of effects.get(object).get(property)) {
          effect();
        }
      }
      return value;
    }
  })
  return observed;
}

// const counter = reactive({num: 0})

// effect(() => (alert(counter.num)));
