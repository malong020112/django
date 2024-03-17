class Player extends GameObject{
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
        this.eps = 0.1;
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
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }
    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e){
            if(e.which == 3){
                outer.move_to(e.clientX, e.clientY);
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
                outer.shoot_fireball(outer.mouseX, outer.mouseY);
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
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.7;
        let move_length = this.playground.height * 1.0;
        let damage = this.playground.height * 0.01;
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
        if(this.radius < 10){
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
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
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
        //console.log(this.is_me);
        if(this.is_me){
            console.log(this.img.src);
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            //this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        }
        else{
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
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
}