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
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag :key="index" v-for="(item,index) in scope.row.attr_vals" closable @close="handleClosed(index,scope.row)">{{item}}
                                </el-tag>
                                <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                           @click="showEditDialog(scope.row.attr_id)">编辑
                                </el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                           @click="removeParams(scope.row.attr_id)"
                                >删除
                                </el-button>
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
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag :key="index" v-for="(item,index) in scope.row.attr_vals" closable @close="handleClosed(index,scope.row)">{{item}}
                                </el-tag>
                                <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                           @click="showEditDialog(scope.row.attr_id)">编辑
                                </el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                           @click="removeParams(scope.row.attr_id)"
                                >删除
                                </el-button>
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
            handleClosed(index,row){
                row.attr_vals.splice(index, 1);
                this.saveAttrValues(row);
            },
            showInput(row) {
                row.inputVisible = true;
                //当页面上元素被重新渲染后才会执行回调函数中的代码
                this.$nextTick(_ => {
                    console.log(_);
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
           async saveAttrValues(row){
                const {data: res} = await this.$axios.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
                    {
                        attr_name: row.attr_name,
                        attr_sel: row.attr_sel,
                        attr_vals: row.attr_vals.join(' ')
                    })
                if (res.meta.status !== 200) {
                    return this.$message.error('修改参数失败')
                }
                this.$message.success('修改参数成功')
            },
           async handleInputConfirm(row) {
                if (row.inputValue.trim().length === 0) {
                    row.inputValue = ''
                    row.inputVisible = false;
                    return
                }
                //如果输入了内容则要后续处理
                row.attr_vals.push(row.inputValue);
                row.inputValue = '';
                row.inputVisible = false;
               this.saveAttrValues(row);
            },
            async delParams(attr_id) {
                const {data: res} = await this.$axios.delete(`categories/${this.cateId}/attributes/${attr_id}`);
                if (res.meta.status !== 200) {
                    return this.$message.error('删除参数失败')
                }
                this.$message.success('删除参数成功')
                this.getParamsData();
            },
            removeParams(attr_id) {
                this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.delParams(attr_id);
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            async showEditDialog(attr_id) {
                const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes/${attr_id}`, {params: {attr_sel: this.activeName}})
                if (res.meta.status !== 200) {
                    return this.$message.error('获取参数信息失败')
                }
                this.editForm = res.data;
                this.editDialogVisible = true;
            },
            editParams() {
                this.$refs.editFormRef.validate(async valid => {
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
                    this.manyTabData = [];
                    this.onlyTabData = []
                    return;
                }
                // 根据所选分类id,和当前所处的面板，获取对应的参数
                const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})
                if (res.meta.status !== 200) {
                    return this.$message.error('获取参数列表失败')
                }
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
                    item.inputVisible = false;
                    item.inputValue = '';

                })
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

    .el-tag {
        margin: 5px
    }

    .input-new-tag {
        width: 120px;
    }
</style>