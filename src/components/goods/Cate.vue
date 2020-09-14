<template>
    <div>
        <!--        面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!--        卡片视图区-->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!--            表格-->
            <zk-table class="zktable" :data="catelist" :expand-type="false" show-index
                      index-text="#" border :columns="columns" :selection-type="false">
                <!--                是否有效-->
                <template slot="isok" slot-scope="scope">
                    <i v-if="scope.row.cat_deleted === false"
                       style="color: lightgreen"
                       class="el-icon-success"></i>
                    <i v-else class="el-icon-error" style="color: lightgreen"></i>
                </template>
                <!--                排序-->
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level === 1" type="success" size="mini">二级</el-tag>
                    <el-tag v-else type="warning" size="mini">三级</el-tag>
                </template>
                <!--                操作-->
                <template slot="opt">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                </template>
            </zk-table>
            <!--            分页-->
        </el-card>
        <!--        添加分类对话框-->
        <el-dialog
                title="添加分类"
                :visible.sync="addCatedialogVisible"
                width="50%"
                @close="addCateDiaClosed">
            <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <el-cascader
                            v-model="selectedKeys"
                            :options="parentCateList"
                            :props="{ expandTrigger: 'hover',
                                       label: 'cat_name',
                                       value: 'cat_id',
                                       children: 'children',
                                       checkStrictly: true
                             }"
                            clearable change-on-select
                            @change="parentCateChange"></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addCatedialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Cate",
        data() {
            return {
                selectedKeys: [],
                parentCateList: [],
                addCateRules: {
                    cat_name: [
                        {required: true, message: '请输入分类名称', trigger: blur}
                    ]
                },
                addCateForm: {
                    cat_name: '',
                    cat_pid: 0,
                    cat_level: 0
                },
                addCatedialogVisible: false,
                // 查询条件
                querInfo: {
                    // 获取123级分类
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                total: 0,
                // 商品分类数据列表，默认空
                catelist: [],
                // 列定义
                columns: [
                    {
                        label: '分类名称',
                        prop: 'cat_name'
                    },
                    {
                        label: '是否有效',
                        // 将当前列定义为模板列
                        type: 'template',
                        // 使用的模板名称,
                        template: 'isok'
                    },
                    {
                        label: '排序',
                        type: 'template',
                        template: 'order'
                    },
                    {
                        label: '操作',
                        type: 'template',
                        template: 'opt'
                    }
                ]
            }
        },
        created() {
            this.getCateList();
        },
        methods: {
            addCateDiaClosed(){
                this.$refs.addCateFormRef.resetFields();
                this.selectedKeys = [];
                this.addCateForm.cat_level = 0;
                this.addCateForm.cat_pid = 0;
            },
            addCate(){
                console.log(this.addCateForm)
                this.$refs.addCateFormRef.validate(async valid => {
                    if (!valid) {
                        return
                    }
                 const {data: res} = await this.$axios.post('categories',this.addCateForm)
                    if (res.meta.status !== 201) {
                        return this.$message.error('添加分类失败')
                    }
                    this.$message.success('添加分类成功')
                    this.getCateList();
                    this.addCatedialogVisible = false;
                });
            },
            parentCateChange(){
                if (this.selectedKeys.length>0) {
                    this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
                    this.addCateForm.cat_level = this.selectedKeys.length;
                    return;
                }else{
                    this.addCateForm.cat_pid = 0
                    this.addCateForm.cat_level = 0
                }
            },
            async getParentCateList() {
                const {data: res} = await this.$axios.get('categories', {
                    params: {
                        type: 2,
                    }
                });
                if (res.meta.status !== 200) {
                    return this.$message.error('获取父级分类数据失败');
                }
                this.parentCateList = res.data;
            },
            showAddCateDialog() {
                this.getParentCateList();
                this.addCatedialogVisible = true;
            },
            async getCateList() {
                const {data: res} = await this.$axios.get('categories', {params: this.queryInfo})
                if (res.meta.status !== 200) {
                    return this.$message.error('获取商品列表失败')
                }
                this.catelist = res.data
                this.total = res.data.length
            }
        }
    }
</script>

<style lang="less" scoped>
    .zktable {
        margin-top: 15px;
    }
    .el-cascader{
        width: 100%;
    }
</style>