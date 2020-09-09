<template>
    <div>
        <!--        面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--        卡片视图区-->
        <el-card class="box-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!--        用户列表区-->
            <el-table :data="userList" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <!--                        修改按钮-->
                        <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini"
                                       @click="editUser(scope.row.id)"></el-button>
                        </el-tooltip>
                        <!--                        删除-->
                        <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini"
                                       @click="delUser(scope.row.id)"></el-button>
                        </el-tooltip>
                        <!--                        分配角色-->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini"
                                       @click="setRole(scope.row)"
                            ></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!--            分页区-->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[1, 2, 5, 10]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <!--            添加用户对话匡-->
        <el-dialog
                title="添加用户"
                :visible.sync="addDialogVisible"
                width="50%"
                @close="addDialogClose"
        >
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
        </el-dialog>
        <!--修改用户-->
        <el-dialog
                title="修改用户"
                :visible.sync="editDialogVisible"
                width="50%"
                @close="editDialogClose"
        >
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserSubmit">确 定</el-button>
  </span>
        </el-dialog>
        <!--        分配角色-->
        <el-dialog
                title="分配角色"
                :visible.sync="setRoleDialogVisible"
                width="50%"
                @click="setRoleDialogClosed"
        >
            <div>
                <p>当前的用户：{{userInfo.username}}</p>
                <p>当前的角色：{{userInfo.role_name}}</p>
                <p>分配新角色：
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option
                                v-for="item in roleslist"
                                :key="item.id"
                                :label="item.roleName"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Users",
        created: function () {
            this.getUserList();
        },
        methods: {
            async delUserSubmit(id) {
                const {data: res} = await this.$axios.delete('users/' + id);
                if (res.meta.status !== 200) {
                    this.$message.error('删除用户失败');
                }
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
                this.getUserList();
            },
            delUser(id) {
                this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.delUserSubmit(id);
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            editUserSubmit() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) {
                        return;
                    }
                    const {data: res} = await this.$axios.put('users/' + this.editForm.id, {
                        email: this.editForm.email, mobile: this.editForm.mobile
                    })
                    if (res.meta.status !== 200) {
                        this.$message.error('修改用户失败');
                    }
                    this.editDialogVisible = false;
                    this.getUserList();
                    this.$message.success('修改用户成功');
                });
            },
            async editUser(id) {
                const {data: res} = await this.$axios.get('users/' + id);
                if (res.meta.status !== 200) {
                    this.$message.error('查询用户信息失败');
                    return;
                }
                this.editForm = res.data;
                this.editDialogVisible = true;
            },
            addUser() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) {
                        return;
                    }
                    const {data: res} = await this.$axios.post('users', this.addForm)
                    if (res.meta.status !== 201) {
                        this.$message.error('添加用户失败');
                    }
                    this.$message.success('添加用户成功');
                    this.addDialogVisible = false;
                    this.getUserList();
                });
            },
            addDialogClose: function () {
                this.$refs.addFormRef.resetFields();
            },
            editDialogClose() {
                this.$refs.editFormRef.clearValidate();
            },
            getUserList: async function () {
                const {data: res} = await this.$axios.get('/users', {params: this.queryInfo});
                if (res.meta.status !== 200) {
                    return this.$message.error('获取用户列表失败');
                }
                this.userList = res.data.users;
                this.total = res.data.total;
            },
            //监听页面尺寸变化
            handleSizeChange: function (newSize) {
                this.queryInfo.pagesize = newSize;
                this.getUserList();
            },
            //监听页码变化
            handleCurrentChange: function (newPage) {
                this.queryInfo.pagenum = newPage;
                this.getUserList();
            },
            //监听开关状态
            userStateChange: async function (userInfo) {
                const {data: res} = await this.$axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
                if (res.meta.status !== 200) {
                    userInfo.mg_state = !userInfo.mg_state;
                    return this.$message.error('更新用户状态失败');
                }
                this.$message.success('更新状态成功');
            },
            async setRole(userInfo) {
                this.userInfo = userInfo;
                //获取角色列表
                const {data: res} = await this.$axios.get('roles')
                if (res.meta.status !== 200) {
                    return this.$message.error('获取角色列表失败')
                }
                this.roleslist = res.data;
                this.setRoleDialogVisible = true;
            },
            async saveRoleInfo() {
                if (!this.selectedRoleId) {
                    return this.$message.error('请选择角色')
                }
                const {data: res} = await this.$axios.put(`users/${this.userInfo.id}/role`, {
                    rid: this.selectedRoleId
                });
                if (res.meta.status !== 200) {
                    return this.$message.error('分配角色失败')
                }
                this.getUserList();
                this.$message.success('分配角色成功');
                this.setRoleDialogVisible = false;
            },
            setRoleDialogClosed(){
                this.selectedRoleId = '';
                this.userInfo = {};
            }
        },
        data: function () {
            var checkEmail = (rule, value, cb) => {
                const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
                if (regEmail.test(value)) {
                    return cb();
                }
                cb(new Error('请输入合法的邮箱'));
            };
            var checkMobile = (rule, value, cb) => {
                const checkMobile = /^(0|86|17951)?(13[0-9])[0-9]{8}$/
                if (checkMobile.test(value)) {
                    return cb();
                }
                cb(new Error('请输入合法的手机号'));
            };
            return {
                // 获取用户列表的参数对象
                queryInfo: {
                    //查询条件
                    query: '',
                    //当前页码
                    pagenum: 1,
                    //页面尺寸
                    pagesize: 2
                },
                userList: [],
                total: 0,
                addDialogVisible: false,
                editDialogVisible: false,
                addForm: {
                    username: '',
                    password: '',
                    email: '',
                    mobile: ''
                },
                editForm: {},
                addFormRules: {
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'},
                        {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
                    ],
                    email: [
                        {required: true, message: '请输入邮箱', trigger: 'blur'},
                        {validator: checkEmail, trigger: 'blur'}
                    ],
                    mobile: [
                        {required: true, message: '请输入手机', trigger: 'blur'},
                        {validator: checkMobile, trigger: 'blur'}
                    ]
                },
                editFormRules: {
                    email: [
                        {required: true, message: '请输入邮箱', trigger: 'blur'},
                        {validator: checkEmail, trigger: 'blur'}
                    ],
                    mobile: [
                        {required: true, message: '请输入手机', trigger: 'blur'},
                        {validator: checkMobile, trigger: 'blur'}
                    ]
                },
                setRoleDialogVisible: false,
                userInfo: {},
                roleslist: [],
                selectedRoleId: ''
            }

        }
    }
</script>

<style lang="less" scoped>

</style>