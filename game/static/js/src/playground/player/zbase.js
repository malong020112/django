class Player extends GameObject{
    constructor(playground, x, y, radius, color, speed, character, username, photo){
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
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01;
        this.friction = 0.9; //摩擦系数
        this.start_attack= 0;// >4才能开始攻击的
        if(this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }
        if(this.character === "me"){
            this.fireball_cd = 3;
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";
        }
        this.fireballs = []; //该用户发射的所有火球


        //console.log(x, y);
        //console.log(this.playground);
    }
    start(){
        this.playground.player_count ++;
        this.playground.notice_board.write("已就绪:" + this.playground.player_count + "人");
        if(this.playground.player_count >= 3){
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting!");
        }

        if(this.character === "me"){
            this.add_listening_events();
        }
        else if(this.character === "robot"){
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

        this.playground.game_map.$canvas.mousedown(function(e){
            if(outer.playground.state !== "fighting") return false;//房间内人不满时禁止操作

            const rect = outer.ctx.canvas.getBoundingClientRect();
            if(e.which == 3){
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);
                if(outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_move_to(tx, ty);
                }
            }
        });
        let mouseX = 0, mouseY = 0;
        this.playground.game_map.$canvas.mousemove(function (e){
           outer.mouseX = e.clientX;
           outer.mouseY = e.clientY;
        });
        $(window).keydown(function(e){
            if(outer.playground.state !== "fighting") return false;
            if(outer.fireball_cd >= outer.eps) return false;
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if(e.which == 81){
                //console.log(outer.mouseX, " ", outer.mouseY);
                let tx = (outer.mouseX - rect.left)/ outer.playground.scale;
                let ty = (outer.mouseY - rect.top)/ outer.playground.scale;
                let fireball = outer.shoot_fireball(tx, ty);
                if(outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uid);
                }
                outer.fireball_cd = 3;
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
        //console.log(tx, ty, x, y);
        //console.log("angle:", angle);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed =  0.6;
        let move_length = 1.0;
        let damage =  0.01;
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
        this.fireballs.push(fireball);
        return fireball;
    }
    destroy_fireball(uid){
        for(let i = 0; i < this.fireballs.length; i ++ ){
            let fireball = this.fireballs[i];
            if(fireball.uid === uid){
                fireball.destroy();
                break;
            }
        }
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

        //console.log(damage, this.radius);
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
    receive_attack(x, y, angle, damage, ball_uid, attacker){
        attacker.destroy_fireball(ball_uid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }
    update_cd(){
        this.fireball_cd -= this.timedelta / 1000;
        this.fireball_cd = Math.max(0, this.fireball_cd);
    }
    update_win(){
        if(this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1){
            this.playground.state = "over";
            this.playground.ending_Interface.win();
        }
    }
    update(){
        this.start_attack += this.timedelta / 1000;

        if(this.character === "me" && this.playground.state === "fighting") this.update_cd();

        if(this.character === "robot" && this.start_attack > 4 && Math.random() * 240 < 1){//每秒渲染60帧，每帧1/240的概率攻击
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
                if(this.character === "robot"){
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
        this.update_win();
        this.render();
    }
    render_skill_cd(){
        //console.log("渲染技能图标");
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;

        // 渲染技能图标
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        // 渲染冷却指示
        if (this.fireball_cd >= this.eps){
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_cd / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }
    render(){
        let scale = this.playground.scale;
        //console.log(this.character, this.playground.state);
        if(this.character === "me" && this.playground.state === "fighting"){
            this.render_skill_cd();
        }
        if(this.character !== "robot"){
            //console.log(this.img.src);
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
        if(this.character === "me" && this.playground.state === "fighting"){
            this.playground.state = "over";
            this.playground.ending_Interface.lose();
        }
        for(let i = 0; i < this.playground.players.length; i ++ ){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}