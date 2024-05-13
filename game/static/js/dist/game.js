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
        <div class = "game-menu-field-item game-menu-field-item-rank">
            排行榜
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
        this.$rank = this.$menu.find('.game-menu-field-item-rank');
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
            outer.root.playground.show("single mode");
            outer.root.playground.resize();
        });
        this.$multi.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
            outer.root.playground.resize();
        });
        this.$settings.click(function(){
            outer.root.settings.logout_remote();
        });
        this.$rank.click(function(){
            //outer.hide();
            outer.root.rank.show();
        })
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
        this.uid = this.create_uid();

    }
    start(){ //第一帧执行一次

    }
    create_uid(){
        let res = "";
        for(let i = 0; i < 8; i ++ ){
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }
    late_update(){//每帧执行一次 且在update后执行

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
    for(let i = 0; i < Game_Objects.length; i ++ ){
        let obj = Game_Objects[i];
        obj.late_update();
    }
    last_timestamp = timestamp;
    requestAnimationFrame(Game_Animation);
}
requestAnimationFrame(Game_Animation);//js_api  执行一个动画并在重绘前调用回调函数更新动画
class Chat{
    constructor(playground) {
        this.playground = playground;

        this.$history = $(`<div class = "game-chat-history"></div>`);
        this.$input = $(`<input type = "text" class = "game-chat-input">`);

        this.$history.hide();
        this.$input.hide();

        this.func_id = null;//记录监听事件id

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }
    start(){
        this.add_listening_events();
    }
    add_listening_events(){
        let outer = this;
        this.$input.keydown(function(e){
            if(e.which === 27){
                outer.hide_input();
                return false;
            }
            else if(e.which === 13){
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if(text){
                    outer.$input.val("");
                    outer.add_message(username, text);
                    outer.playground.mps.send_message(text);
                }
                outer.hide_input();
                return false;
            }
        })
    }
    show_history(){
        let outer = this;
        this.$history.fadeIn();
        if(this.func_id) clearTimeout(this.func_id);//清除上一次计时器
        this.func_id = setTimeout(function(){
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 5000);
    }
    render_message(message){
        return $(`<div>${message}</div>`);
    }
    add_message(username, text){
        this.show_history();
        let message = `[${username}] ${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }
    show_input(){
        this.show_history();
        this.$input.show();
        this.$input.focus(); //输入时，聚焦于输入框
    }
    hide_input(){
        this.$input.hide();
        this.playground.game_map.$canvas.focus();//退出时 聚焦于游戏界面
    }

}class endingInterface extends GameObject{
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;

        this.state = null;//win / lose
        this.win_img = new Image();
        this.win_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png";

        this.lose_img = new Image();
        this.lose_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png";
    }
    start(){

    }
    add_listening_events(){
        let outer = this;
        let $canvas = this.playground.game_map.$canvas;
        $canvas.on('click', function(){
           outer.playground.hide();
           outer.playground.root.menu.show();
        });
    }
    win(){
        this.state = "win";
        let outer = this;
        setTimeout(function(){
            outer.add_listening_events();
        }, 500);
    }
    lose(){
        this.state = "lose";
        console.log("lose");
        let outer = this;
        setTimeout(function(){
            outer.add_listening_events();
        }, 500);
    }
    late_update(){
        this.render();//渲染在图层最上方
    }
    render(){
        let len = this.playground.height / 2;
        if(this.state === "win"){
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
        else if(this.state === "lose"){
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }
}class Poison extends GameObject {
    constructor(playground, grid) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.grid = grid;

        this.i = grid.i;
        this.j = grid.j;
        this.l = grid.l;
        this.x = this.i * this.l;
        this.y = this.j * this.l;
        this.poison_max_radius = [];
        this.poison_x_offset = [];
        this.poison_y_offset = [];
        this.poison_radius = [];
        this.poison_sleep_time = [];
        this.cnt = 3; // 渲染毒云数量


        this.color1 = "rgba(154, 22, 165, 0.5)";
        this.color2 = "rgba(215, 30, 230, 0.5)"; // 紫色
    }

    start() {
        // 渐变相关
        this.offset_x = 0;
        this.offset_y = 0;
        this.r1 = 0;
        this.r2 = this.l * 10;

        for (let i = 0; i < this.cnt; i ++ ) {
            this.poison_max_radius.push(0.02 + Math.random() * 0.02);
        }
        for (let i = 0; i < this.cnt; i ++ ) {
            this.poison_x_offset.push((Math.random() - 0.5) * this.l);
            this.poison_y_offset.push((Math.random() - 0.5) * this.l);
        }
        for (let i = 0; i < this.cnt; i ++ ) {
            this.poison_radius.push(0);
        }

        for (let i = 0; i < this.cnt; i ++ ) {
            this.poison_sleep_time.push(Math.random() * 2);
        }
    }

    update() {
        this.update_gradient();
        this.update_radius();
        this.render();
    }

    update_gradient() {
        this.offset_x += this.timedelta / 2000 * this.l;
        this.offset_y += this.timedelta / 2000 * this.l;
        if (this.offset_x > this.l) this.offset_x = 0;
        if (this.offset_y > this.l) this.offset_y = 0;
    }

    update_radius() {
        for (let i = 0; i < this.cnt; i ++ ) {
            if (this.poison_sleep_time[i] === 0) {
                this.poison_radius[i] += this.timedelta / 1000 * 0.01; // 控制毒云半径变化速度
            } else {
                this.poison_sleep_time[i] -= this.timedelta / 1000;
                this.poison_sleep_time[i] = Math.max(0, this.poison_sleep_time[i]);
            }
            if (this.poison_radius[i] >= this.poison_max_radius[i]) {
                this.poison_radius[i] = 0;
                this.poison_sleep_time[i] = 2;
                this.poison_x_offset[i] = (Math.random() - 0.5) * this.l;
                this.poison_y_offset[i] = (Math.random() - 0.5) * this.l;
            }
        }
    }

    render() {
        let scale = this.playground.scale;
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy;
        let cx = ctx_x + this.l * 0.5, cy = ctx_y + this.l * 0.5; // grid的中心坐标
        // 处于屏幕范围外，则不渲染
        if (cx * scale < -0.2 * this.playground.width ||
            cx * scale > 1.2 * this.playground.width ||
            cy * scale < -0.2 * this.playground.height ||
            cy * scale > 1.2 * this.playground.height) {
            return;
        }

        this.ctx.save();
        let grd = this.ctx.createRadialGradient((ctx_x + this.offset_x) * scale, (ctx_y + this.offset_y) * scale, 0,
            (ctx_x + this.offset_x) * scale, (ctx_y + this.offset_y) * scale, this.l * 2 * scale);
        grd.addColorStop(0, this.color1);
        grd.addColorStop(0.5, this.color2);
        grd.addColorStop(1, this.color1);

        this.ctx.fillStyle = grd;
        // this.ctx.fillRect(ctx_x * scale, ctx_y * scale, this.l * scale, this.l * scale);

        this.ctx.beginPath();
        for (let i = 0; i < this.cnt; i ++ ) {
            let r = this.poison_radius[i];
            let x = this.poison_x_offset[i];
            let y = this.poison_y_offset[i];
            this.ctx.moveTo((cx + x) * scale, (cy + y) * scale);
            this.ctx.save();
            this.ctx.arc((cx + x) * scale, (cy + y) * scale, r * scale, 0, Math.PI * 2, false);
            this.ctx.restore();
        }
        this.ctx.fill();

        this.ctx.restore();
    }
}
class Grid extends GameObject {
    constructor(playground, ctx, i, j, l, stroke_color) {
        super();
        this.playground = playground;
        this.ctx = ctx;
        this.i = i;
        this.j = j;
        this.l = l;
        this.x = this.i * this.l;
        this.y = this.j * this.l;

        this.stroke_color = stroke_color;
        this.is_poisoned = false; // 格子是否在毒圈
        this.fill_color = "rgb(210, 222, 238)";


    }

    start() {}

    get_manhattan_dist(x1, y1, x2, y2) {
        return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
    }

    check_poison(x, y) {
        let nx = this.playground.game_map.nx;
        let ny = this.playground.game_map.ny;
        let d = Math.floor(this.playground.gametime_obj.gametime / 20); // 每20s毒向内扩散1格
        if (Math.min(x, y) < d || Math.min(Math.abs(x - (nx - 1)), Math.abs(y - (ny - 1))) < d) {
            return true;
        }
        return false;
    }

    update() {
        if (this.playground.gametime_obj && !this.is_poisoned && this.check_poison(this.i, this.j)) {
            this.poison = new Poison(this.playground, this);
            this.is_poisoned = true;
        }
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy;
        let cx = ctx_x + this.l * 0.5, cy = ctx_y + this.l * 0.5; // grid的中心坐标
        // 处于屏幕范围外，则不渲染
        if (cx * scale < -0.2 * this.playground.width ||
            cx * scale > 1.2 * this.playground.width ||
            cy * scale < -0.2 * this.playground.height ||
            cy * scale > 1.2 * this.playground.height) {
            return;
        }

        this.render_grid(ctx_x, ctx_y, scale);

    }

    render_grid(ctx_x, ctx_y, scale) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = this.l * 0.03 * scale;
        this.ctx.strokeStyle = this.stroke_color;
        this.ctx.rect(ctx_x * scale, ctx_y * scale, this.l * scale, this.l * scale);
        this.ctx.stroke();
        this.ctx.restore();
    }

    render_grass(ctx_x, ctx_y, scale) {
        this.ctx.save();
        this.ctx.beginPath();
        // this.ctx.lineWidth = this.l * 0.03 * scale;
        this.ctx.lineWidth = 0;
        this.ctx.rect(ctx_x * scale, ctx_y * scale, this.l * scale, this.l * scale);
        this.ctx.fillStyle = this.grass_color;
        this.ctx.fill();
        this.ctx.restore();
    }

    on_destroy() {
        if (this.poison) {
            this.poison.destroy();
            this.poison = null;
        }
    }
}
class Starry extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = playground.game_map.ctx;
        ctx = canvas.getContext('2d'),
            w = canvas.width = window.innerWidth,
            h = canvas.height = window.innerHeight,

            hue = 217,
            stars = [],
            count = 0,
            maxStars = 1200;

        var canvas2 = document.createElement('canvas'),
            ctx2 = canvas2.getContext('2d');
        canvas2.width = 100;
        canvas2.height = 100;
        var half = canvas2.width / 2,
            gradient2 = ctx2.createRadialGradient(half, half, 0, half, half, half);
        gradient2.addColorStop(0.025, '#fff');
        gradient2.addColorStop(0.1, 'hsl(' + hue + ', 61%, 33%)');
        gradient2.addColorStop(0.25, 'hsl(' + hue + ', 64%, 6%)');
        gradient2.addColorStop(1, 'transparent');

        ctx2.fillStyle = gradient2;
        ctx2.beginPath();
        ctx2.arc(half, half, half, 0, Math.PI * 2);
        ctx2.fill();

// End cache

        function random(min, max) {
            if (arguments.length < 2) {
                max = min;
                min = 0;
            }

            if (min > max) {
                var hold = max;
                max = min;
                min = hold;
            }

            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function maxOrbit(x, y) {
            var max = Math.max(x, y),
                diameter = Math.round(Math.sqrt(max * max + max * max));
            return diameter / 2;
        }

        var Star = function () {

            this.orbitRadius = random(maxOrbit(w, h));
            this.radius = random(60, this.orbitRadius) / 12;
            this.orbitX = w / 2;
            this.orbitY = h / 2;
            this.timePassed = random(0, maxStars);
            this.speed = random(this.orbitRadius) / 900000;
            this.alpha = random(2, 10) / 10;

            count++;
            stars[count] = this;
        }

        Star.prototype.draw = function () {
            var x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX,
                y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY,
                twinkle = random(10);

            if (twinkle === 1 && this.alpha > 0) {
                this.alpha -= 0.05;
            } else if (twinkle === 2 && this.alpha < 1) {
                this.alpha += 0.05;
            }

            ctx.globalAlpha = this.alpha;
            ctx.drawImage(canvas2, x - this.radius / 2, y - this.radius / 2, this.radius, this.radius);
            this.timePassed += this.speed;
        }

        for (var i = 0; i < maxStars; i++) {
            new Star();
        }
    }

    render() {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = 'hsla(' + hue + ', 64%, 6%, 1)';
        ctx.fillRect(0, 0, w, h)

        ctx.globalCompositeOperation = 'lighter';
        for (var i = 1, l = stars.length; i < l; i++) {
            stars[i].draw();
        }
        
    }

    update() {
        this.render();
    }
}
class GameMap extends GameObject{
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas class = "game-map"></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');//jquery对象类似一个数组，第一个索引是html对象

        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);

        let width = this.playground.virtual_map_width;
        let height = this.playground.virtual_map_height;

        this.l = height * 0.05;
        this.nx = Math.ceil(width / this.l);
        this.ny = Math.ceil(height / this.l);


        this.start();
    }
    start(){
        this.$canvas.focus();

        this.generate_grid();
        // this.generate_wall();
        this.has_called_start = true;

    }
    generate_grid() {
        this.grids = [];
        for (let i = 0; i < this.ny; i ++ ) {
            for (let j = 0; j < this.nx; j ++ ) {
                this.grids.push(new Grid(this.playground, this.ctx, j, i, this.l, "rgb(222, 237, 225, 0.1)"));
            }
        }
    }

    generate_wall() {
        let wall_pic = "https://s3.bmp.ovh/imgs/2021/11/837412e46f4f61a6.jpg";
        this.walls = [];
        for (let i = 0; i < this.ny; i ++ ) {
            for (let j = 0; j < this.nx; j ++ ) {
                if (Math.random() < 20 / (this.nx * this.ny)) {
                    this.walls.push(new Wall(this.playground, this.ctx, j, i, this.l, wall_pic));
                }
            }
        }
    }



    update(){
        this.render();
    }
    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    render(){
        //this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); // 清空画布
        this.ctx.fillStyle = "rgb(136, 188, 194)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    }
    on_destroy() {
        for (let i = 0; i < this.grids.length; i ++ ) {
            this.grids[i].destroy();
        }
        this.grids = [];
    }

}class GameTime extends GameObject {
    constructor(playground) {
        super();

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.gametime = 0;
    }

    start() {
    }

    update() {
        this.gametime += this.timedelta / 1000;
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        let minute = Math.floor(this.gametime / 60);
        if (minute < 10)
            minute = "0" + minute;
        let second = this.gametime % 60;
        second = second.toFixed(1);
        this.ctx.font = 0.04 * scale + "px bold serif";
        this.ctx.fillStyle = "white"; // TODO: 调整颜色
        this.ctx.textAlign = "center";
        this.ctx.fillText(minute + ":" + second, 1.5 * scale, 0.05 * scale);
    }
}
class MiniMap extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas class="mini-map"></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.bg_color = "rgba(0, 0, 0, 0.3)";
        this.bright_color = "rgba(247, 232, 200, 0.7)";
        this.players = this.playground.players; // TODO: 这里是浅拷贝?
        this.pos_x = this.playground.width - this.playground.height * 0.3;
        this.pos_y = this.playground.height * 0.7;
        this.width = this.playground.height * 0.3;
        this.height = this.width;
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;

        this.playground.$playground.append(this.$canvas);
        this.real_map_width = this.playground.virtual_map_width;

        this.lock = false;
        this.drag = false;
    }

    start() {
        this.add_listening_events();
    }

    resize() {
        this.pos_x = this.playground.width - this.playground.height * 0.3;
        this.pos_y = this.playground.height * 0.7;
        this.width = this.playground.height * 0.3;
        this.height = this.width;
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;

        this.margin_right = (this.playground.$playground.width() - this.playground.width) / 2;
        this.margin_bottom = (this.playground.$playground.height() - this.playground.height) / 2;
        this.$canvas.css({
            "position": "absolute",
            "right": this.margin_right,
            "bottom": this.margin_bottom
        });
    }

    add_listening_events() {
        let outer = this;
        this.$canvas.on("contextmenu", function() {
            return false;
        });
        this.$canvas.mousedown(function(e) {
            if (outer.playground.state === "waiting") {
                return true;
            }

            const rect = outer.ctx.canvas.getBoundingClientRect();
            let ctx_x = e.clientX - rect.left, ctx_y = e.clientY - rect.top; // 小地图上的位置
            let tx = ctx_x / outer.width * outer.playground.virtual_map_width, ty = ctx_y / outer.height * outer.playground.virtual_map_height; // 大地图上的位置
            if (e.which === 1) { // 左键，定位屏幕中心
                outer.lock = true;
                outer.drag = false;

                outer.playground.focus_player = null;
                outer.playground.re_calculate_cx_cy(tx, ty);
                // (rect_x1, rect_y1)为小地图上框框的左上角的坐标（非相对坐标）
                outer.rect_x1 = ctx_x - (outer.playground.width / 2 / outer.playground.scale / outer.playground.virtual_map_width) * outer.width;
                outer.rect_y1 = ctx_y - (outer.playground.height / 2 / outer.playground.scale / outer.playground.virtual_map_height) * outer.height;
            } else if (e.which === 3) { // 右键，移动过去
                let player = outer.playground.players[0];
                if (player.character === "me") {
                    player.move_to(tx, ty);
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_move_to(tx, ty);
                    }
                }
            }
        });

        this.$canvas.mousemove(function(e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            let ctx_x = e.clientX - rect.left, ctx_y = e.clientY - rect.top; // 小地图上的位置
            let tx = ctx_x / outer.width * outer.playground.virtual_map_width, ty = ctx_y / outer.height * outer.playground.virtual_map_height; // 大地图上的位置
            if (e.which === 1) {
                if (outer.lock) {
                    outer.drag = true;
                    outer.playground.focus_player = null;
                    outer.playground.re_calculate_cx_cy(tx, ty);
                    outer.rect_x1 = ctx_x - (outer.playground.width / 2 / outer.playground.scale / outer.playground.virtual_map_width) * outer.width;
                    outer.rect_y1 = ctx_y - (outer.playground.height / 2 / outer.playground.scale / outer.playground.virtual_map_height) * outer.height;
                }
            }
        });

        this.$canvas.mouseup(function(e) {
            if (outer.lock) outer.lock = false;
            outer.playground.game_map.$canvas.focus();
        });
    }

    update() {
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.clearRect(0, 0, this.width, this.height); // 不加这行的话小地图背景会变黑
        this.ctx.fillStyle = this.bg_color;
        this.ctx.fillRect(0, 0, this.width, this.height);
        if (this.playground.focus_player) {
            this.rect_x1 = (this.playground.focus_player.x - this.playground.width / 2 / scale) / this.real_map_width * this.width;
            this.rect_y1 = (this.playground.focus_player.y - this.playground.height / 2 / scale) / this.real_map_width * this.height;
        }
        let w = this.playground.width / scale / this.real_map_width * this.width;
        let h = this.playground.height / scale / this.real_map_width * this.height;
        this.ctx.save();
        this.ctx.strokeStyle = this.bright_color;
        this.ctx.setLineDash([15, 5]);
        this.ctx.lineWidth = Math.ceil(3 * scale / 1080);
        this.ctx.strokeRect(this.rect_x1, this.rect_y1, w, h);
        this.ctx.restore();
        for (let i = 0; i < this.players.length; i ++ ) {
            let obj = this.players[i];

            // 物体在真实地图上的位置 -> 物体在小地图上的位置
            let x = obj.x / this.real_map_width * this.width, y = obj.y / this.real_map_width * this.height;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.width * 0.05, 0, Math.PI * 2, false); // false代表顺时针
            if (obj.character === "me") this.ctx.fillStyle = "green";
            else this.ctx.fillStyle = "red";
            this.ctx.fill();
        }
    }

}
class NoticeBoard extends GameObject{
    constructor(playground){
        super();

        this.playground = playground;
        console.log(this.playground);
        this.ctx = this.playground.game_map.ctx;
        this.text = "已就绪:0人";

    }
    start(){

    }
    write(text){
        this.text = text;
    }
    update(){
        this.render();
    }
    render(){
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
    }
}class Particle extends GameObject{
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length){
        super();
        //console.log("粒子实例")
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 0.01;
        //console.log(this.speed, this.move_length, this.x, this.y, this.radius, this.color);
    }
    start(){

    }
    update(){
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();


    }
    render(){
        let scale = this.playground.scale;
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy; // 把虚拟地图中的坐标换算成canvas中的坐标
        if (ctx_x < -0.1 * this.playground.width / scale ||
            ctx_x > 1.1 * this.playground.width / scale ||
            ctx_y < -0.1 * this.playground.height / scale ||
            ctx_y > 1.1 * this.playground.height / scale) {
            return;
        }
        this.ctx.beginPath();
        this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

    }
}class Player extends GameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        // 位置相关
        this.x = x;
        this.y = y;
        // 移动相关
        this.speed = speed;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0; // 需要移动的距离
        this.friction = .9;
        this.eps = 0.01;
        // 渲染相关
        this.radius = radius;
        this.color = color;
        this.attacked_state = false;
        this.attacked_time = 0; // 掉血显示时间1s

        // 身份相关
        this.character = character;
        this.username = username;
        this.photo = photo;
        // 状态相关
        this.hp = 100;
        this.max_hp = 100;
        this.damage = 10;
        this.cur_skill = null; // 当前选择技能
        this.is_hurtable = true;


        this.start_attack = 0;// >4才能开始攻击的
        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }
        if (this.character === "me") {
            this.fireball_cd = 3;
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";
        }
        this.fireballs = []; //该用户发射的所有火球


        //console.log(this.color);
        //console.log(this.playground);
    }

    start() {
        this.playground.player_count++;
        this.playground.notice_board.write("已就绪:" + this.playground.player_count + "人");
        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting!");
            this.playground.gametime_obj = new GameTime(this.playground);
        }

        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });

        this.playground.game_map.$canvas.mousedown(function (e) {
            if (outer.playground.state !== "fighting") return false;//房间内人不满时禁止操作

            const rect = outer.ctx.canvas.getBoundingClientRect();
            let tx = (e.clientX - rect.left) / outer.playground.scale + outer.playground.cx;
            let ty = (e.clientY - rect.top) / outer.playground.scale + outer.playground.cy;

            if (e.which == 3) {
                if (tx < 0 || tx > outer.playground.virtual_map_width || ty < 0 || ty > outer.playground.virtual_map_height) return; // 不能向地图外移动
                outer.move_to(tx, ty);
                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }

            }
        });
        let mouseX = 0, mouseY = 0;
        this.playground.game_map.$canvas.mousemove(function (e) {
            outer.mouseX = e.clientX;
            outer.mouseY = e.clientY;
        });

        $(window).keydown(function (e) {
            console.log(e.which);
            if (outer.playground.state !== "fighting") return false;
            const rect = outer.ctx.canvas.getBoundingClientRect();
            let tx = (outer.mouseX - rect.left) / outer.playground.scale + outer.playground.cx;
            let ty = (outer.mouseY - rect.top) / outer.playground.scale + outer.playground.cy;

            //console.log(outer.playground.cx, tx);
            if (e.which == 81) {
                if (outer.fireball_cd >= outer.eps) return false;
                //console.log(outer.mouseX, " ", outer.mouseY);
                let fireball = outer.shoot_fireball(tx, ty);
                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uid);
                }
                outer.fireball_cd = 3;
                return false;
            } else if (e.which == 13) {

                if (outer.playground.mode === "multi mode") {
                    outer.playground.chat.show_input();
                    return false;
                }
            } else if (e.which === 27) {
                if (outer.playground.mode === "multi mode") {
                    outer.playground.chat.hide_input();
                    return false;
                }
            } else if (e.which === 32) { // 按1键或空格聚焦玩家
                outer.playground.focus_player = outer;
                outer.playground.re_calculate_cx_cy(outer.x, outer.y);
                return false;
            }

        })
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        //if(this.character === "me") console.log(this.playground.cx, this.playground.cy);
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);//计算移动角度
        //位移1个单位长度
        this.vx = Math.cos(angle);//
        this.vy = Math.sin(angle);
    }

    shoot_fireball(tx, ty) {
        //console.log(tx, ty);
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        //console.log(tx, ty, x, y);
        //console.log("angle:", angle);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.6;
        let move_length = 1.0;
        let damage = 20;
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
        this.fireballs.push(fireball);
        if(this.character !== "robot")console.log(fireball);
        return fireball;
    }

    destroy_fireball(uid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uid === uid) {
                fireball.destroy();
                break;
            }
        }
    }

    is_attacked(angle, damage) {//是否被攻击  在fireball -> attack()中被引用
        //粒子效果
        //console.log("触发粒子效果");
        for (let i = 0; i < 15 + Math.random() * 15; i++) {

            let x = this.x;
            let y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = 2 * Math.PI * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 7;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

        //console.log(damage, this.radius);
        //this.radius -= damage;
        this.hp -= damage;
        //console.log(this.hp);
        if (this.hp <= 0) {
            //console.log(this.hp);
            this.destroy();
            return false;
        }
        this.damage_vx = Math.cos(angle);
        this.damage_vy = Math.sin(angle);
        this.damage_speed = 5;

        //this.speed *= 0.5;
    }

    receive_attack(x, y, angle, damage, ball_uid, attacker) {
        attacker.destroy_fireball(ball_uid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    update_cd() {
        this.fireball_cd -= this.timedelta / 1000;
        this.fireball_cd = Math.max(0, this.fireball_cd);
    }

    update_win() {
        if (this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1) {
            this.playground.state = "over";
            this.playground.ending_Interface.win();
        }
    }

    update_move() {
        if (this.character === "robot" && this.start_attack > 4 && Math.random() * 240 < 1) {//每秒渲染60帧，每帧1/240的概率攻击
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            this.shoot_fireball(player.x, player.y);
        }
        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;//受到攻击后不受控制且击退
            this.move_length = 0;
            this.x += this.damage_vx * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_vy * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === "robot") {
                    let l = this.playground.game_map.l;
                    let d = 0;
                    // 控制AI不往毒里走
                    if (this.playground.gametime_obj) {
                        d = Math.floor(this.playground.gametime_obj.gametime / 20) * l;
                        d = Math.min(d, this.playground.virtual_map_width / 2);
                    }
                    let tx = d + Math.random() * (this.playground.virtual_map_width - 2 * d);
                    let ty = d + Math.random() * (this.playground.virtual_map_height - 2 * d);
                    this.move_to(tx, ty);

                }
            } else {
                //计算单位帧的移动距离
                let dist = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * dist;//计算x轴单位长度
                this.y += this.vy * dist;
                this.move_length -= dist;
            }
        }
    }

    update() {
        this.start_attack += this.timedelta / 1000;

        this.update_win();

        if (this.character === "me" && this.playground.state === "fighting") this.update_cd();

        // 如果是玩家，并且正在被聚焦，修改background的 (cx, cy)
        if (this.character === "me" && this.playground.focus_player === this) {
            this.playground.re_calculate_cx_cy(this.x, this.y);
        }

        this.update_move();

        this.render();
    }

    render_skill_cd() {
        //console.log("渲染技能图标");
        let scale = this.playground.scale;
        let x = 1, y = 0.9, r = 0.04;

        // 渲染技能图标
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        // 渲染冷却指示
        if (this.fireball_cd >= this.eps) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_cd / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    render() {
        let scale = this.playground.scale;
        //console.log(this.character, this.playground.state);
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy; // 把虚拟地图中的坐标换算成canvas中的坐标
        if (ctx_x < -0.2 * this.playground.width / scale ||
            ctx_x > 1.2 * this.playground.width / scale ||
            ctx_y < -0.2 * this.playground.height / scale ||
            ctx_y > 1.2 * this.playground.height / scale) {
            if (this.character != "me") { // 一个隐藏的bug，如果是玩家自己并且return，会导致技能图标渲染不出来
                return;
            }
        }

        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_cd();
        }
        if (this.character != "robot") {
            this.ctx.save();
            this.ctx.strokeStyle = this.color;
            this.ctx.beginPath();
            this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (ctx_x - this.radius) * scale, (ctx_y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

    }

    on_destroy() {
        console.log("destroy");
        if (this.character === "me" && this.playground.state === "fighting") {
            this.playground.state = "over";
            this.playground.ending_Interface.lose();
        }
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
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
        //console.log("is attacked")
        player.is_attacked(angle, this.damage);
        if(this.playground.mode === "multi mode"){
            this.playground.mps.send_attack(player.uid, player.x, player.y, angle, this.damage, this.uid);
        }
        this.destroy();
    }
    on_destroy(){
        let fireballs = this.player.fireballs;
        for(let i = 0; i < fireballs.length; i ++ ){
            if(fireballs[i] === this){
                fireballs.splice(i, 1);
                break;
            }
        }
    }
    update_move(){
        let dist = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * dist;
        this.y += this.vy * dist;
        this.move_length -= dist;
    }
    update_attack(){
        //碰撞检测
        for(let i = 0; i < this.playground.players.length; i ++ ){
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)){
                this.attack(player);
                break;
            }
        }
    }
    update(){
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }
        this.update_move();
        if(this.player.character !== "enemy"){//只有发出方的火球才做碰撞检测
            this.update_attack();
        }

        this.render();
    }
    render(){
        let scale = this.playground.scale;
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy; // 把虚拟地图中的坐标换算成canvas中的坐标
        if (ctx_x < -0.1 * this.playground.width / scale ||
            ctx_x > 1.1 * this.playground.width / scale ||
            ctx_y < -0.1 * this.playground.height / scale ||
            ctx_y > 1.1 * this.playground.height / scale) {
            return;
        }
        this.ctx.beginPath();
        this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

    }
}class MultiPlayerSocket{
    constructor(playground){
        this.playground = playground;
        this.ws = new WebSocket("ws://8.140.22.23:8000/ws/multiplayer/");
        this.start();
    }
    start(){
        this.receive();
    }
    receive(){
        let outer = this;
        this.ws.onmessage = function(e){
            let data =  JSON.parse(e.data);
            let uid = data.uid;
            if(uid === outer.uid) return false;

            let event = data.event;
            console.log(event);
            if(event === "create_player"){
                outer.receive_create_player(uid, data.username, data.photo);
            }
            else if(event === "move_to"){
                outer.receive_move_to(uid, data.tx, data.ty);
            }
            else if(event === "shoot_fireball"){
                outer.receive_shoot_fireball(uid, data.tx, data.ty, data.ball_uid);
            }
            else if(event === "attack"){
                outer.receive_attack(uid, data.attackee_uid, data.x, data.y, data.angle, data.damage, data.ball_uid);
            }
            else if(event === "message"){
                console.log("receive post");
                outer.receive_message(data.username, data.text);
            }
        };
    }
    send_create_player(username, photo){
        let outer = this;
        //console.log(username);
        this.ws.send(JSON.stringify({
            'event': 'create_player',
            'uid': outer.uid,
            'username': username,
            'photo': photo,
        }));
    }
    receive_create_player(uid, username, photo){
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.3,
            "enemy",
            username,
            photo,
        );
        player.uid = uid;
        this.playground.players.push(player);
    }
    get_player(uid){
        let players = this.playground.players;
        for(let i = 0; i < players.length; i ++ ){
            let player = players[i];
            //console.log("player:",player);
            if(player.uid === uid){
                return player;
            }
        }
        return null;
    }
    send_move_to(tx, ty){
        let outer = this;
        //console.log("send move to:", tx, ty, outer);
        this.ws.send(JSON.stringify({
            'event': 'move_to',
            'uid': outer.uid,
            'tx': tx,
            'ty': ty,
        }));
    }
    receive_move_to(uid, tx, ty){
        let player = this.get_player(uid);
        //console.log("receive move to:", tx, ty, player);
        if(player){
            player.move_to(tx, ty);
        }
    }
    send_shoot_fireball(tx, ty, ball_uid){
        let outer = this;
        //console.log("shoot fireball", tx, ty);
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uid': outer.uid,
            'tx': tx,
            'ty': ty,
            'ball_uid': ball_uid,
        }));
    }
    receive_shoot_fireball(uid, tx, ty, ball_uid){
        let player = this.get_player(uid);
        //console.log("receive shoot fireball", tx, ty);
        if(player){
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uid = ball_uid;
        }
    }
    send_attack(attackee_uid, x, y, angle, damage, ball_uid){
        let outer = this;
        console.log("send attack");
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uid': outer.uid,
            'attackee_uid': attackee_uid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uid': ball_uid,
        }));
    }
    receive_attack(uid, attackee_uid, x, y, angle, damage, ball_uid){
        console.log("receive_attack");
        let attacker = this.get_player(uid);
        let attackee = this.get_player(attackee_uid);
        if(attacker && attackee){
            attackee.receive_attack(x, y, angle, damage, ball_uid, attacker);
        }
    }
    send_message(text){
        console.log("send", text);
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uid': outer.uid,
            'username': outer.playground.root.settings.username,
            'text': text,
        }));
    }
    receive_message(username, text){
        console.log("receive", text);
        this.playground.chat.add_message(username, text);
    }
}let SCALE;
class GamePlayground{
    constructor(root){
        this.root = root;

        this.focus_player = null; // 镜头聚焦玩家
        this.gametime_obj = null; // 游戏时间
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
        SCALE = this.scale;
        if(this.game_map) this.game_map.resize();//若地图已创建 resize
        if (this.mini_map) this.mini_map.resize();
    }
    re_calculate_cx_cy(x, y) {
        this.cx = x - 0.5 * this.width / this.scale; //己方视角中心点的坐标
        this.cy = y - 0.5 * this.height / this.scale;

        let l = this.game_map.l;
        if (this.focus_player) {
            //console.log(this.focus_player);
            this.cx = Math.max(this.cx, -2 * l);
            this.cx = Math.min(this.cx, this.virtual_map_width - (this.width / this.scale - 2 * l));
            this.cy = Math.max(this.cy, -l);
            this.cy = Math.min(this.cy, this.virtual_map_height - (this.height / this.scale - l));
        }
    }

    show(mode){
        this.$playground.show();
        this.resize();
        //生成游戏界面
        this.state = "waiting"; // waiting ==> fighting ==> over
        this.mode = mode; // 记录模式

        //this.width = this.$playground.width();
        //this.height = this.$playground.height();
        //console.log(Math.max(this.width, this.height));
        this.virtual_map_width = Math.max(this.width, this.height) / this.scale * 2;
        this.virtual_map_height = this.virtual_map_width; // 正方形地图，方便画格子

        this.game_map = new GameMap(this);
        //this.grid = new Grid(this);

        this.notice_board = new NoticeBoard(this);
        this.ending_Interface = new endingInterface(this);
        this.player_count = 0;

        this.resize();

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.3, "me", this.root.settings.username, this.root.settings.photo));
        // 根据玩家位置确定画布相对于虚拟地图的偏移量
        this.re_calculate_cx_cy(this.players[0].x, this.players[0].y);
        this.focus_player = this.players[0];


        //console.log(mode);
        if(mode === "single mode"){
            //人机
            for(let i = 0; i < 5; i ++ ){
                let px = Math.random() * this.virtual_map_width, py = Math.random() * this.virtual_map_height;
                this.players.push(new Player(this, px, py, 0.05, this.get_random_color(), 0.3, "robot"));
            }
        }
        else if(mode === "multi mode"){
            //console.log("multi mode!");
            let outer = this;
            this.chat = new Chat(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uid = this.players[0].uid;//mps的uid为自己的uid 以便于向服务器发送信息时带上自己的uid
            //console.log(this.mps);
            this.mps.ws.onopen = function(){
                //console.log("ws.onopen!");
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }

        this.mini_map = new MiniMap(this, this.game_map);
        this.mini_map.resize();

    }
    hide(){
        //清空所有游戏元素
        while (this.players && this.players.length > 0) {
            this.players[0].destroy();
        }
        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }
        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }
        if (this.mini_map) {
            this.mini_map.destroy();
            this.mini_map = null;
        }
        if (this.gametime_obj) {
            this.gametime_obj.destroy();
            this.gametime_obj = null;
        }

        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }
        this.$playground.empty();   //清空所有html标签
        this.$playground.hide();
    }
    get_random_color(){
        let colors = ["blue", "green", "pink", "grey", "red"];
        return colors[Math.floor(Math.random() * 5)];
    }
}class RankList{
    constructor(root) {
        this.root = root;
        this.$rank = $(`
            <div class = "rank-board">
                <i class = "layui-icon layui-icon-refresh" style = "cursor: pointer;font-size: 45px;position: absolute; top: 10px; left: 10px;" id = "rank-refresh"></i>
                <i class = "layui-icon layui-icon-error" style = "cursor: pointer;font-size: 50px;position: absolute; top: 10px; right: 10px;" id = "rank-close"></i>
                <h1 style = "margin-top: 3vh">天梯分</h1>
                <div id = "rank-list">
                </div>
            </div>
        `);

        this.$rank.hide();
        this.root.$game.append(this.$rank);
        this.start();
    }
    start() {//游戏创建时自动调用
        console.log("start")
        this.add_listening_events()
        this.get_rank_list();
    }
    add_listening_events(){
        let outer = this;
        document.getElementById("rank-close").addEventListener("click", function(){
            outer.hide();
            //outer.root.menu.show();
        })
        document.getElementById("rank-refresh").addEventListener("click", function(){
            //console.log("refresh");
            outer.get_rank_list();
        })
    }
    get_rank_list(){
        // 获取 ID 为 "rank-list" 的 div 元素
        var rankList = document.getElementById("rank-list");

        // 移除所有子 div 元素
        while (rankList.firstChild) {
            rankList.removeChild(rankList.firstChild);
        }

        $.ajax({
            url: "http://8.140.22.23:8000/rank/getrank",
            type: "GET",

            success: function(resp){
                console.log(resp);
                for(let i = 0; i < resp.rank_list.length; i ++ ){
                    const newDiv = $('<div class = "rank-list-item"></div>');
                    if(i == 0) newDiv.addClass("gold");
                    if(i == 1) newDiv.addClass("silver");
                    if(i == 2) newDiv.addClass("copper");
                    // 填充div内容，例如显示用户的名字和得分
                    newDiv.html(`<span class = "rank-list-item-no">NO${i}</span><span class = "rank-list-item-name">${resp.rank_list[i].username}</span> <span class = "rank-list-item-score">${resp.rank_list[i].score}</span>`);


                    $('#rank-list').append(newDiv);
                }

                const iDiv = $('<div class = "rank-i rank-list-item"></div>');
                iDiv.html(`<span class = "rank-i-no rank-list-item-no">iNO${resp.rank_me}</span><span class = "rank-i-name rank-list-item-name">${resp.iname}</span> <span class = "rank-i-score rank-list-item-score">${resp.score_me}</span>`);
                $('#rank-list').append(iDiv);
            }
        });

    }
    show(){
        this.$rank.fadeIn(500);
    }
    hide(){
        this.$rank.fadeOut(300);
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
        this.rank = new RankList(this);
        this.playground = new GamePlayground(this);

        this.start();
    }
    start(){

    }
}