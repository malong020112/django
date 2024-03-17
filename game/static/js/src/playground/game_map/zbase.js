class GameMap extends GameObject{
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
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
    render(){
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}