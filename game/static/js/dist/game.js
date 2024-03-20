class GameMenu{
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="game-menu">
    <div class="game-menu-field">
        <div class="game-menu-field-item game-menu-field-item-single">
            人机模式
        </div>
        <br>
        <div class="game-menu-field-item game-menu-field-item-multi">
            匹配模式
        </div>
        <br>
        <div class="game-menu-field-item game-menu-field-item-settings">
            退出
        </div>
    </div>
    
</div>            
        `);

        this.$menu.hide();
        this.root.$game.append(this.$menu);
        this.$single = this.$menu.find('.game-menu-field-item-single');
        this.$multi = this.$menu.find('.game-menu-field-item-multi');
        this.$settings = this.$menu.find('.game-menu-field-item-settings');
        //console.log(this.root);

        this.start();
    }
    start() {//游戏创建时自动调用
        this.add_listening_events()
    }
    add_listening_events(){
        let outer = this;
        this.$single.click(function(){
            outer.hide();
            outer.root.playground.show();
            outer.root.playground.resize();
        });
        this.$multi.click(function(){
            console.log("multi");
        });
        this.$settings.click(function(){
            outer.root.settings.logout_remote();
        });
    }

    show(){
        this.$menu.show();
    }
    hide(){
        this.$menu.hide();
    }
}let Game_Objects = [];
class GameObject{
    constructor() {

        Game_Objects.push(this);
        this.has_called_start = false; //是否执行过start()
        this.timedelta = 0; //当前帧距离上一帧的时间间隔  （浏览器之间帧间隔可能不同 速度用时间衡量 /ms
    }
    start(){ //第一帧执行一次

    }
    update(){ //每帧执行一次

    }
    on_destroy() { //删除前执行一次

    }
    destroy(){  //删除object
        this.on_destroy();
        for(let i = 0; i < Game_Objects.length; i ++ ){
            if(Game_Objects[i] === this){
                Game_Objects.splice(i, 1);
                break;
            }
        }
    }
}
let last_timestamp;
let Game_Animation = function (timestamp) {//回调函数 每一帧重绘前都执行一遍
    for(let i = 0; i < Game_Objects.length; i ++ ){
        let obj = Game_Objects[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        }
        else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(Game_Animation);
}
requestAnimationFrame(Game_Animation);//js_api  执行一个动画并在重绘前调用回调函数更新动画
class GameMap extends GameObject{
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas class = "playground-pattern"></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');//jquery对象类似一个数组，第一个索引是html对象

        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }
    start(){

    }
    update(){
        this.render();
    }
    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(255, 255, 255, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    render(){
        //this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); // 清空画布
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}class Particle extends GameObject{
    constructor(playground, x, y, radius, vx, vy, color, speed){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.friction = 0.9;
        this.eps = 0.01;
    }
    start(){

    }
    update(){
        if(this.speed < this.eps){
            this.destroy();
            return false;
        }
        this.x += this.vx * this.speed * this.timedelta / 1000;
        this.y += this.vy * this.speed * this.timedelta / 1000;
        this.speed *= this.friction;
        this.render();

    }
    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class Player extends GameObject{
    constructor(playground, x, y, radius, color, speed, is_me){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_vx = 0;
        this.damage_vy = 0;
        this.damage_speed = 0;
        this.move_length = 0;//剩余移动距离
        this.color = color;
        this.speed = speed;
        this.radius = radius;
        this.is_me = is_me;
        this.eps = 0.01;
        this.friction = 0.9; //摩擦系数
        this.start_attack= 0;// >4才能开始攻击的

        this.img = new Image();
        this.img.src = this.playground.root.settings.photo;
    }
    start(){
        if(this.is_me){
            this.add_listening_events();
        }
        else{
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }
    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });
        const rect = this.ctx.canvas.getBoundingClientRect();
        this.playground.game_map.$canvas.mousedown(function(e){
            
            if(e.which == 3){
                outer.move_to((e.clientX - rect.left)/ outer.playground.scale, (e.clientY - rect.top)/ outer.playground.scale);
            }
        });
        let mouseX = 0, mouseY = 0;
        this.playground.game_map.$canvas.mousemove(function (e){
           outer.mouseX = e.clientX;
           outer.mouseY = e.clientY;
        });
        $(window).keydown(function(e){
            if(e.which == 81){
                //console.log(outer.mouseX, " ", outer.mouseY);
                outer.shoot_fireball((outer.mouseX - rect.left)/ outer.playground.scale, (outer.mouseY - rect.top)/ outer.playground.scale);
                return false;
            }
        })
    }
    get_dist(x1, y1, x2, y2){
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    move_to(tx, ty){
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);//计算移动角度
        //位移1个单位长度
        this.vx = Math.cos(angle);//
        this.vy = Math.sin(angle);
    }
    shoot_fireball(tx, ty){
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed =  0.6;
        let move_length = 1.0;
        let damage =  0.01;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
    }
    is_attacked(angle, damage){//是否被攻击  在fireball -> attack()中被引用
        //粒子效果
        for(let i = 0; i < 10 + Math.random() * 5; i ++ ){
                let x = this.x;
                let y = this.y;
                let radius = this.radius * Math.random() * 0.1;
                let angle = 2 * Math.PI * Math.random();
                let vx = Math.cos(angle), vy = Math.sin(angle);
                let color = this.color;
                let speed = this.speed * 10;
                new Particle(this.playground, x, y, radius, vx, vy, color, speed);
        }

        this.radius -= damage;
        if(this.radius < this.eps){
            this.destroy();
            return false;
        }
        this.damage_vx = Math.cos(angle);
        this.damage_vy = Math.sin(angle);
        this.damage_speed = damage * 100;

        //this.speed *= 0.5;
    }
    update(){
        this.start_attack += this.timedelta / 1000;
        if(!this.is_me && this.start_attack > 4 && Math.random() * 240 < 1){//每秒渲染60帧，每帧1/240的概率攻击
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            this.shoot_fireball(player.x, player.y);
        }
        if(this.damage_speed > this.eps){
            this.vx = this.vy = 0;//受到攻击后不受控制且击退
            this.move_length = 0;
            this.x += this.damage_vx * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_vy * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }
        else{
            if(this.move_length < this.eps){
                this.move_length = 0;
                this.vx = this.vy = 0;
                if(!this.is_me){
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            }
            else{
                //计算单位帧的移动距离
                let dist = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * dist;//计算x轴单位长度
                this.y += this.vy * dist;
                this.move_length -= dist;
            }
        }
        
        this.render();
    }
    render(){
        let scale = this.playground.scale;
        //console.log(this.is_me);
        if(this.is_me){
            console.log(this.img.src);
            this.ctx.save();
            this.ctx.beginPath(); //画圆位置转化为绝对值
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            //this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        }
        else{
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
    on_destroy(){
        for(let i = 0; i < this.playground.players.length; i ++ ){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
            }
        }
    }
}class FireBall extends GameObject{
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.01;

    }
    start(){

    }
    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    is_collision(player){
        let dist = this.get_dist(this.x, this.y, player.x, player.y);
        if(dist < (this.radius + player.radius)) return true;
        return false;
    }
    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
    }
    update(){
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }
        else{
            let dist = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * dist;
            this.y += this.vy * dist;
            this.move_length -= dist;

            //碰撞检测
            for(let i = 0; i < this.playground.players.length; i ++ ){
                let player = this.playground.players[i];
                if(this.player != player && this.is_collision(player)){
                    this.attack(player);
                }
            }
        }
        this.render();
    }
    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class GamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="game-playground"></div>`);

        
        this.hide();
        this.root.$game.append(this.$playground);

        this.start();
    }
    start(){
        let outer = this;
        outer.resize();
        $(window).resize(function(){
            outer.resize();
        });
    }
    resize(){
        //console.log("resize!");
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);//统一长度单位
        this.width = unit * 16;
        this.height = unit * 9;

        this.scale = this.height;
        if(this.game_map) this.game_map.resize();//若地图已创建 resize
    }
    show(){
        this.$playground.show();
        this.resize();
        //生成游戏界面

        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.game_map = new GameMap(this);

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "black", 0.3, true));

        //人机
        for(let i = 0; i < 5; i ++ ){
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.3, false));
        }
    }
    hide(){
        this.$playground.hide();
    }
    get_random_color(){
        let colors = ["blue", "green", "pink", "grey", "red"];
        return colors[Math.floor(Math.random() * 5)];
    }
}class Settings{
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
}export class Game {
    constructor(id) {

        this.id = id;
        this.$game = $('#' + id);
        this.settings = new Settings(this);
        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);

        this.start();
    }
    start(){

    }
}