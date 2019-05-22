<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <div class="handle-box">
      <el-select @change="versionChange" clearable v-model="versionNum" placeholder="请选择版本" class="select">
        <el-option
          v-for="item in versionData"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button type="primary" icon="delete" :disabled="editBtn" @click="edit = true; saveBtn = false; commitBtn = true">编辑
      </el-button>
      <el-button type="primary" icon="search" :disabled="saveBtn" @click="openFullScreen('form')">保存</el-button>
      <el-button type="primary" icon="search" :disabled="commitBtn" @click="commitCost('form')">提交</el-button>
    </div>
    <div style="width: 500px;margin: 0 auto">
      <el-form class="form-style" size="mini" :rules="model.rules" :show-message="false" :model="model" ref="form">
        <el-table size="small" :data="model.tableData" border>
          <el-table-column prop="itemNum" align="center" label="序号" width="50"></el-table-column>
          <el-table-column prop="itemName" label="项目" width="170"></el-table-column>
          <el-table-column prop="valued" label="录入定量指标" align="right">
            <template slot-scope="scope">
              <el-form-item v-if="edit && scope.row.isShow === 1" :prop="'tableData.' + scope.$index + '.valued'" :rules="scope.row.itemName === '与转让房地产有关的税率' ? rules.percent : rules.valued">
                <el-tooltip v-if="scope.row.itemName === '与转让房地产有关的税率'" content="请输入百分比" placement="top">
                  <el-input v-on:input="inputChange" size="mini" v-model="scope.row.valued" placeholder="请输入指标参数"></el-input>
                </el-tooltip>
                <el-input v-else v-on:input="inputChange" size="mini" v-model="scope.row.valued" placeholder="请输入指标参数"></el-input>
              </el-form-item>
              <span v-else>
                <span v-if="scope.row.itemName === '与转让房地产有关的税率'">{{scope.row.valued ? scope.row.valued + '%' : '--' }}</span>
                <span v-else>{{scope.row.valued ? scope.row.valued : '--' }}</span>
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
    </div>
  </div>
</template>

<script>
  import bus from '../common/bus';
  import _api from '../common/httpApi';
  import {int, percent} from '../common/regExp';

  export default {
    name: 'costing',
    data() {
      return {
        editBtn: false,
        saveBtn: true,
        commitBtn: true,
        fullscreenLoading: false,
        edit: false,
        model: {
          tableData: []
        },
        rules: {
          valued: [
            {required: true, validator: int, trigger: 'change'}
          ],
          percent: [
            {required: true, validator: percent, trigger: 'change'}
          ]
        },
        item: '',
        versionData: [],
        versionNum: '',
        costAry: [],
        deduceAry: []
      }
    },
    created() {
      this.item = JSON.parse(sessionStorage.getItem('mainItem'));
      bus.$on('getTemplate', () => {
        this.item = JSON.parse(sessionStorage.getItem('mainItem'));
        this.costingTemplate();
      });
      this.costingTemplate();
    },
    beforeDestroy() {
      bus.$off('getTemplate');
    },
    methods: {
      filterFn(data, type) {
        return data.filter(item => {
          return item.itemNum === type;
        })[0];
      },
      countAry() {
        this.costAry = [];
        this.deduceAry = [];
        this.model.tableData.forEach(item => {
          let len = item.itemNum.split('.');
          if (len.length === 2 && len[0] === '2') {
            this.costAry.push(item.valued);
          } else if (len.length === 2 && len[0] === '4') {
            this.deduceAry.push(item.valued);
          }
        });
      },
      inputChange() {
        let cost = this.filterFn(this.model.tableData, '2');
        let deduct = this.filterFn(this.model.tableData, '4');
        this.countAry();
        cost.valued = this.costAry.reduce((num, item) => {
          if (item !== null || item !== '') return Number(num) + Number(item);
        });
        deduct.valued = this.deduceAry.reduce((num, item) => {
          if (item !== null || item !== '') return Number(num) + Number(item);
        });
      },
      openFullScreen(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$confirm('确定保存当前数据并新增版本吗？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.fullscreenLoading = true;
              _api.costUpdate(this.model.tableData, (res) => {
                if (res.code === 1000) {
                  this.fullscreenLoading = false;
                  this.edit = false;
                  this.saveBtn = true;
                  this.commitBtn = false;
                  this.$message.success('保存成功');
                } else {
                  this.fullscreenLoading = false;
                  this.$message.error(res.msg);
                }
              });
            }).catch(() => {
              this.edit = false;
              this.costingTemplate();
            });
          } else {
            return false;
          }
        });
      },
      commitCost(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$confirm('确定提交当前版本数据吗？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.fullscreenLoading = true;
              _api.costCommit({costNo: this.model.tableData[0].costNo}, (res) => {
                if (res.code === 1000) {
                  this.fullscreenLoading = false;
                  this.edit = false;
                  this.saveBtn = true;
                  this.commitBtn = true;
                  this.getVersion();
                  this.$message.success('提交成功');
                } else {
                  this.fullscreenLoading = false;
                  this.$message.error(res.msg);
                }
              });
            }).catch(() => {
              this.edit = false;
              this.costingTemplate();
            });
          } else {
            return false;
          }
        });
      },
      costingTemplate(version) {
        _api.getFinaCost({projectNo: this.item ? this.item.cycleNo : '', version: version ? version : ''}, (res) => {
          if (res.code === 1000) {
            this.model.tableData = res.data;
            this.getVersion();
          }
        });
      },
      getVersion() {
        _api.costVersion({costNo: this.model.tableData.length > 0 ? this.model.tableData[0].costNo : ''}, (res) => {
          if (res.code === 1000) {
            this.versionData = [];
            if (res.data.length === 0) return;
            res.data.forEach(item => {
              this.versionData.push({
                value: item.split('V')[1],
                label: item
              });
            });
            this.versionData.unshift({
              value: false,
              label: '可编辑版本'
            });
          }
        });
      },
      versionChange(val) {
        if (val) {
          this.costingTemplate(val);
          this.saveBtn = true;
          this.editBtn = true;
          this.commitBtn = true;
          this.edit = false;
        } else {
          this.edit = false;
          this.costingTemplate();
          this.editBtn = false;
          this.saveBtn = true;
          this.commitBtn = true;
        }
      }
    }
  }

</script>
<style scoped type="text/less" lang="less">
  .handle-box {
    margin-bottom: 25px;
    text-align: right;

    .select {
      margin-right: 10px;
    }
  }

  .form-style {
    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
      margin: 0 !important;
      text-align: right;
    }
  }
</style>
