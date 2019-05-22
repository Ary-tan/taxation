<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <div class="handle-box">
      <el-button type="primary" icon="delete" class="handle-del mr10" @click="outputExcel">导出Excel</el-button>
    </div>
    <el-table size="small" :data="tableData" border>
      <el-table-column show-overflow-tooltip prop="num" label="序号"></el-table-column>
      <el-table-column show-overflow-tooltip prop="projectName" label="项目" width="180"></el-table-column>
      <el-table-column show-overflow-tooltip prop="ptzz" label="普通"></el-table-column>
      <el-table-column show-overflow-tooltip prop="fptzz" label="非普通"></el-table-column>
      <el-table-column show-overflow-tooltip prop="jzsy" label="集中商业"></el-table-column>
      <el-table-column show-overflow-tooltip prop="qtsy" label="其他商业"></el-table-column>
      <el-table-column show-overflow-tooltip prop="kscw" label="可售车位"></el-table-column>
      <el-table-column show-overflow-tooltip prop="fkscw" label="不可售车位"></el-table-column>
      <el-table-column show-overflow-tooltip prop="sycwhj" label="商业车位合计" width="120"></el-table-column>
      <el-table-column show-overflow-tooltip prop="hj" label="合计"></el-table-column>
      <el-table-column show-overflow-tooltip prop="df" label="单方"></el-table-column>
    </el-table>
  </div>
</template>

<script>
  import {outputExcel} from "../common/mixins.js";

  export default {
    name: 'landTax',
    mixins: [outputExcel],
    data() {
      return {
        fullscreenLoading: false,
        tableData: []
      }
    },
    created() {
      let result = sessionStorage.getItem('result');
      if (result) this.tableData = JSON.parse(result);
    },
    methods: {
      outputExcel() {
        const tableName = ['序号', '项目', '普通', '非普通', '集中商业', '其他商业', '可售车位', '不可售车位', '商业车位合计', '合计', '单方'];
        const tableKey = ['num', 'projectName', 'ptzz', 'fptzz', 'jzsy', 'qtsy', 'kscw', 'fkscw', 'sycwhj', 'hj', 'df'];
        this.excel(this.tableData, tableName, tableKey, "税金结果");
      }
    }
  }

</script>
<style scoped type="text/less" lang="less">
  .handle-box {
    margin-bottom: 25px;
    text-align: right;
  }
</style>
