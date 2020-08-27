<template>
    <div class="login_container">
        <div class="login_box">
            <!--            头像区域-->
            <div class="avatar_box">
                <img src="../assets/logo.png">
            </div>
            <!--            登陆表单区域-->
            <el-form ref="loginFormRef" label-width="0px" class="login_form" v-bind:model="loginForm" :rules="loginFormRules">
                <!--                用户名-->
                <el-form-item prop="username">
                    <el-input placeholder="admin"
                              prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
                </el-form-item>
                <!--                密码-->
                <el-form-item prop="password">
                    <el-input placeholder="password" type="password" @keyup.enter.native="submitLogin('loginFormRef')"
                              prefix-icon="el-icon-lock" v-model="loginForm.password"></el-input>
                </el-form-item>
                <!--                按钮-->
                <el-form-item class="btns">
                    <el-button type="primary" @click="submitLogin('loginFormRef')">登录</el-button>
                    <el-button type="info" @click="resetLoginForm('loginFormRef')">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Login",
        data: function () {
            return {
                loginForm: {
                    username: '',
                    password: ''
                },
                loginFormRules: {
                    username: [
                        { required: true, message: '请输入登录名称', trigger: 'blur' },
                        { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入登录密码', trigger: 'blur' },
                        { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                    ]
                }
            }
        },
        methods: {
            resetLoginForm: function (loginFormRef) {
                this.$refs[loginFormRef].resetFields();
            },
            submitLogin: function (loginFormRef) {
                this.$refs[loginFormRef].validate( async flag =>{
                    if (flag) {
                        var {data: result} = await this.$axios.post('/login',this.loginForm);
                        if (result.meta.status !== 200) {
                            console.log(result);
                            this.$message.error(result.meta.msg);
                            return ;
                        }else{
                            this.$message.success(result.meta.msg);
                            //保存token用来验证用户是否登陆，未登陆则不能访问除/login的路由
                            window.sessionStorage.setItem('token', result.data.token);
                            this.$router.push('/home');
                        }
                    }else{
                        return;
                    }
                });
            }
        }
    }
</script>

<style lang="less" scoped>
    .login_container {
        background-color: #2b4b6b;
        height: 100%;
    }

    .login_box {
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .avatar_box {
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;

        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }

    .btns {
        display: flex;
        justify-content: flex-end;
    }

    .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
    }
</style>