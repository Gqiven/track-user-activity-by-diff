import { createVNodeElement } from './utils/nodeOps';

const defaultParseOpts = {
  enableProp: true
}

export const mountVDom = (dom, options = defaultParseOpts) => {
  // 通过实际DOM节点，创建虚拟节点结构
  return createVNodeElement(dom, options, true)
}