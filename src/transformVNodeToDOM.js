// 将虚拟节点的数据 转化为真实DOM结构

import { createElementTree } from "./utils/nodeOps"

export const transformVNodeToDOM = (vnode, rootContainer) => {
  let domElement = createElementTree(vnode)
  // clean
  rootContainer.innerHTML = ''
  // render
  rootContainer.appendChild(domElement)
}