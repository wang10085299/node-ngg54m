<template>
  <div class="myFileList">
    <a-upload :fileList="fileList" :openFileDialogOnClick="false" :showUploadList="false" :remove="handleRemove" :beforeUpload="beforeUpload">
      <a-button>
        <a-icon type="upload" />上传附件
      </a-button>
    </a-upload>
  </div>
</template>

<script>
  import { getFileAccessHttpUrl } from '@/api/manage'
  import axios from 'axios'
  export default {
    name: 'FileUpload',
    props: {
      filelength: {
        type: [Number,String],
        default: 0
      },
    },
    data() {
      return {
        removeIds: [],
        URL: process.env.VUE_APP_API_BASE_URL,
        token: this.$store.getters.token,
        fileList: []
      }
    },

    mounted() {},
    methods: {
      getFile(obj) {
        const data={}
        for(let key in obj){
          if(!data.eqs){
            data.eqs=[]
          }
          const eq={}
          eq.key=key
          eq.val=obj[key]
          data.eqs.push(eq)
        }
        let vm = this
        vm.fileList.length=0
       /* attachPage({...data,size:-1}).then(res=>{
          console.log("接口返回的")
          console.log(res)
         /!* res.data.records.map(res => {
            const file = {}
            file.uid = res.id
            file.name = res.oldFileName
            file.url = vm.URL + '/file/attach/download?attachId=' + + res.id
            vm.fileList.push(file)
          })*!/
        })*/
      },
      handleDelete(){
        if(this.removeIds.length>0){
          console.log("启动了删除")
        /*  attachDelete(this.removeIds.join(',')).then(res=>{
            console.log(res)
          })*/
        }
      },
      handleSave(attachType, relationId) {
        let vm = this
        return new Promise((resolve, reject) => {
          const formData = new FormData()
          let index=0
          vm.fileList.forEach(file => {
            if (file.size) {
              formData.append('file', file)
              index++
            }
          })
          formData.append('attachType', attachType || '')
          formData.append('relationId', relationId || '')
          if(formData.get('file')==null){
            if(vm.removeIds.length>0){
              vm.handleDelete()
            }
            return resolve()
          }
          axios({
            method: 'post',
            url: vm.URL + '/file/attach/batchUpload',
            data: formData,
            headers: {
              Authorization: vm.token
            }
          }).then(res => {
            if(res.data.code!==0){
              reject(res.data.msg)
            }else{
              vm.handleDelete()
              resolve(res.data)
            }
          }).catch(err=>{
            reject(err)
          })
        })
      },
      handleRemove(file) {
        if (!file.size) {
          this.removeIds.push(file.uid)
        }
        const index = this.fileList.indexOf(file)
        const newFileList = this.fileList.slice()
        newFileList.splice(index, 1)
        this.fileList = newFileList
      },
      beforeUpload(file) {
        if(this.filelength!=0&&this.filelength==this.fileList.length){
          return  this.$message.warning('最高只能上传'+this.filelength+'个附件');
        }
        this.fileList = [...this.fileList, file]
        console.log(this.fileList)
        return false
      }
    }
  }
</script>

<style lang="less" scoped>
  .myFileList{
    /deep/ .ant-upload-list-item-name{
      display: inline;
    }
  }

</style>