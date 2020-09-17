<template>
    <div>
        <!--        面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <el-table :data="orderlist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="order_pay">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.order_pay === '1'" type="success">己付款</el-tag>
                        <el-tag v-else type="warning">未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="">
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                                   @click="openOrderDialog"
                        ></el-button>
                        <el-button @click="showProgressBox" type="success" icon="el-icon-location"
                                   size="mini"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[5, 10, 15, 20]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <el-dialog
                title="修改地址"
                :visible.sync="orderDialogVisible"
                width="50%" @close="addrDialogClosed">
            <el-form :model="addrForm" :rules="addrFormRules" ref="addrFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader
                            v-model="addrForm.address1"
                            :options="citydata"
                            :props="{ expandTrigger: 'hover' }"
                    >
                    </el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addrForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="orderDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="orderDialogVisible = false">确 定</el-button>
  </span>
        </el-dialog>
        <el-dialog
                title="物流进度"
                :visible.sync="progressDialogVisible"
                width="50%">
            <el-timeline>
                <el-timeline-item
                        v-for="(activity, index) in progressData"
                        :key="index"
                        :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
    import citydata from './citydata.js'

    export default {
        name: "Order",
        data() {
            return {
                progressDialogVisible: false,
                citydata: citydata,
                addrForm: {
                    address1: [],
                    address2: ''
                },
                addrFormRules: {
                    address1: [
                        {required: true, message: '请选择省市区县', trigger: 'blur'}

                    ],
                    address2: [
                        {required: true, message: '请填写详细地址', trigger: 'blur'}
                    ],
                },
                orderDialogVisible: false,
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                orderlist: [],
                total: 0,
                progressData: []
            }
        },
        created() {
            this.getOrderList()
        },
        methods: {
            async showProgressBox() {
                const {data: res} = await this.$axios.get(`/kuaidi/1106975712662`)
                if (res.meta.status !== 200) {
                    return this.$message.error('获取物流信息失败')
                }
                this.progressData = res.data
                this.progressDialogVisible = true;
                console.log(res.data)
            },
            addrDialogClosed() {
                this.$refs.addrFormRef.resetFields()
            },
            openOrderDialog() {
                this.orderDialogVisible = true
            },
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getOrderList()
            },
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getOrderList()
            },
            async getOrderList() {
                const {data: res} = await this.$axios.get(`orders`, {params: this.queryInfo})
                if (res.meta.status !== 200) {
                    return this.$message.error('获取订单列表失败')
                }
                this.orderlist = res.data.goods
                this.total = res.data.total
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-cascader {
        width: 100%;
    }
</style>