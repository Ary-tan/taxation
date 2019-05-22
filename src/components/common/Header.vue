<template>
  <div class="header">
    <div class="header-left">
      <div class="logo">税筹管理系统</div>
    </div>
    <div class="header-right">
      <div class="collapse-btn">
        <span class="circle" @click="collapseChange">
          <i :class="[collapse ? 'el-icon-arrow-right': 'el-icon-arrow-left']"></i>
        </span>
        <span style="font-size: 14px;margin:0 20px 0 25px">{{value ? value : '请选择'}}</span>
        <el-button type="primary" @click.native="dialogSel = true">{{value ? '修改工程期数' : '选择工程期数'}}</el-button>
      </div>
    </div>
    <el-dialog :modal-append-to-body="true" title="选择工程" width="500px" :visible.sync="dialogSel">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="160px" class="demo-ruleForm">
        <el-form-item label="集团公司" prop="company">
          <el-select @change="companyChange" filterable v-model="ruleForm.company" placeholder="请选择公司">
            <el-option
              v-for="item in companyData"
              :key="item.projectSysCode"
              :label="item.projectName"
              :value="item.projectSysCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称" prop="project">
          <el-select @change="projectChange" filterable :disabled="projectName" v-model="ruleForm.project" placeholder="请选择项目">
            <el-option
              v-for="item in projectData"
              :key="item.projectSysCode"
              :label="item.projectName"
              :value="item.projectSysCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目期数" prop="cycle">
          <el-select :disabled="cycle" filterable v-model="ruleForm.cycle" placeholder="请选项目期数">
            <el-option
              v-for="item in cycleData"
              :key="item.projectSysCode"
              :label="item.projectName"
              :value="item.projectSysCode">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="selSubmit('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import bus from './bus';
  import _api from './httpApi';

  export default {
    data() {
      return {
        dialogSel: true,
        collapse: false,
        projectName: true,
        cycle: true,
        ruleForm: {
          company: '',
          project: '',
          cycle: '',
          cycleNo: ''
        },
        rules: {
          company: [{required: true, message: '请选择公司', trigger: 'change'}],
          project: [{required: true, message: '请选择项目', trigger: 'change'}],
          cycle: [{required: true, message: '请选项目期数', trigger: 'change'}]
        },
        companyData: [],
        projectData: [],
        cycleData: [],
        value: ''
      }
    },
    created() {
      this.getCompany();
    },
    methods: {
      collapseChange() {
        this.collapse = !this.collapse;
        bus.$emit('collapse', this.collapse);
      },
      getCompany() {
        _api.listCompany((res) => {
          if (res.code === 1000) {
            this.companyData = res.data;
            let item = sessionStorage.getItem('mainItem');
            if (item) {
              this.ruleForm = JSON.parse(item);
              this.getProject({
                projectSysCode: this.ruleForm.company,
                level: 3
              }, 0, true);
              this.getProject({
                projectSysCode: this.ruleForm.project,
                level: 4
              }, 1, true);
              this.projectName = false;
              this.cycle = false;
            }
          }
        });
      },
      getProject(params, type, status) {
        _api.listProject(params, (res) => {
          if (res.code === 1000) {
            type === 0 ? this.projectData = res.data : this.cycleData = res.data;
            if (status) this.getValue();
          }
        });
      },
      getValue() {
        this.companyData.forEach(item => {
          if (item.projectSysCode === this.ruleForm.company) this.value = item.projectName + ' > ';
        });
        this.projectData.forEach(item => {
          if (item.projectSysCode === this.ruleForm.project) this.value += item.projectName + ' > ';
        });
        this.cycleData.forEach(item => {
          if (item.projectSysCode === this.ruleForm.cycle) this.value += item.projectName;
        });
      },
      cancel() {
        let item = sessionStorage.getItem('mainItem');
        this.dialogSel = false;
        if (item) {
          this.ruleForm = JSON.parse(item);
        }
      },
      selSubmit(formName) {
        let prj = this.cycleData.filter(item => {
          if (item.projectSysCode === this.ruleForm.cycle) return item;
        });
        this.ruleForm.cycleNo = prj[0].projectNo;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.getValue();
            sessionStorage.setItem('mainItem', JSON.stringify(this.ruleForm));
            _api.templateData({porjectNo: this.ruleForm.cycleNo}, (res) => {
              if (res.code === 1000) {
                this.dialogSel = false;
                bus.$emit('getTemplate');
                this.$message.success('模板生成成功');
                this.$router.push('/income');
              } else if (res.code === 999) {
                this.dialogSel = false;
                this.$message.warning(res.msg);
                bus.$emit('getTemplate');
                this.$router.push('/income');
              }
            });
          } else {
            return false;
          }
        });
      },
      companyChange(val) {
        this.ruleForm.project = '';
        if (val) {
          this.projectName = false;
          this.cycle = true;
          this.getProject({
            projectSysCode: val,
            level: 3
          }, 0, false);
        } else {
          this.projectName = true;
          this.cycle = true;
        }
      },
      projectChange(val) {
        this.ruleForm.cycle = '';
        if (val) {
          this.cycle = false;
          this.getProject({
            projectSysCode: val,
            level: 4
          }, 1, false);
        } else {
          this.cycle = true;
        }
      }
    }
  }
</script>
<style lang="less" type="text/less" scoped>
  .header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 82px;
    font-size: 22px;
    color: #fff;
    box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    border-bottom: 1px solid #ebebeb;
  }

  .header .logo {
    float: left;
    text-align: center;
    width: 220px;
    line-height: 82px;
    color: #777;
  }

  .header-right {
    width: 100%;

    .collapse-btn {
      display: block;
      color: #777;
      height: 82px;

      .circle {
        margin: 27.5px 0;
        display: inline-block;
        width: 22px;
        height: 22px;
        line-height: 22px;
        border-radius: 50%;
        font-size: 16px;
        text-align: center;
        border: 1px solid #777;

        &:hover {
          color: #5cb6ff;
          border-color: #5cb6ff;
          transition: all .2s ease-in;
        }
      }
    }
  }
</style>
