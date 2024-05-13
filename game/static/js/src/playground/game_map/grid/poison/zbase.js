class Poison extends GameObject {
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
