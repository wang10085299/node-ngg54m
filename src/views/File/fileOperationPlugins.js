/**
 * 以服务的方式，将对文件的一些操作挂载到 Vue 上
 * 在 *.vue 文件中，使用 this.$addFolder 调用创建文件夹服务
 * 在 *.js 文件中，需要现在文件顶部引入 Vue ，即 import Vue from 'vue' ，然后使用 Vue.property.$addFolder 调用创建文件夹服务
 * @description 各个服务的参数传递查看服务封装对应目录下的 index.js 文件，里面注明了需要船队的参数
 * @author 李雅婷
 */

// 导入操作文件的弹窗类组件

// 导入操作文件的遮罩类组件
import showImgPreviewBox from './box/imgPreview/index.js'

const operateElement = {
	install: (Vue) => {
		// 挂载操作文件的弹窗类组件

		// 挂载操作文件的遮罩类组件
		Vue.prototype.$previewImg = showImgPreviewBox

	}
}
export default operateElement
