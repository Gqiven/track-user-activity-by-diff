(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.user_track_record = {}));
})(this, (function (exports) { 'use strict';

  const targetHasOwnProperty = (target, property) => Object.prototype.hasOwnProperty.call(target, property);


  const joinValidStr = (...args) => args.filter(s => !!s).join('|');

  // 有效的渲染节点
  const isValidRenderNode = node => [document.TEXT_NODE, document.ELEMENT_NODE].includes(node.nodeType);

  let uid = 0;
  const createVNodeElement = (dom, options, reserid) => {
    reserid && (uid = 0);

    const vnode = {};
    
    let { nodeType, childNodes } = dom;
    if(nodeType === document.TEXT_NODE) {
      // vnode.id = '' + uid++
      vnode.type = '__text';
      vnode.text = dom.textContent;
    }else if(nodeType === document.ELEMENT_NODE) {
      let diffId = dom.getAttribute('diff-id');// 如果存在diff-id则是更新
      if(diffId) {
        vnode.id = diffId;
      }else {// 初次解析
        vnode.id = '' + uid++;
        dom.setAttribute('diff-id', vnode.id);
      }


      let tagName = dom.tagName.toLowerCase();
      vnode.tag = vnode.type = tagName;

      // 记录 class style
      if(dom.hasAttributes()) {
        vnode.props = {};
        for(let { nodeName, nodeValue } of dom.attributes) {
          vnode.props[nodeName] = nodeValue;
        }
      }

      if(vnode.type === 'input' && dom.value) {
        if(!vnode.props) {
          vnode.props = {};
        }
        vnode.props.value = dom.value;
      }

      // children
      if(childNodes && childNodes.length > 0) {
        vnode.children = [...childNodes].filter(cnode => isValidRenderNode(cnode)).map(cnode => createVNodeElement(cnode));
      }
    }
    

    return vnode
  };


  function createTextNode(text, rootContainerElement) {
    return document.createTextNode(text)
  }


  const createElement = (type) => {
    return document.createElement(type);
  };



  function createElementTree(vnode) {
    let { text, type, props, children } = vnode;
    let domElement = type === '__text' ? createTextNode(text) : createElement(type);
    // style class
    props && Object.entries(props).forEach(([key, value]) => {
      switch(key) {
        case 'class':
          domElement.className = value;
          break;
        default:
          domElement[key] = value;
      }
    });
    // children
    if(children && children.length > 0) {
      for(let child of children) {
        domElement.appendChild(createElementTree(child));
      }
    }
    return domElement;
  }

  const defaultParseOpts = {
    enableProp: true
  };

  const mountVDom = (dom, options = defaultParseOpts) => {
    // 通过实际DOM节点，创建虚拟节点结构
    return createVNodeElement(dom, options, true)
  };

  const diffProps = (
    oldValue = {},
    newValue = {},
    parentPath,
    batchUpdates = [],
    ignoreProps
  ) => {
    const needCheck = key => !ignoreProps || (ignoreProps && !ignoreProps.includes(key));
    // 先遍历旧节点的属性，找出新节点对应变动：改动和删除
    Object.keys(oldValue).forEach(key => {
      if(needCheck(key)) {
        let path = joinValidStr(parentPath, key);
        if(targetHasOwnProperty(newValue, key)) {
          // 属性值变动
          newValue[key] !== oldValue[key] && batchUpdates.push({
            type: '_props_edit',
            path,
            value: newValue[key]
          });
        }else {// 新值已删除此属性
          batchUpdates.push({
            type: '_props_delete',
            path,
            value: null
          });
        }
      }
    });
    // 再遍历新节点，找出：新增
    Object.keys(newValue).forEach(key => {
      if(needCheck(key)) {
        if(!targetHasOwnProperty(oldValue, key)) {// 为新增属性
          let path = joinValidStr(parentPath, key);
          batchUpdates.push({
            type: '_props_add',
            path,
            value: newValue[key]
          });
        }
      }
    });
  };

  const diffChildren = (
    oldChildren = [],
    newChildren = [],
    parentPath,
    batchUpdates = [],
    ignoreProps
  ) => {
    const oldChildrenMap = oldChildren.reduce((map, item) => {
      map[item.id] = item;
      return map
    }, {});

    const newChildrenMap = newChildren.reduce((map, item) => {
      map[item.id] = item;
      return map
    }, {});
    
    oldChildren.forEach(child => {
      if(!newChildrenMap[child.id]) {// 已删除
        if(child.type === '__text') {
          console.log('__text', child, newChildren);
        }else {
          batchUpdates.push({
            type: '_child_delete',
            path: joinValidStr(parentPath, child.id),
            value: null
          });
        }
        
      }else {// 比较其他变化
        diffDOM(child, newChildrenMap[child.id], joinValidStr(parentPath, child.id), batchUpdates);
      }
    });

    newChildren.forEach(child => {
      if(!oldChildrenMap[child.id]) {
        batchUpdates.push({
          type: '_child_add',
          path: joinValidStr(parentPath, child.id),
          value: child.value
        });
      }
    });
  };

  /**
   *
   * @param {*} oldVNode
   * @param {*} newVNode
   * @param {*} parentPath
   * @param {*} batchUpdates
   * @param {*} ignoreProps : array 无需比对的props属性
   * @returns
   */
  const diffDOM = (
    oldVNode = {},
    newVNode = {},
    parentPath = '',
    batchUpdates = [],
    ignoreProps = ['diff-id']
  ) => {
    if(newVNode.id !== oldVNode.id) {
      // 节点不同，直接替换
      batchUpdates.push({
        type: '_dom_replace',
        path: joinValidStr(parentPath, oldVNode.type),
        value: null
      });
    }else {
      // 节点相同 比对 props（style、class、value）和子元素
      diffProps(oldVNode.props, newVNode.props, parentPath || oldVNode.id, batchUpdates, ignoreProps);
      diffChildren(oldVNode.children, newVNode.children, parentPath || oldVNode.id, batchUpdates);
    }
    return batchUpdates
  };

  // 将虚拟节点的数据 转化为真实DOM结构

  const transformVNodeToDOM = (vnode, rootContainer) => {
    let domElement = createElementTree(vnode);
    // clean
    rootContainer.innerHTML = '';
    // render
    rootContainer.appendChild(domElement);
  };

  exports.diffChildren = diffChildren;
  exports.diffDOM = diffDOM;
  exports.diffProps = diffProps;
  exports.mountVDom = mountVDom;
  exports.transformVNodeToDOM = transformVNodeToDOM;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
