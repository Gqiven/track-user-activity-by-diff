import { isObject, joinValidStr, targetHasOwnProperty } from "./utils"

export const diffProps = (
  oldValue = {},
  newValue = {},
  parentPath,
  batchUpdates = []
) => {
  console.log(99, parentPath)
  // 先遍历旧节点的属性，找出新节点对应变动：改动和删除
  Object.keys(oldValue).forEach(key => {
    let path = joinValidStr(parentPath, key)
    if(targetHasOwnProperty(newValue, key)) {
      // 属性值变动
      newValue[key] !== oldValue[key] && batchUpdates.push({
        type: '_props_edit',
        path,
        value: newValue[key]
      })
    }else {// 新值已删除此属性
      batchUpdates.push({
        type: '_props_delete',
        path,
        value: null
      })
    }
  })
  // 再遍历新节点，找出：新增
  Object.keys(newValue).forEach(key => {
    if(!targetHasOwnProperty(oldValue, key)) {// 为新增属性
      let path = joinValidStr(parentPath, key)
      batchUpdates.push({
        type: '_props_add',
        path,
        value: newValue[key]
      })
    }
  })
}

export const diffChildren = (
  oldChildren = [],
  newChildren = [],
  parentPath,
  batchUpdates = []
) => {
  const oldChildrenMap = oldChildren.reduce((map, item) => {
    map[item.id] = item
    return map
  }, {})

  const newChildrenMap = newChildren.reduce((map, item) => {
    map[item.id] = item
    return map
  }, {})
  
  oldChildren.forEach(child => {
    if(!newChildrenMap[child.id]) {// 已删除
      if(child.type === '__text') {
        console.log('__text', child, newChildren)
      }else {
        batchUpdates.push({
          type: '_child_delete',
          path: joinValidStr(parentPath, child.id),
          value: null
        })
      }
      
    }else {// 比较其他变化
      diffDOM(child, newChildrenMap[child.id], joinValidStr(parentPath, child.id), batchUpdates)
    }
  })

  newChildren.forEach(child => {
    if(!oldChildrenMap[child.id]) {
      batchUpdates.push({
        type: '_child_add',
        path: joinValidStr(parentPath, child.id),
        value: child.value
      })
    }
  })
}

export const diffDOM = (
  oldVNode = {},
  newVNode = {},
  parentPath = '',
  batchUpdates = []
) => {
  if(newVNode.id !== oldVNode.id) {
    // 节点不同，直接替换
    batchUpdates.push({
      type: '_dom_replace',
      path: joinValidStr(parentPath, oldVNode.type),
      value: null
    })
  }else {
    // 节点相同 比对 props（style、class、value）和子元素
    diffProps(oldVNode.props, newVNode.props, parentPath || oldVNode.id, batchUpdates)
    diffChildren(oldVNode.children, newVNode.children, parentPath || oldVNode.id, batchUpdates)
  }
  return batchUpdates
}