<template>
    <div>
        <!--        面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--        卡片视图-->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <el-table :data="rolelist" border stripe>
                <!--                展开列-->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',i1 === 0?'bdtop':'','vcenter']"
                                v-for="(item1,i1) in scope.row.children"
                                :key="item1.id">
                            <!--                            一级权限-->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!--                            二级和三级权限-->
                            <el-col :span="19">
                                <!--                                二级权限-->
                                <el-row :class="[i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children"
                                        :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag closable @close="removeRightById(scope.row,item2.id)" type="success">
                                            {{item2.authName}}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag closable @close="removeRightById(scope.row,item3.id)" type="warning"
                                                v-for="(item3 ) in item2.children" :key="item3.id">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                                   @click="editUser(scope.row.id,scope.row.roleName,scope.row.roleDesc)">编辑
                        </el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                   @click="delRole(scope.row.id)"
                        >删除
                        </el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini"
                                   @click="showSetRightDialog(scope.row)"
                        >分配权限
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!--        添加角色-->
        <el-dialog
                title="添加角色"
                :visible.sync="addDialogVisible"
                width="50%"
                @close="addDialogClose"
        >
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
        </el-dialog>
        <!--        编辑角色-->
        <el-dialog
                title="编辑角色"
                :visible.sync="editDialogVisible"
                width="50%"
                @close="editDialogClose"
        >
            <el-form :model="tempRole" :rules="editFormRules" ref="editFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="tempRole.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="tempRole.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserSubmit">确 定</el-button>
  </span>
        </el-dialog>
        <!--        分配权限-->
        <el-dialog
                title="分配权限"
                :visible.sync="setRightDialogVisible"
                width="50%"
                @close="setRightDialogClosed"
        >

            <el-tree :data="rightslist" :props="defaultProps"
                     ref="treeRef" :default-checked-keys="defKeys" default-expand-all show-checkbox
                     node-key="id"></el-tree>
            <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Roles",
        data() {
            return {
                roleId: '',
                defKeys: [],
                defaultProps: {
                    children: 'children',
                    label: 'authName'
                },
                rightslist: [],
                setRightDialogVisible: false,
                //编辑用的临时记录
                tempRole: {},
                // 角色列表
                rolelist: [],
                //添加角色
                addForm: {
                    roleName: '',
                    roleDesc: ''
                },
                addDialogVisible: false,
                editDialogVisible: false,
                addFormRules: {
                    roleName: [
                        {required: true, message: '请输入角色名', trigger: 'blur'},
                        {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
                    ],
                    roleDesc: [
                        {required: true, message: '请输入描述', trigger: 'blur'},
                        {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
                    ]
                },
                editFormRules: {
                    roleName: [
                        {required: true, message: '请输入角色名', trigger: 'blur'},
                        {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
                    ],
                    roleDesc: [
                        {required: true, message: '请输入描述', trigger: 'blur'},
                        {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
                    ]
                }
            }
        },
        created() {
            this.getRolesList()
        },
        methods: {
            async allotRights() {
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ];
                const idStr = keys.join(',')
                const {data: res} = await this.$axios.post(`roles/${this.roleId}/rights`, {rids: idStr})
                if (res.meta.status !== 200) {
                    return this.$message.error('分配权限失败')
                }
                this.$message.success('分配权限成功')
                this.getRolesList();
                this.setRightDialogVisible = false;
            },
            // 监听分配权限对话框关闭
            setRightDialogClosed() {
                this.defKeys = []
            },
            // 获取三级权限
            getLeafKeys(node, arr) {
                if (!node.children) {
                    return arr.push(node.id)
                }
                node.children.forEach(item => {
                    this.getLeafKeys(item, arr)
                })
            },
            async showSetRightDialog(role) {
                const {data: res} = await this.$axios.get('rights/tree')
                if (res.meta.status !== 200) {
                    return this.$message.error('获取权限列表失败')
                }
                this.rightslist = res.data;
                this.roleId = role.id;
                this.getLeafKeys(role, this.defKeys);
                this.setRightDialogVisible = true;
            },
            async removeRightSubmit(row, rightid) {
                const {data: res} = await this.$axios.delete(`roles/${row.id}/rights/${rightid}`);
                if (res.meta.status !== 200) {
                    return this.$message.error('删除权限失败')
                }
                this.$message.success('删除权限成功')
                row.children = res.data
            },
            removeRightById(row, rightid) {
                this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.removeRightSubmit(row, rightid);
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            async delRoleSubmit(id) {
                const {data: res} = await this.$axios.delete('roles/' + id);
                if (res.meta.status !== 200) {
                    return this.$message.error('删除失败')
                }
                this.getRolesList();
                this.$message.success('删除成功');
            },
            delRole(id) {
                this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.delRoleSubmit(id);
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
                        return
                    }
                    const {data: res} = await this.$axios.put('roles/' + this.tempRole.id, this.tempRole)
                    if (res.meta.status !== 200) {
                        return this.$message.error('修改角色失败')
                    }
                    this.getRolesList();
                    this.editDialogVisible = false;
                    this.$message.success('修改成功')
                });
            },
            editUser(id, roleName, roleDesc) {
                this.tempRole = {
                    id: id,
                    roleName: roleName,
                    roleDesc: roleDesc
                }
                this.editDialogVisible = true
            },
            addDialogClose() {
                this.$refs.addFormRef.resetFields();
            },
            editDialogClose() {
                this.$refs.editFormRef.resetFields();
            },
            addUser() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) {
                        return;
                    }
                    const {data: res} = await this.$axios.post('roles', this.addForm);
                    if (res.meta.status !== 201) {
                        return this.$message.error('添加角色失败')
                    }
                    this.$message.success('添加角色成功');
                    this.addDialogVisible = false;
                    this.getRolesList();
                });
            },
            async getRolesList() {
                const {data: res} = await this.$axios.get('roles');
                if (res.meta.status !== 200) {
                    return this.$message.error('获取角色列表失败')
                }
                this.rolelist = res.data;
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-tag {
        margin: 7px;
    }

    .bdtop {
        border-top: 1px solid #eeeeee;
    }

    .bdbottom {
        border-bottom: 1px solid #eeeeee;
    }

    .vcenter {
        display: flex;
        align-items: center;
    }
</style>