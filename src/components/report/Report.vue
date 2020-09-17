<template>
    <div>
        <!--        面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <div id="main" style="width: 600px;height:400px;"></div>
        </el-card>
    </div>
</template>

<script>
    import Echarts from 'echarts'
    import _ from 'lodash'
    export default {
        name: "Report",
        data() {
            return {
                options: {
                    title: {
                        text: '用户来源'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#E9EEF3'
                            }
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            boundaryGap: false
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ]
                }
            }
        },
        created() {

        },
        async mounted() {
            var myChart = Echarts.init(document.getElementById('main'));
            const {data: res} = await this.$axios.get(`reports/type/1`)
            if (res.meta.status !== 200) {
                return this.$message.error('获取拆线图数据失败')
            }
           const result = _.merge(res.data,this.options)
            myChart.setOption(result);
            console.log(res.data)
            console.log(result)
        },
        methods: {}
    }
</script>

<style lang="less" scoped>

</style>