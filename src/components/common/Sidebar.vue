<template>
  <div class="sidebar">
    <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse" unique-opened router>
      <template v-for="item in items">
        <template v-if="item.subs">
          <el-submenu :index="item.index" :key="item.index">
            <template slot="title">
              <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
            </template>
            <template v-for="subItem in item.subs">
              <el-submenu v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                <template slot="title">{{ subItem.title }}</template>
                <el-menu-item v-for="(threeItem,i) in subItem.subs" :key="i" :index="threeItem.index">
                  {{ threeItem.title }}
                </el-menu-item>
              </el-submenu>
              <el-menu-item v-else :index="subItem.index" :key="subItem.index">
                {{ subItem.title }}
              </el-menu-item>
            </template>
          </el-submenu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script>
  import bus from "./bus";

  export default {
    data() {
      return {
        collapse: false,
        items: [
          {
            icon: 'el-icon-sold-out',
            index: 'income',
            title: '收入情况'
          },
          {
            icon: 'el-icon-share',
            index: 'costing',
            title: '成本情况'
          },
          {
            icon: 'el-icon-document',
            index: 'config',
            title: '敏感测试'
          },
          {
            icon: 'el-icon-edit-outline',
            index: 'landTax',
            title: '税金结果'
          }
        ]
      }
    },
    computed: {
      onRoutes() {
        return this.$route.path.replace('/', '');
      }
    },
    created() {
      bus.$on('collapse', msg => {
        this.collapse = msg;
      })
    }
  }
</script>

<style scoped>
  .sidebar {
    display: block;
    position: absolute;
    z-index: 110;
    left: 0;
    top: 82px;
    bottom: 0;
    overflow-y: scroll;
  }

  .sidebar::-webkit-scrollbar {
    width: 0;
  }

  .sidebar-el-menu:not(.el-menu--collapse) {
    width: 250px;
  }

  .sidebar > ul {
    height: 100%;
  }
</style>
