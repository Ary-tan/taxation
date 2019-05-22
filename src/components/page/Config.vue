<template>
  <div>
    <div class="handle-box">
      <el-button type="primary" icon="search" @click="dialogForm = true">新增指标</el-button>
      <el-button type="primary" icon="delete" class="handle-del mr10" @click="outputExcel">导出Excel</el-button>
    </div>
    <el-table
      class="btn-table"
      size="mini"
      :data="tableData"
      style="width: 100%">
      <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
      <el-table-column label="方案" align="center" prop="projectName" show-overflow-tooltip width="100"></el-table-column>
      <el-table-column label="筹划前税收（录入指标）" align="center">
        <el-table-column prop="chQtzs" label="土地增值税" show-overflow-tooltip align="center" width="100"></el-table-column>
        <el-table-column prop="chQsds" label="企业所得税" show-overflow-tooltip align="center" width="100"></el-table-column>
        <el-table-column label="合计" show-overflow-tooltip align="center" width="100">
          <template slot-scope="scope">{{Number(scope.row.chQtzs) + Number(scope.row.chQsds)}}</template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="调整方案（录入指标）" align="center">
        <el-table-column label="商业销售比例" show-overflow-tooltip align="center" width="100">
          <template slot-scope="scope">{{scope.row.syRate * 100 + '%'}}</template>
        </el-table-column>
        <el-table-column label="车位销售比例" show-overflow-tooltip align="center" width="100">
          <template slot-scope="scope">{{scope.row.cwRate * 100 + '%'}}</template>
        </el-table-column>
        <el-table-column label="建安成本增加比例" show-overflow-tooltip align="center" width="120">
          <template slot-scope="scope">{{scope.row.cbRate * 100 + '%'}}</template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="筹划成本" align="center">
        <el-table-column prop="chcbje" show-overflow-tooltip label="筹划金额"></el-table-column>
        <el-table-column label="预计筹划成本" align="center">
          <el-table-column prop="chcbzzs" show-overflow-tooltip label="增值税"></el-table-column>
          <el-table-column prop="chcbyhs" show-overflow-tooltip label="印花税"></el-table-column>
          <el-table-column prop="chcbqysds" show-overflow-tooltip label="企业所得税" width="120"></el-table-column>
          <el-table-column prop="chcbhs" show-overflow-tooltip label="含所得税筹划成本" width="120"></el-table-column>
          <el-table-column prop="chcbbhs" show-overflow-tooltip label="不含所得税筹划成本" width="130"></el-table-column>
        </el-table-column>
      </el-table-column>
      <el-table-column label="筹划后税收" align="center">
        <el-table-column prop="chhtzs" show-overflow-tooltip label="土地增值税" width="100"></el-table-column>
        <el-table-column prop="chhqysds" show-overflow-tooltip label="企业所得税" width="100"></el-table-column>
        <el-table-column prop="chhsj" show-overflow-tooltip label="合计"></el-table-column>
      </el-table-column>
      <el-table-column prop="chhsjsscb" show-overflow-tooltip label="筹划后实际税收成本" width="130"></el-table-column>
      <el-table-column prop="sf" show-overflow-tooltip label="税负"></el-table-column>
      <el-table-column prop="ztssjyje" show-overflow-tooltip label="整体税收节约金额 " width="130"></el-table-column>
      <el-table-column prop="dfjacb" show-overflow-tooltip label="单方建安成本" width="120"></el-table-column>
      <el-table-column prop="fdfkfcb" show-overflow-tooltip label="单方开发成本（不含土地款）" width="180"></el-table-column>
      <el-table-column prop="dfkfcb" show-overflow-tooltip label="单方开发成本（含土地款）" width="180"></el-table-column>
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="searchResult(scope.row.chart)">查看报表</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="数据录入" width="500px" :visible.sync="dialogForm">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="160px" class="demo-ruleForm">
        <el-form-item label="土地增值税" prop="chQtzs">
          <el-input v-model="ruleForm.chQtzs" placeholder="请输入数字"></el-input>
        </el-form-item>
        <el-form-item label="企业所得税" prop="chQsds">
          <el-input v-model="ruleForm.chQsds" placeholder="请输入数字"></el-input>
        </el-form-item>
        <el-form-item label="商业销售比例(%)" prop="syRate">
          <el-input v-model="ruleForm.syRate" placeholder="请输入数字"></el-input>
        </el-form-item>
        <el-form-item label="车位销售比例(%)" prop="cwRate">
          <el-input v-model="ruleForm.cwRate" placeholder="请输入数字"></el-input>
        </el-form-item>
        <el-form-item label="建安成本增加比例(%)" prop="cbRate">
          <el-input v-model="ruleForm.cbRate" placeholder="请输入数字"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog('ruleForm')">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import _api from '../common/httpApi';
  import {int, percent} from "../common/regExp";
  import {outputExcel} from "../common/mixins.js";

  export default {
    mixins: [outputExcel],
    data() {
      return {
        dialogForm: false,
        ruleForm: {
          cbRate: '',
          chQsds: '',
          chQtzs: '',
          cwRate: '',
          projectNo: JSON.parse(sessionStorage.getItem('mainItem')) ? JSON.parse(sessionStorage.getItem('mainItem')).cycleNo : '',
          syRate: ''
        },
        rules: {
          chQtzs: [
            {required: true, validator: int, trigger: 'change'}
          ],
          chQsds: [
            {required: true, validator: int, trigger: 'change'}
          ],
          syRate: [
            {required: true, validator: percent, trigger: 'blur'}
          ],
          cwRate: [
            {required: true, validator: percent, trigger: 'blur'}
          ],
          cbRate: [
            {required: true, validator: percent, trigger: 'blur'}
          ]
        },
        tableData: []
      }
    },
    created() {
      let testData = sessionStorage.getItem('testData');
      if (testData) this.tableData = JSON.parse(testData);
    },
    methods: {
      closeDialog(formName) {
        this.$refs[formName].resetFields();
        this.dialogForm = false;
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.ruleForm.syRate /= 100;
            this.ruleForm.cwRate /= 100;
            this.ruleForm.cbRate /= 100;
            _api.listAnalyse(this.ruleForm, (res) => {
              if (res.code === 1000) {
                res.data[1][0].chart = res.data[0];
                let newObj = {...res.data[1][0], ...this.ruleForm};
                this.tableData.push(newObj);
                sessionStorage.setItem('testData', JSON.stringify(this.tableData));
                this.dialogForm = false;
              } else {
                this.$message.error(res.msg);
              }
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      searchResult(item) {
        this.$confirm('数据临时缓存, 如有需要请及时导出Excel?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$router.push('/landTax');
          sessionStorage.setItem('result', JSON.stringify(item));
        }).catch(() => {
        });
      },
      outputExcel() {
        const tableName = ['方案', '土地增值税', '企业所得税', '商业销售比例', '车位销售比例', '建安成本增加比例', '策划金额', '增值税', '印花税', '企业所得税', '含所得税筹划成本', '不含所得税筹划成本', '土地增值税', '企业所得税', '合计', '策划后实际税收成本', '税负', '整体税收节约金额', '单方建安成本', '单方开发成本（不含土地款）', '单方开发成本（含土地款）'];
        const tableKey = ['projectName', 'chQtzs', 'chQsds', 'syRate', 'cwRate', 'cbRate', 'chcbje', 'chcbzzs', 'chcbyhs', 'chcbqysds', 'chcbhs', 'chcbbhs', 'chhtzs', 'chhqysds', 'chhsj', 'chhsjsscb', 'sf', 'ztssjyje', 'dfjacb', 'fdfkfcb', 'dfkfcb'];
        this.excel(this.tableData, tableName, tableKey, "敏感测试");
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
