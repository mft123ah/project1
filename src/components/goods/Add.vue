<template>
    <div>
        <!--        面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-alert
                    title="添加商品信息"
                    type="info" center :closable="false"
                    show-icon>
            </el-alert>
            <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px"
                     label-position="top"
            >
                <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave"
                         @tab-click="tabClick"
                >
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                    v-model="addForm.goods_cat"
                                    :options="catelist"
                                    :props="{ expandTrigger: 'hover',
                                        label: 'cat_name',
                                        value: 'cat_id',
                                        children: 'children'
                                     }"
                                    @change="handleChange">

                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :key="item.attr_id"
                                      v-for="item in manyTabData"
                                      :label="item.attr_name"
                        >
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox border :key="index" v-for="(cb,index) in item.attr_vals"
                                             :label="cb"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :key="item.attr_id" v-for="item in onlyTabData" :label="item.attr_name">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                                :on-success="handleSuccess"
                                :headers="headerObj"
                                :action="uploadUrl"
                                :on-preview="handlePreview"
                                :on-remove="handleRemove"
                                list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce">
                        </quill-editor>
                        <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <el-dialog
                title="图片预览"
                :visible.sync="previewdialogVisible"
                width="50%">
            <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>

<script>
    import _ from 'lodash'

    export default {
        name: "Add",
        data() {
            return {
                previewdialogVisible: false,
                headerObj: {
                    Authorization: window.sessionStorage.getItem('token')
                },
                uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
                onlyTabData: [],
                manyTabData: [],
                catelist: [],
                activeIndex: '0',
                previewPath: '',
                addForm: {
                    goods_name: '',
                    goods_price: 0,
                    goods_weight: 0,
                    goods_number: 0,
                    goods_cat: [],
                    pics: [],
                    goods_introduce: '',
                    attrs: []
                },
                addFormRules: {
                    goods_name: [
                        {required: true, message: '请输入商品名称', trigger: 'blur'}
                    ],
                    goods_price: [
                        {required: true, message: '请输入商品价格', trigger: 'blur'}
                    ],
                    goods_weight: [
                        {required: true, message: '请输入商品价格', trigger: 'blur'}
                    ],
                    goods_number: [
                        {required: true, message: '请输入商品价格', trigger: 'blur'}
                    ],
                    goods_cat: [
                        {required: true, message: '请选择商品', trigger: 'blur'}
                    ]
                },
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            handleSuccess(response) {
                const picInfo = {pic: response.data.tmp_path}
                this.addForm.pics.push(picInfo)
            },
            handleRemove(file) {
                const filePath = file.response.data.tmp_path
                const index =
                    this.addForm.pics.findIndex(x => {
                        x.pic === filePath
                    })
                this.addForm.pics.splice(index, 1)
            },
            handlePreview(file) {
                this.previewPath = file.response.data.url
                this.previewdialogVisible = true
            },
            async tabClick() {
                if (this.activeIndex === '1') {
                    const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`, {params: {sel: 'many'}})
                    if (res.meta.status !== 200) {
                        return this.$message.error('获取动态参数失败')
                    }
                    res.data.forEach(item => {
                        item.attr_vals =
                            item.attr_vals.length === 0 ? []
                                : item.attr_vals.split(' ')
                    })
                    this.manyTabData = res.data
                } else if (this.activeIndex === '2') {
                    const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`, {params: {sel: 'only'}})
                    if (res.meta.status !== 200) {
                        return this.$message.error('获取动态参数失败')
                    }
                    this.onlyTabData = res.data
                }
            },
            beforeTabLeave(activeName, oldActiveName) {
                if (oldActiveName == 0 && this.addForm.goods_cat.length !== 3) {
                    this.$message.error('请选择商品分类')
                    return false;
                }
            },
            handleChange() {
                if (this.addForm.goods_cat.length !== 3) {
                    this.addForm.goods_cat = []
                }
            },
            async getCateList() {
                const {data: res} = await this.$axios.get(`categories`);
                if (res.meta.status !== 200) {
                    return this.$message.error('获取商品分类失败')
                }
                this.catelist = res.data
            },
            add() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) {
                        return this.$message.error('请输入必填项')
                    }
                    const form = _.cloneDeep(this.addForm)
                    form.goods_cat = form.goods_cat.join(',')
                    this.manyTabData.forEach(item=>{
                        const newInfo = {attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(' ')}
                        this.addForm.attrs.push(newInfo)
                    })
                    this.onlyTabData.forEach(item=>{
                        const newInfo = {attr_id: item.attr_id,
                            attr_value: item.attr_vals}
                        this.addForm.attrs.push(newInfo)
                    })
                    form.attrs = this.addForm.attrs
                  const {data: res} = await this.$axios.post('goods',form)
                    if (res.meta.status !== 201) {
                        return this.$message.error('添加商品失败')
                    }
                    this.$message.success('添加商品成功')
                    this.$router.push('/goods')
                })
            }
        },
        computed: {
            cateId() {
                if (this.addForm.goods_cat.length === 3) {
                    return this.addForm.goods_cat[2];
                } else {
                    return null;
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-checkbox {
        margin: 0 5px 0 0 !important;
    }

    .previewImg {
        width: 100%;
    }

    .btnAdd {
        margin-top: 15px;;
    }
</style>