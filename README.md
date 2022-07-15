# track-user-activity-by-diff

## 比对绘制逻辑：
  * parse将指定target节点转换为VDOM
    * 根节点
    * 子节点

  * diff 比对两个根节点的区别（class、style；递归比对children）

  * render 渲染前后两步骤的不同之处，每一步的参照都是最初始的

## vscode 使用：
  * 本地启动 npm run serve / yarn serve，热更新js文件变动
  * /public/index.html --> Open with live Server
  * 改动js 就可以实时联调啦（我可太（不）开心了。。。我变了，，，，我竟然说了一些茶言茶语）