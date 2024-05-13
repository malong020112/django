class GameTime extends GameObject {
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
