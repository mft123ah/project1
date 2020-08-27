<template>
    <el-container class="home-container">
        <!--        头部-->
        <el-header>
            <div>
                <img src="../assets/heima.png">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <!--            侧边栏-->
            <el-aside :width="isCollapsed ? '64px' : '200px'">
                <div @click="toggleCollapse" class="toggle-button">|||</div>
                <el-menu :unique-opened="true"
                        background-color="#333744"
                        text-color="#fff"
                        active-text-color="#409eff"
                        :collapse="isCollapsed" :collapse-transition="false">
                    <!--                    一级菜单-->
                    <el-submenu :key="item.id" :index="item.id+''" v-for="item in menulist">
                        <!--                        一级菜单模板区-->
                        <template slot="title">
                            <!--                            图标-->
                            <i :class="iconobj[item.id]"></i>
                            <!--                            文本-->
                            <span>{{item.authName}}</span>
                        </template>
                        <!--                            二级菜单-->
                        <el-menu-item :key="subItem.id" :index="subItem.id + ''" v-for="subItem in item.children">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!--            主体-->
            <el-main>Main</el-main>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        data: function(){
          return {
              // 左侧菜单
              menulist: [],
              iconobj: {
                  '125': 'iconfont icon-user',
                  '103': 'iconfont icon-tijikongjian',
                  '101': 'iconfont icon-shangpin',
                  '102': 'iconfont icon-danju',
                  '145': 'iconfont icon-baobiao',
              },
              isCollapsed: false,
          }
        },
        name: "Home",
        created: function () {
            this.getMenuList();
        },
        methods: {
            logout: function () {
                window.sessionStorage.clear();
                this.$router.push('/login');
            },
            getMenuList: async function () {
                const {data: res} = await this.$axios.get('/menus');
                if (res.meta.status !== 200) {
                    return this.$message.error(res.meta.msg);
                }else{
                    console.log(res.data);
                    this.menulist = res.data;
                }
            },
            toggleCollapse: function () {
                this.isCollapsed = !this.isCollapsed;
            }
        }
    }
</script>

<style lang="less" scoped>
    .home-container {
        height: 100%;
    }

    .el-header {
        background-color: #373d41;
        display: flex;
        justify-content: space-between;
        padding-left: 0;
        align-items: center;
        color: #ffffff;
        font-size: 20px;

        div {
            display: flex;
            align-items: center;

            span {
                margin-left: 15px;
            }
        }
    }

    .el-aside {
        background-color: #333744;
        .el-menu{
            border-right: none;
        }
    }

    .el-main {
        background-color: #eaedf1;
    }
    .iconfont{
        margin-right: 10px;
    }
    .toggle-button{
        background-color: #4a5064;
        font-size: 10px;
        line-height: 24px;
        color: #fff;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
</style>