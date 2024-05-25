class Player extends GameObject {
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
        this.friction = 0.9;
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
        this.damage = 20;
        this.poisoned_time = 0;
        this.cur_skill = null; // 当前选择技能
        this.is_hurtable = true;

        this.bgm = document.getElementsByClassName("game-playground-bgm")[0];

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

            this.bgm.src = "http://8.140.22.23:8000/static/audio/playground/bgm.mp3";
            this.bgm.volume = 0.5;
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
    out_of_map() {
        if (this.x < 0 || this.x > this.playground.virtual_map_width || this.y < 0 || this.y > this.playground.virtual_map_height) {
            return true;
        }
        return false;
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
        //if(this.character !== "robot")console.log(fireball);
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
    check_in_poison() {
        if (this.out_of_map()) {
            return true; //出界了也算在毒中
        }
        let nx = this.playground.game_map.nx;
        let l = this.playground.game_map.l;
        let i = Math.floor(this.x / l);
        let j = Math.floor(this.y / l);

        let grids = this.playground.game_map.grids;
        if (grids[j * nx + i].is_poisoned)
            return true;
    }
    is_posion_attacked(){
        this.hp -= 10;
        if (this.hp <= 0) {
            //console.log(this.hp);
            this.destroy();
            return false;
        }
    }
    update_poisoned_time() {
        if (this.character === "me" && this.check_in_poison()) {
            this.poisoned_time += this.timedelta / 1000;
            if (this.poisoned_time >= 1) {
                this.is_posion_attacked();
                this.playground.mps.send_attack(this.uid, 0, 0, 0, 10, 0, "posion");
                if (this.hp <= this.eps) {
                    this.destroy();
                }
                this.poisoned_time = 0; // 超过1s重新计时
                // 用attacked_time渲染掉血
            }
        } else {
            this.poisoned_time = 0;
        }
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

         if (this.playground.player_count > 1) {
            this.update_poisoned_time();
        }
        this.update_win();

        if (this.character === "me" && this.playground.state === "fighting"){
            this.update_cd();
        }

        // 如果是玩家，并且正在被聚焦，修改background的 (cx, cy)
        if (this.character === "me" && this.playground.focus_player === this) {
            this.playground.re_calculate_cx_cy(this.x, this.y);
        }

        this.update_move();



        this.render();
    }

    render_hp_bar(x, y, scale, color) {
        this.ctx.save();

        // 边框
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.radius * 1.1 * scale, 0, -Math.PI, true);
        this.ctx.lineTo(x - this.radius * 1.3 * scale, y);
        this.ctx.arc(x, y, this.radius * 1.3 * scale, Math.PI, Math.PI * 2, false);
        this.ctx.lineTo(x + this.radius * 1.1 * scale, y);
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // 血量条
        let start_angle = - (1 - this.hp / this.max_hp) * Math.PI;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.radius * 1.1 * scale, start_angle, -Math.PI, true);
        this.ctx.lineTo(x - this.radius * 1.3 * scale, y);
        this.ctx.arc(x, y, this.radius * 1.3 * scale, Math.PI, Math.PI * 2 + start_angle, false);
        this.ctx.fillStyle = color;
        this.ctx.fill();

        // 血量值
        this.ctx.font = 0.02 * scale + "px bold serif";
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.textAlign = "center";
        this.ctx.fillText(this.hp, x + this.radius * 1.6 * scale, y);

        // 掉血量条
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.radius * 1.1 * scale, 0, start_angle, true);
        this.ctx.lineTo(x + (this.radius * 1.3 * Math.cos(start_angle)) * scale, y + this.radius * 1.3 * Math.sin(start_angle) * scale);
        this.ctx.arc(x, y, this.radius * 1.3 * scale, Math.PI * 2 + start_angle, Math.PI * 2, false);
        this.ctx.fillStyle = "rgb(44, 65, 43)";
        this.ctx.fill();

        this.ctx.restore();
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

        if (this.character === "me") {
            this.render_hp_bar(ctx_x * scale, ctx_y * scale, scale, "rgb(65,105,225)"); // 蓝色
        } else {
            this.render_hp_bar(ctx_x * scale, ctx_y * scale, scale, "rgb(249, 19, 51)"); // 红色
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
}