class FireBall extends GameObject{
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
        player.is_attacked(angle, this.damage, "fireball");
        if(this.playground.mode === "multi mode"){
            this.playground.mps.send_attack(player.uid, player.x, player.y, angle, this.damage, this.uid, "fireball");
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
}