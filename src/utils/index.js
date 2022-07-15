export const isString = target => typeof target === 'string'
export const isNumber = target => typeof target === 'number'
export const isObject = target => Object.prototype.toString.call(target) === '[object Object]'

export const targetHasOwnProperty = (target, property) => Object.prototype.hasOwnProperty.call(target, property)

export const diffStrOrNum = (
  oldVal,
  newVal,
  path,
  callback
) => {
  let diffData = null
  if(newVal !== oldVal) {
    diffData = {
      path,
      value: newVal
    }
  }
  diffData && callback && callback(diffData)
}


export const joinValidStr = (...args) => args.filter(s => !!s).join('|')

// 有效的渲染节点
export const isValidRenderNode = node => [document.TEXT_NODE, document.ELEMENT_NODE].includes(node.nodeType)