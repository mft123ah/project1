<template>
    <div>
        <!--        面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入商品名称" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>
            <!--            表格-->
            <el-table :data="goodslist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格" prop="goods_price" width="90px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="140px">
                    <template slot-scope="scope">
                        {{scope.row.add_time|dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                   @click="removeById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                    @size-change="handleSizeChange" background
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[1, 8, 16, 30]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "List",
        data() {
            return {
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 8
                },
                goodslist: [],
                total: 0
            }
        },
        created() {
            this.getGoodsList()
        },
        methods: {
            goAddPage() {
                this.$router.push('/goods/add');
            },
            async delById(id) {
                const {data: res} = await this.$axios.delete(`goods/${id}`);
                if (res.meta.status !== 200) {
                    return this.$message.error('删除失败')
                }
                this.$message.success('删除成功')
                this.getGoodsList()
            },
            removeById(goods_id) {
                this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.delById(goods_id);
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getGoodsList()
            },
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize;
                this.getGoodsList()
            },
            async getGoodsList() {
                const {data: res} = await this.$axios.get(`goods`, {params: this.queryInfo});
                if (res.meta.status !== 200) {
                    return this.$message.error('获取商品列表失败');
                }
                this.goodslist = res.data.goods;
                this.total = res.data.total;
            }
        }
    }
</script>

<style lang="less" scoped>

</style>