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
      <el-button type="primary" icon="search" :disabled="saveBtn" @click="saveIncome('form')">保存</el-button>
      <el-button type="primary" icon="search" :disabled="commitBtn" @click="commitIncome('form')">提交</el-button>
    </div>
    <el-form class="form-style" size="mini" :show-message="false" ref="form">
      <el-table size="small" :data="model.tableData" border>
        <template v-for="(col, index) in cols">
          <el-table-column width="150" :key="index" :prop="col.prop" v-if="col.prop==='itemName'" :label="col.label"></el-table-column>
          <el-table-column v-else :label="col.label" :key="index">
            <template slot-scope="scope">
              <el-form-item v-if="edit" :rules='rules.valued'>
                <span v-if="allData[col.label][scope.$index].itemCode === '05' || allData[col.label][scope.$index].itemCode === '04' || allData[col.label][scope.$index].itemCode === '03'">
                  <span v-if="allData[col.label][scope.$index].itemCode === '04' || allData[col.label][scope.$index].itemCode === '03'">{{allData[col.label][scope.$index].valued ? ((allData[col.label][scope.$index].valued) * 100).toFixed(2) + '%' : '--'}}</span>
                  <span v-else>{{allData[col.label][scope.$index].valued ? fmoney(allData[col.label][scope.$index].valued) : '--'}}</span>
                </span>
                <el-input
                  v-else
                  @focus="subItem = JSON.parse(JSON.stringify(allData[col.label][scope.$index])); colData = allData[col.label]; rowData = allData[col.label][scope.$index]"
                  @blur="valueChange($event, allData[col.label][scope.$index])"
                  size="mini"
                  v-on:input="inputChange"
                  v-model="allData[col.label][scope.$index].valued"
                  placeholder="请输入参数">
                </el-input>
              </el-form-item>
              <span v-else>
                <span v-if="allData[col.label][scope.$index].itemCode === '04' || allData[col.label][scope.$index].itemCode === '03'">{{allData[col.label][scope.$index].valued > 0 ? ((allData[col.label][scope.$index].valued) * 100).toFixed(2) + '%' : '--'}}</span>
                <span v-else>{{allData[col.label][scope.$index].valued ? fmoney(allData[col.label][scope.$index].valued) : '--'}}</span>
              </span>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </el-form>
  </div>
</template>

<script>
  import bus from '../common/bus';
  import _api from '../common/httpApi';
  import {int} from '../common/regExp';

  export default {
    name: 'income',
    data() {
      return {
        versionNum: '',
        editBtn: false,
        saveBtn: true,
        commitBtn: true,
        cols: [],
        item: '',
        edit: false,
        fullscreenLoading: false,
        model: {
          tableData: []
        },
        allItemData: [],
        allData: [],
        versionData: [],
        rules: {
          valued: [
            {required: true, validator: int, trigger: 'change'}
          ]
        },
        val: '',
        subItem: {},
        subAry: [],
        colData: [],
        rowData: []
      }
    },
    created() {
      this.item = JSON.parse(sessionStorage.getItem('mainItem'));
      bus.$on('getTemplate', () => {
        this.item = JSON.parse(sessionStorage.getItem('mainItem'));
        this.incomeTemplate();
      });
      this.incomeTemplate();
    },
    beforeDestroy() {
      bus.$off('getTemplate');
    },
    methods: {
      incomeTemplate(version) {
        _api.getIncome({projectNo: this.item ? this.item.cycleNo : '', version: version ? version : ''}, (res) => {
          if (res.code === 1000) {
            if (JSON.stringify(res.data) !== "{}") {
              this.cols = [];
              this.model.tableData = [];
              this.allData = res.data;
              this.model.tableData = res.data['非普通住宅'];
              for (let i in res.data) {
                this.cols.push({label: i});
              }
              if (this.cols.length > 0) this.cols.unshift({label: '项目', prop: 'itemName'});
              this.getVersion();
            }
          }
        });
      },
      saveIncome(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.allItemData = [];
            for (let i in this.allData) {
              this.allData[i].forEach(item => {
                this.allItemData.push(item);
              });
            }
            this.$confirm('确定保存当前数据并新增版本吗？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.fullscreenLoading = true;
              _api.incomeUpdate(this.allItemData, (res) => {
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
              this.saveBtn = true;
              this.edit = false;
              this.incomeTemplate();
            });
          } else {
            return false;
          }
        });
      },
      commitIncome() {
        this.$confirm('确定提交当前版本数据吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.fullscreenLoading = true;
          _api.incomeCommit({incomeNo: this.allItemData[0].incomeNo}, (res) => {
            if (res.code === 1000) {
              this.fullscreenLoading = false;
              this.edit = false;
              this.getVersion();
              this.saveBtn = true;
              this.commitBtn = true;
              this.subAry = [];
              this.$message.success('提交成功');
            } else {
              this.fullscreenLoading = false;
              this.$message.error(res.msg);
            }
          });
        }).catch(() => {
          this.edit = false;
          this.incomeTemplate();
        });
      },
      getVersion() {
        _api.incomeVersion({incomeNo: this.model.tableData.length > 0 ? this.model.tableData[0].incomeNo : ''}, (res) => {
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
          this.incomeTemplate(val);
          this.saveBtn = true;
          this.editBtn = true;
          this.commitBtn = true;
          this.edit = false;
        } else {
          this.saveBtn = true;
          this.edit = false;
          this.incomeTemplate();
          this.editBtn = false;
          this.commitBtn = true;
        }
      },
      valueChange(event, item) {
        let reg = /^(\d|[1-9]\d+)(\.\d+)?$/;
        let val = event.target.value;
        if (Number(item.valued) !== this.subItem.valued) {
          this.subAry.forEach((list, index) => {
            if (list.incomeDetailNo === item.incomeDetailNo && list.incomeNo === item.incomeNo) {
              this.subAry.splice(index, 1);
            }
          });
          this.subAry.push(item);
        }
        if (!reg.test(val)) item.valued = '';
      },
      filterFn(data, type) {
        return data.filter(item => {
          return item.itemCode === type;
        })[0];
      },
      numAdd() {
        let list6 = [];
        let sumAry = [];
        let newAry = this.cols.filter(item => {
          return item.label !== '项目'
        });
        newAry.forEach(item => {
          list6.push(this.allData[item.label][0])
        });
        list6.forEach(item => {
          sumAry.push(item.valued)
        });
        return sumAry.reduce((num, item) => {
          if (item !== null || item !== '') return Number(num) + Number(item);
        });
      },
      fmoney(s) {
        return (s + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
      },
      inputChange() {
        if (this.colData.length === 0) return;
        let list1 = this.filterFn(this.colData, '01');
        let list2 = this.filterFn(this.colData, '02');
        let list3 = this.filterFn(this.colData, '03');
        let list4 = this.filterFn(this.colData, '05001');
        let list5 = this.filterFn(this.colData, '05');
        let list7 = this.filterFn(this.colData, '04');
        if (this.subItem.itemCode !== '05001') {
          list5.valued = list4.valued;
          list3.valued = isFinite(list2.valued / list1.valued) ? (list2.valued / list1.valued).toFixed(4) : 0;
          list7.valued = (list2.valued / list1.valued).toFixed(4);

          let percent = this.allData['普通住宅'].filter(item => {
            return item.itemCode === '04'
          })[0];
          let child = this.allData['普通住宅'].filter(item => {
            return item.itemCode === '02'
          })[0];
          percent.valued = isFinite(child.valued / this.numAdd()) ? (child.valued / this.numAdd()).toFixed(4) : 0;

          let percent1 = this.allData['集中商业'].filter(item => {
            return item.itemCode === '04'
          })[0];
          let child1 = this.allData['集中商业'].filter(item => {
            return item.itemCode === '02'
          })[0];
          percent1.valued = isFinite(child1.valued / this.numAdd()) ? (child1.valued / this.numAdd()).toFixed(4) : 0;

          let percent2 = this.allData['其他商业'].filter(item => {
            return item.itemCode === '04'
          })[0];
          let child2 = this.allData['其他商业'].filter(item => {
            return item.itemCode === '02'
          })[0];
          percent2.valued = isFinite(child2.valued / this.numAdd()) ? (child2.valued / this.numAdd()).toFixed(4) : 0;

          let percent3 = this.allData['可售车位'].filter(item => {
            return item.itemCode === '04'
          })[0];
          let child3 = this.allData['可售车位'].filter(item => {
            return item.itemCode === '02'
          })[0];
          percent3.valued = isFinite(child3.valued / this.numAdd()) ? (child3.valued / this.numAdd()).toFixed(4) : 0;

          let percent4 = this.allData['不可售车位'].filter(item => {
            return item.itemCode === '04'
          })[0];
          let child4 = this.allData['不可售车位'].filter(item => {
            return item.itemCode === '02'
          })[0];
          percent4.valued = isFinite(child4.valued / this.numAdd()) ? (child4.valued / this.numAdd()).toFixed(4) : 0;

          let percent5 = this.allData['非普通住宅'].filter(item => {
            return item.itemCode === '04'
          })[0];
          let child5 = this.allData['非普通住宅'].filter(item => {
            return item.itemCode === '02'
          })[0];
          percent5.valued = isFinite(child5.valued / this.numAdd()) ? (child5.valued / this.numAdd()).toFixed(4) : 0;
          // if (this.colData[0].itemOv === '1') {
          //   list7.valued = isFinite(list2.valued / this.numAdd()) ? (list2.valued / this.numAdd()).toFixed(4) : 0;
          //
          //   let percent1 = this.allData['集中商业'].filter(item => {
          //     return item.itemCode === '04'
          //   })[0];
          //   let child1 = this.allData['集中商业'].filter(item => {
          //     return item.itemCode === '02'
          //   })[0];
          //   percent1.valued = isFinite(child1.valued / this.numAdd()) ? (child1.valued / this.numAdd()).toFixed(4) : 0;
          //
          //   let percent2 = this.allData['其他商业'].filter(item => {
          //     return item.itemCode === '04'
          //   })[0];
          //   let child2 = this.allData['其他商业'].filter(item => {
          //     return item.itemCode === '02'
          //   })[0];
          //   percent2.valued = isFinite(child2.valued / this.numAdd()) ? (child2.valued / this.numAdd()).toFixed(4) : 0;
          //
          //   let percent3 = this.allData['可售车位'].filter(item => {
          //     return item.itemCode === '04'
          //   })[0];
          //   let child3 = this.allData['可售车位'].filter(item => {
          //     return item.itemCode === '02'
          //   })[0];
          //   percent3.valued = isFinite(child3.valued / this.numAdd()) ? (child3.valued / this.numAdd()).toFixed(4) : 0;
          //
          //   let percent4 = this.allData['不可售车位'].filter(item => {
          //     return item.itemCode === '04'
          //   })[0];
          //   let child4 = this.allData['不可售车位'].filter(item => {
          //     return item.itemCode === '02'
          //   })[0];
          //   percent4.valued = isFinite(child4.valued / this.numAdd()) ? (child4.valued / this.numAdd()).toFixed(4) : 0;
          // } else if (this.colData[0].itemOv === '2') {
          //   list7.valued = isFinite(list2.valued / list1.valued) ? (list2.valued / list1.valued).toFixed(4) : 0;
          //
          //   // let percent = this.allData['普通住宅'].filter(item => {return item.itemCode === '04'})[0];
          //   // let child = this.allData['普通住宅'].filter(item => {return item.itemCode === '02'})[0];
          //   // percent.valued = (child.valued / this.numAdd()).toFixed(2);
          // } else {
          //   list7.valued = (list2.valued / list1.valued).toFixed(4);
          //
          //   let percent = this.allData['普通住宅'].filter(item => {
          //     return item.itemCode === '04'
          //   })[0];
          //   let child = this.allData['普通住宅'].filter(item => {
          //     return item.itemCode === '02'
          //   })[0];
          //   percent.valued = isFinite(child.valued / this.numAdd()) ? (child.valued / this.numAdd()).toFixed(4) : 0;
          //
          //   let percent1 = this.allData['集中商业'].filter(item => {
          //     return item.itemCode === '04'
          //   })[0];
          //   let child1 = this.allData['集中商业'].filter(item => {
          //     return item.itemCode === '02'
          //   })[0];
          //   percent1.valued = isFinite(child1.valued / this.numAdd()) ? (child1.valued / this.numAdd()).toFixed(4) : 0;
          //
          //   let percent2 = this.allData['其他商业'].filter(item => {
          //     return item.itemCode === '04'
          //   })[0];
          //   let child2 = this.allData['其他商业'].filter(item => {
          //     return item.itemCode === '02'
          //   })[0];
          //   percent2.valued = isFinite(child2.valued / this.numAdd()) ? (child2.valued / this.numAdd()).toFixed(4) : 0;
          //
          //   let percent3 = this.allData['可售车位'].filter(item => {
          //     return item.itemCode === '04'
          //   })[0];
          //   let child3 = this.allData['可售车位'].filter(item => {
          //     return item.itemCode === '02'
          //   })[0];
          //   percent3.valued = isFinite(child3.valued / this.numAdd()) ? (child3.valued / this.numAdd()).toFixed(4) : 0;
          //
          //   let percent4 = this.allData['不可售车位'].filter(item => {
          //     return item.itemCode === '04'
          //   })[0];
          //   let child4 = this.allData['不可售车位'].filter(item => {
          //     return item.itemCode === '02'
          //   })[0];
          //   percent4.valued = isFinite(child4.valued / this.numAdd()) ? (child4.valued / this.numAdd()).toFixed(4) : 0;
          // }
        } else {
          list5.valued = list4.valued;
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
    }
  }
</style>
