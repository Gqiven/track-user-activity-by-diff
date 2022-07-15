import { isObject, isValidRenderNode } from "."

let uid = 0
export const createVNodeElement = (dom, options, reserid) => {
  reserid && (uid = 0)

  const vnode = {}
  
  let { nodeType, childNodes } = dom
  if(nodeType === document.TEXT_NODE) {
    // vnode.id = '' + uid++
    vnode.type = '__text'
    vnode.text = dom.textContent
  }else if(nodeType === document.ELEMENT_NODE) {
    let diffId = dom.getAttribute('diff-id')// 如果存在diff-id则是更新
    if(diffId) {
      vnode.id = diffId
    }else {// 初次解析
      vnode.id = '' + uid++
      dom.setAttribute('diff-id', vnode.id)
    }


    let tagName = dom.tagName.toLowerCase()
    vnode.tag = vnode.type = tagName

    // 记录 class style
    if(dom.hasAttributes()) {
      vnode.props = {}
      for(let { nodeName, nodeValue } of dom.attributes) {
        vnode.props[nodeName] = nodeValue
      }
    }

    if(vnode.type === 'input' && dom.value) {
      if(!vnode.props) {
        vnode.props = {}
      }
      vnode.props.value = dom.value
    }

    // children
    if(childNodes && childNodes.length > 0) {
      vnode.children = [...childNodes].filter(cnode => isValidRenderNode(cnode)).map(cnode => createVNodeElement(cnode, options))
    }
  }
  

  return vnode
}


export function createTextNode(text, rootContainerElement) {
  return document.createTextNode(text)
}


export const createElement = (type) => {
  return document.createElement(type);
};



export function createElementTree(vnode) {
  let { text, type, props, children } = vnode
  let domElement = type === '__text' ? createTextNode(text) : createElement(type)
  // style class
  props && Object.entries(props).forEach(([key, value]) => {
    switch(key) {
      case 'class':
        domElement.className = value
        break;
      default:
        domElement[key] = value
    }
  })
  // children
  if(children && children.length > 0) {
    for(let child of children) {
      domElement.appendChild(createElementTree(child))
    }
  }
  return domElement;
}