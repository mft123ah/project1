<template>
    <div>
        <!--        面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>
        <!--        卡片区-->
        <el-card>
            <!--            警告区-->
            <el-alert
                    title="注意：只允许为第三级分类设置相关参数！" show-icon :closable="false"
                    type="warning">
            </el-alert>
            <!--            选择商品区域-->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <el-cascader
                            v-model="selectedKeys"
                            :options="catelist"
                            :props="{ expandTrigger: 'hover',
                                       label: 'cat_name',
                                       value: 'cat_id',
                                       children: 'children',
                                       checkStrictly: true
                             }"
                            clearable @change="handleChange"></el-cascader>
                </el-col>
            </el-row>
            <!--            tab页签-->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">
                        添加参数
                    </el-button>
                    <!--                    动态参数表格-->
                    <el-table :data="manyTabData" border stripe>
                        <el-table-column type="expand"></el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                           @click="showEditDialog(scope.row.attr_id)">编辑
                                </el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">
                        添加属性
                    </el-button>
                    <!-- 静态属性表格-->
                    <el-table :data="onlyTabData" border stripe>
                        <el-table-column type="expand"></el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                           @click="showEditDialog(scope.row.attr_id)">编辑
                                </el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!--        添加参数对话框-->
        <el-dialog
                :title="'添加'+titleText"
                :visible.sync="addDialogVisible"
                width="100%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
        </el-dialog>
        <!--        修改参数对话框-->
        <el-dialog
                :title="'修改'+titleText"
                :visible.sync="editDialogVisible"
                width="100%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Params",
        data() {
            return {
                editFormRules: {
                    attr_name: [
                        {required: true, message: '请输入参数名称', trigger: 'blur'}
                    ]
                },
                editForm: {attr_name: ''},
                editDialogVisible: false,
                addFormRules: {
                    attr_name: [
                        {required: true, message: '请输入参数名称', trigger: 'blur'}
                    ]
                },
                addForm: {attr_name: ''},
                addDialogVisible: false,
                manyTabData: [],
                onlyTabData: [],
                selectedKeys: [],
                catelist: [],
                activeName: 'many'
            }
        },
        created() {
            this.getCateList();
        },
        methods: {
            async showEditDialog(attr_id) {
                const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes/${attr_id}`, {params: {attr_sel: this.activeName}})
                if (res.meta.status !== 200) {
                    return this.$message.error('获取参数信息失败')
                }
                this.editForm = res.data;
                this.editDialogVisible = true;
            },
            editParams() {
                this.$refs.editFormRef.validate(async valid=>{
                    if (!valid) {
                        return
                    }
                    const {data: res} = await this.$axios.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                        attr_name: this.editForm.attr_name,
                        attr_sel: this.activeName
                    });
                    if (res.meta.status !== 200) {
                        return this.$message.error('更新参数失败')
                    }
                    this.$message.success('修改参数成功')
                    this.getParamsData();
                    this.editDialogVisible = false;
                });
            },
            addParams() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) {
                        return
                    }
                    const {data: res} = await this.$axios.post(`categories/${this.cateId}/attributes`, {
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.activeName
                    });
                    if (res.meta.status !== 201) {
                        return this.$message.error('添加参数失败')
                    }
                    this.$message.success('添加参数成功')
                    this.addDialogVisible = false;
                    this.getParamsData();
                });
            },
            addDialogClosed() {
                this.$refs.addFormRef.resetFields();
            },
            editDialogClosed() {
                this.$refs.editFormRef.resetFields();
            },
            async getParamsData() {
                if (this.selectedKeys.length !== 3) {
                    this.selectedKeys = [];
                    return;
                }
                // 根据所选分类id,和当前所处的面板，获取对应的参数
                const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})
                if (res.meta.status !== 200) {
                    return this.$message.error('获取参数列表失败')
                }
                if (this.activeName === 'many') {
                    this.manyTabData = res.data;
                } else {
                    this.onlyTabData = res.data;
                }
            },
            handleTabClick() {
                this.getParamsData();
            },
            handleChange() {
                this.getParamsData();
            },
            async getCateList() {
                const {data: res} = await this.$axios.get('categories')
                if (res.meta.status !== 200) {
                    return this.$message.error('获取商品分类失败！')
                }
                this.catelist = res.data;
            }
        },
        computed: {
            titleText() {
                if (this.activeName === 'many') {
                    return '动态参数'
                }
                return '静态属性'
            },
            isBtnDisabled() {
                if (this.selectedKeys.length !== 3) {
                    return true;
                }
                return false
            },
            cateId() {
                if (this.selectedKeys.length === 3) {
                    return this.selectedKeys[2];
                }
                return null
            }
        }
    }
</script>

<style lang="less" scoped>
    .cat_opt {
        margin: 15px 0;
    }
</style>