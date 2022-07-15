let time = 0
let compareRootNode = document.getElementById('app').childNodes[0]
let { mountVDom, diffDOM, transformVNodeToDOM  } = user_track_record
let initVdomData = mountVDom(compareRootNode)

let preParseDOM = initVdomData

const vdomList = []

function recordData() {
  vdomList.push(mountVDom(compareRootNode))
}

function showRecordData() {
  console.log('vdomList', vdomList)
}

function renderDiff(idName) {
  // 将vnode渲染成DOM
  transformVNodeToDOM(preParseDOM, document.getElementById(idName))

  let currentParseDOMData = vdomList.shift()
  if(!currentParseDOMData) return

  console.log('currentParseDOMData', currentParseDOMData)
  const diffData = diffDOM(preParseDOM, currentParseDOMData)
  console.log('diffData', diffData)
  preParseDOM = currentParseDOMData
}