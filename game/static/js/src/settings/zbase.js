class Settings{
    constructor(root){
        this.root = root;
        this.username = "";
        this.photo = "";

        this.$settings = $(`
<div class = "game-settings">
    <div class="login-box">
        <p>Login</p>
        <form>
            <div class="user-box login-username">
                <input required="" name="" type="text">
                <label>Username</label>
            </div>
            <div class="user-box login-password">
                <input required="" name="" type="password">
                <label>Password</label>
            </div>
            
            <a href="#" class = "login-btn">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                Submit
            </a>
            <span class = "error-message"></span>
        </form>
        <p>Don't have an account? <a href="" class="a2">Sign up!</a></p>
    </div>
    <div class="register-box">
        <p>Register</p>
        <form>
            <div class="user-box register-username">
                <input required="" name="" type="text">
                <label>Username</label>
            </div>
            <div class="user-box register-password">
                <input required="" name="" type="password">
                <label>Password</label>
            </div>
            <div class = "user-box register-password-confirm">
                <input type="password" name = "" required>
                <label for="">Password Confirm</label>
            </div>
            <a href="#" class = "register-btn">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                Submit
            </a>
            <span class = "error-message"></span>
        </form>
        <p>Existing account? <a href="" class="a2">login!</a></p>
    </div> 
</div>        
        `);

        this.$login = this.$settings.find(".login-box");
        this.$login_username = this.$login.find(".login-username input");
        this.$login_password = this.$login.find(".login-password input");
        this.$login_submit = this.$login.find(".login-btn");
        this.$login_error_message = this.$login.find(".error-message");
        this.$login_register = this.$login.find(".a2");

        this.$login.hide();

        this.$register = this.$settings.find(".register-box");
        this.$register_username = this.$register.find(".register-username input");
        this.$register_password = this.$register.find(".register-password input");
        this.$register_password_confirm = this.$register.find(".register-password-confirm input");
        this.$register_submit = this.$register.find(".register-btn");
        this.$register_error_message = this.$register.find(".error-message");
        this.$register_login = this.$register.find(".a2");

        this.$register.hide();

        this.root.$game.append(this.$settings);
        this.start();
    }
    start(){
        this.getinfo();
        this.add_listening_events();
    }
    add_listening_events(){
        this.add_listening_events_login();
        this.add_listening_events_register();
    }
    add_listening_events_login(){//在登录框中点击注册
        let outer = this;
        this.$login_register.click(function(evnet){
            event.preventDefault();//阻止<a>标签跳转
            outer.register();
        });
        this.$login_submit.click(function(){
            outer.login_remote();
        });
    }
    add_listening_events_register(){//在注册的框中点击登录
        let outer = this;
        this.$register_login.click(function(event){
            event.preventDefault();
            outer.login();
        });
        this.$register_submit.click(function(){
            outer.register_remote();
        })
    }
    register(){
        this.$login.hide();
        this.$register.show();
    }
    login(){
        this.$register.hide();
        this.$login.show();
    }
    login_remote(){ //服务器端登录
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();
        //console.log(username, password);
        $.ajax({
            url: "http://8.140.22.23:8000/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp){
                //console.log(resp);
                if(resp.result === "success"){
                    location.reload();//刷新页面
                }
                else{
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }
    register_remote(){ //服务器端注册
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "http://8.140.22.23:8000/settings/register/",
            type: "GET",
            data:{
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp){
                if(resp.result === "success"){
                    location.reload();
                }
                else{
                    outer.$register_error_message.html(resp.result);
                }
            }
        })
    }
    logout_remote(){ //服务器端登出
        $.ajax({
            url: "http://8.140.22.23:8000/settings/logout/",
            type: "GET",
            success: function(resp){
                //console.log(resp);
                if(resp.result === "success"){
                    location.reload();//刷新页面
                }
            }
        });
    }
    getinfo(){
        let outer = this;
        $.ajax({
            url: "http://8.140.22.23:8000/settings/getinfo/",
            type: "GET",
            success: function(resp){//请求成功后执行的回调函数
                //console.log(resp);
                if(resp.result === "success"){
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }
                else{
                    outer.login();
                }
            }
        });
    }
    hide(){
        //console.log(this.$settings);
        this.$settings.hide();
    }
    show(){
        this.$settings.show();
    }
}