<template>
  <a-card :bordered="false">
    <!-- 左侧文件树 -->
    <a-col :span="2" class="clName">
      <a-tree
        :treeData="treeData"
        :defaultExpandAll="defaultExpandAll"
        @select="this.onSelect"
        style="height: 500px;overflow-y: auto;"
      >
      </a-tree>
    </a-col>
    <!-- 中间面板 -->
    <a-col :span="2"/>
    <!--右侧缩略图-->
    <a-col :span="18">
      <!-- table区域-begin -->
      <div>
        <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
          <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
          <a style="margin-left: 24px" @click="onClearSelected">清空</a>
        </div>

        <a-table
          ref="table"
          size="middle"
          :scroll="{x:true}"
          bordered
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"
          :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
          class="j-table-force-nowrap"
          @change="handleTableChange">

          <template slot="htmlSlot" slot-scope="text">
            <div v-html="text"></div>
          </template>
          <template slot="imgSlot" slot-scope="text">
            <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
            <img v-else :src="getImgView(text)" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
          </template>
          <template slot="fileSlot" slot-scope="text">
            <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
            <a-button
              v-else
              :ghost="true"
              type="primary"
              icon="download"
              size="small"
              @click="downloadFile(text)">
              下载
            </a-button>
          </template>

          <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

        </a-table>
      </div>
     <!-- <a-spin tip="Loading..." :spinning="spinning">
        <div v-for="(file, key) in dataSource" :key="key">
          <a-row>

            &lt;!&ndash; 预览区域 &ndash;&gt;
            <a-col :span="4">
              <template v-if="file.filePdfPath">
                <div style="float: left;width:104px;height:124px;margin-right: 10px;margin: 0 8px 8px 0;">
                  <div style="width: 100%;height: 100%;position: relative;padding: 8px;" @click="pdfPreview(file.title)">
                    <img style="width: 100%;height:84px" src="~@/assets/pdf4.jpg">
                    <p style="text-align: center"> {{ file.fileName }}</p>
                  </div>
                </div>
              </template>
              <template v-else>
                (暂无材料，点击"选择文件"或"扫描上传"上传文件)
              </template>
            </a-col>
          </a-row>
        </div>
      </a-spin>-->
    </a-col>
    <pdf-preview-modal ref="pdfmodal"></pdf-preview-modal >
  </a-card>
</template>

<script>
  import { getAction } from '@/api/manage'
  import { ACCESS_TOKEN } from "@/store/mutation-types"
  import Vue from 'vue'
  import PdfPreviewModal from '@/views/jeecg/modules/PdfPreviewModal'
  import WxCloudfileModal from './vue/modules/WxCloudfileModal'
  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  const type=[{"title": "全部文件","key": 0,},{"title": "图片","key": 1,},
    {"title": "文档","key": 2,},{"title": "视频","key": 3,},{"title": "音乐","key": 4,},{"title": "其他","key": 5,}]
  const mockdata=[{
    "deleteBatchNum": null,
    "deleteFlag": 0,
    "deleteTime":null ,
    "extendName": null,
    "fileId": null,
    "fileName": "zzz",
    "filePath": "/",
    "fileSize": null,
    "fileUrl": null,
    "identifier": null,
    "isDir": 1,
    "isOSS": null,
    "pointCount": null,
    "storageType": null,
    "timeStampName": null,
    "uploadTime": "2021-11-20 10:53:55",
    "userFileId": 2,
    "userId": 1,
  },{
    "deleteBatchNum": null,
    "deleteFlag": 0,
    "deleteTime":null ,
    "extendName": "jpg",
    "fileId": 1,
    "fileName": "zzz",
    "filePath": "/",
    "fileSize": 331011,
    "fileUrl": "upload/20211120/75215f9759e0729c62e91860668c1240.jpg",
    "identifier": "75215f9759e0729c62e91860668c1240",
    "isDir": 0,
    "isOSS": null,
    "pointCount": 1,
    "storageType": 0,
    "timeStampName": null,
    "uploadTime": "2021-11-20 10:53:55",
    "userFileId": 1,
    "userId": 1,
  }]

  export default {
    name: "File1",
    mixins:[JeecgListMixin, mixinDevice],
    components:{
      PdfPreviewModal,
      WxCloudfileModal
    },
    data () {
      return {
        description: '个人云盘',
        // 文件类型集
        treeData:[{
          title: '我的文件',
          key: '0-0',
          children: type }],
        // 文件数据集
        dataSource: [],
        allData:mockdata,
        // 上传文件集
        defaultExpandAll: true,
        // 加载中
        spinning:false,
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title:'文件名称',
            align:"center",
            dataIndex: 'filename',
            customRender: (text, record) => {
             return text+record.extendname;
            }
          },
          {
            title:'文件大小',
            align:"center",
            dataIndex: 'filesize'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            fixed:"right",
            width:147,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/wx/wxCloudfile/list",
          delete: "/wx/wxCloudfile/delete",
          deleteBatch: "/wx/wxCloudfile/deleteBatch",
          exportXlsUrl: "/wx/wxCloudfile/exportXls",
          importExcelUrl: "wx/wxCloudfile/importExcel",

        },
        //左侧选中类型
        fileType:0,
        superFieldList:[],
      }
    },
    created() {
      this.getSuperFieldList();
    },
    computed: {
       // 当前所在路径
      filePath() {
        return  '/'
      },
    },
    methods: {
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'filename',text:'文件名称',dictCode:''})
        fieldList.push({type:'string',value:'extendname',text:'文件后缀',dictCode:''})
        fieldList.push({type:'int',value:'filetype',text:'文件类型',dictCode:''})
        fieldList.push({type:'string',value:'fileurl',text:'文件地址',dictCode:''})
        fieldList.push({type:'int',value:'filesize',text:'文件大小',dictCode:''})
        fieldList.push({type:'int',value:'purpose',text:'用途(1：公司2：部门0：个人)',dictCode:''})
        fieldList.push({type:'double',value:'isfolder',text:'是否是文件夹',dictCode:''})
        this.superFieldList = fieldList
      },
      getTableDataByType() {},
      loadData (){
        this.spinning = false;
        getAction(this.url.pdfList).then((res)=>{
          if(res.length>0){
            this.allData = res;
            this.dataSource = res;
            this.treeData[0].children = res;
          }
          this.spinning = false;
        })
      },
      pdfPreview:function(title){
        const token = Vue.ls.get(ACCESS_TOKEN);
        this.headers = {"X-Access-Token":token}
        this.$refs.pdfmodal.previewFiles(title,token);
      },
      // 选择文件类型
      onSelect (selectedKeys, info) {
        this.dataSource = [];
        if(selectedKeys[0] === undefined || selectedKeys[0] === '0-0'|| selectedKeys[0] === 0){
          this.dataSource = this.allData;
        }else{
          //this.dataSource.push(info.node._props.dataRef);
          this.allData.forEach(o=> {
          if(o.extendName==selectedKeys[0]){
            this.dataSource.push(o);
          }
          });
        }
        console.log("SELECT-->dataSource",this.dataSource );
      },
      // model回调
      modalFormOk () {
        this.loadData();
      },
    },
  }
</script>

<style scoped>
  .clName .ant-tree li span.ant-tree-switcher, .ant-tree li span.ant-tree-iconEle{width:10px}
</style>