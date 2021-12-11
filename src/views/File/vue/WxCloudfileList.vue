<template>
  <a-card :bordered="false">
    <!-- 左侧文件树 -->
    <a-col :span="3" class="clName">
      <a-tree
        :treeData="treeData"
        :defaultExpandAll="true"
        @select="this.onSelect"
        style="height: 500px;overflow-y: auto;"
      >
      </a-tree>
    </a-col>
    <a-col :span="18">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-dropdown >
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="filecliek"> <file-upload ref="fileList" :filelength="5">
            </file-upload></a-menu-item>
          <a-menu-item key="2" ><a-icon type="upload"/>上传文件夹</a-menu-item>
          <a-menu-item key="3" ><a-icon type="upload"/>拖拽上传</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 上传 <a-icon type="down" /></a-button>
      </a-dropdown>
      <file-upload ref="fileList" :filelength="5">
      </file-upload>
      <!-- 高级查询区域 -->
      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>
    <!-- table区域-begin -->
    <div>
      <a-alert type="info" :showIcon="true" >
        <div slot="message">
          <a-breadcrumb >
            <a >当前位置：</a>
            <a-breadcrumb-item v-for="value in listbread" :key="value" ><a @click="clickbread(value)">{{value}}</a></a-breadcrumb-item>
          </a-breadcrumb>
        </div>
      </a-alert>
      <template>
      <a-table
        ref="table"
        size="middle"
        :scroll="{x:true}"
        rowKey="id"
        :customRow="customClick"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        class="j-table-force-nowrap"
        @change="handleTableChange">
        <template slot="image" slot-scope="text, record">
          <img style="width: 24px;height:24px" :src="gettubiao(record)" @click="clickname(record)	">
        </template>
        <template slot="name" slot-scope="text, record">
          <div
            class="namecolor"
            style="cursor: pointer"
            :title="`${record.filetype==0 ? '' : '点击预览'}`"
            @click="clickname(record)	"
          >
            {{ record.isfolder==1?  record.filename:record.filename+"."+record.extendname }}
          </div>
          <!--<a @click="clickname(record)">{{record.isfolder==1?  record.filename:record.filename+"."+record.extendname}}</a>-->
        </template>
        <!--新增右键点击事件,和增加添加和删除功能-->
      </a-table>
        <a-menu class="tab-menu" :style="menuStyle" v-if="menuVisible">
          <a-menu-item class="tab-menu-item" @click="clicksee" key="0">查看</a-menu-item>
          <a-menu-item class="tab-menu-item" key="1">删除</a-menu-item>
          <a-menu-item class="tab-menu-item" key="2">移动</a-menu-item>
          <a-menu-item class="tab-menu-item" key="3">重命名</a-menu-item>
          <a-menu-item class="tab-menu-item" key="4">分享</a-menu-item>
          <a-menu-item class="tab-menu-item" key="5">下载</a-menu-item>
        </a-menu>
      </template>
    </div>
    </a-col>
    <wx-cloudfile-modal ref="modalForm" @ok="modalFormOk"></wx-cloudfile-modal>
  </a-card>

</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import WxCloudfileModal from './modules/WxCloudfileModal'
  import { getAction,postAction } from '@/api/manage'
  import showImgPreviewBox from '../box/imgPreview/index.js'
  import JUpload from  '@/components/jeecg/JUpload'
  import FileUpload from  '../FileUpload.vue'

  const type=[{"title": "全部文件","key": 0,},{"title": "图片","key": 1,},
    {"title": "文档","key": 2,},{"title": "视频","key": 3,},{"title": "音乐","key": 4,},{"title": "其他","key": 5,}]
  export default {
    name: 'WxCloudfileList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      WxCloudfileModal,
      JUpload,
      FileUpload
    },
    data () {
      return {
        description: '云盘管理页面',
        treeData:[{
          title: '我的文件',
          key: '0-0',
          children: type }],
        // 表头
        columns: [
          {
            title: '',
            dataIndex: '',
            key:'rowIndex',
            width:30,
            align:"right",
            scopedSlots: { customRender: 'image' },//引入的插槽
          },
          {
            title:'文件名称',
            align:"left",
            dataIndex: 'filename',
            scopedSlots: { customRender: 'name' },//引入的插槽
          },
          {
            title:'文件大小',
            align:"center",
            width:60,
            dataIndex: 'filesize'
          },
          {
            title: '修改时间',
            dataIndex: 'updateTime',
            width:60,
            align:"center",
          }
        ],
        url: {
          list: "/wx/wxCloudfile/list",
          delete: "/wx/wxCloudfile/delete",
          deleteBatch: "/wx/wxCloudfile/deleteBatch",
          exportXlsUrl: "/wx/wxCloudfile/exportXls",
          importExcelUrl: "wx/wxCloudfile/importExcel",
          listadd:"/wx/wxCloudfile/listadd"
        },
        menuData: {},//右击的表格数据
        menuVisible: false,
        menuStyle: {
          top: "0",
          left: "0",
        },
        customClick: record => ({
          on: {
            contextmenu: e => {
              e.preventDefault();
              this.menuData = record;
              this.menuVisible = true;
              this.menuStyle.top = e.clientY + "px";
              this.menuStyle.left = e.clientX + "px";
              document.body.addEventListener("click", this.bodyClick);
            }
          }
        }),
        route:'/',
        listbread:['全部文件'],
        rightkey:0,
        fileList:[],
        visible:false,
        Listfileurl: {  },
      }
    },
    created() {
    this.getSuperFieldList();
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      },
    },
    updated(){
      this.datelist=this.dataSource
    },
    methods: {
      filecliek(item){
        if(item.key==1){

        }
      },
      gettubiao(record){
        if(record.filetype==0){
          return require("../../../assets/dir.png")
        }
        const PIC = ['png', 'jpg', 'jpeg', 'gif', 'svg']
        if(PIC.includes(record.extendname)){
          return  window._CONFIG['domianURL']+"/"+record.fileurl
        }
        if(record.extendname=="pdf"){
          return require("../../../assets/pdf4.jpg")
        }

      },
      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'filename',text:'文件名称',dictCode:''})
        fieldList.push({type:'string',value:'extendname',text:'文件后缀',dictCode:''})
        fieldList.push({type:'int',value:'filetype',text:'文件类型',dictCode:''})
        fieldList.push({type:'string',value:'fileurl',text:'文件地址',dictCode:''})
        fieldList.push({type:'int',value:'filesize',text:'文件大小',dictCode:''})
        fieldList.push({type:'int',value:'purpose',text:'用途(1：公司2：部门0：个人)',dictCode:''})
        fieldList.push({type:'double',value:'isfolder',text:'是否是文件夹',dictCode:''})
        fieldList.push({type:'datetime',value:'updateTime',text:'修改时间',dictCode:''})
        this.superFieldList = fieldList
      },
      bodyClick() {
        this.menuVisible = false;
        document.body.removeEventListener("click", this.bodyClick);
      },
      click(){
        console.log(this.menuData)
        this.$message.success(`${this.menuData.THEME} 已点击`);
      },
      // 左侧选择文件类型
      onSelect (selectedKeys, info) {
        this.datelist = [];
        if(selectedKeys[0] === undefined || selectedKeys[0] === '0-0'|| selectedKeys[0] === 0){
          this.rightkey=0;
          this.getdatelist();
        }else{
          this.rightkey=selectedKeys[0];
          this.getdatelist();
        }
      },
      //点击文件名字事件
      clickname(item){
        this.menuData=item
        this.clicksee();
      },
      //根据上方点击获取数据
      clickbread(item){
        if(item =="全部文件"){
          this.route="/"
          this.listbread=["全部文件"]
        }else {
          var arr=[];
          for(var i=0;i<this.listbread.length;i++){
            if(this.listbread[i]==item){
              this.route+=item+"/"
              arr.push(item)
              break;
            }else {
              this.route+=item+"/"
              arr.push(this.listbread[i])
            }
          }
          this.listbread=arr;
        }
        this.getdatelist()
        console.log(this.dataSource)
      },
      //获取数据
      getdatelist(){
        let param = {
          filetype:this.rightkey,
          route:this.route,
        }
        getAction(this.url.list,param).then(res=>{
          if(res.success && res.result){
            this.dataSource = [...res.result.records]
          }
        })
      },
      //打开文件
      clicksee(){
        console.log(this.menuData.id)
        if(this.menuData.isfolder){
          this.route+=this.menuData.filename
          this.listbread.push(this.menuData.filename)
          this.getdatelist()
        }else{
          const PIC = ['png', 'jpg', 'jpeg', 'gif', 'svg']
          if (PIC.includes(this.menuData.extendname)) {
            var fileList=[]
            this.dataSource.forEach(o=>{
              if(o.filetype==1){
                fileList.push(o)
              }
            })
            this.handleImgPreview( this.menuData, fileList)
          }
        }
      },
      handleImgPreview( row,fileList) {
        console.log(fileList)
        var Index=0
        const imgList=[]
        for(var i=0;i<fileList.length;i++){
          if(fileList[i].id==row.id){
            Index=imgList.length;
          }
          console.log(fileList[i])
          imgList.push({
            fileUrl: window._CONFIG['domianURL']+"/"+fileList[i].fileurl,
            downloadLink: window._CONFIG['domianURL']+"/"+fileList[i].fileurl,
            fileName: fileList[i].filename,
            extendName: fileList[i].extendname
          })
        }
        const defaultIndex =Index
        showImgPreviewBox({ imgList, defaultIndex })
      },
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
<style scoped lang="less">
  .namecolor{
    color: #1890FF;
  }
  .tab-menu {
    position: fixed;
    z-index: 1;
    border: 1px solid #eee;
    box-shadow: 0 0 0 1px gainsboro;

    .tab-menu-item {
      background: rgba(0, 0, 0, 0);
    }
    .tab-menu-item:hover{
      color: #070707;
      background: #b6d7ff;
    }
  }
</style>