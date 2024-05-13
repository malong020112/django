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

}