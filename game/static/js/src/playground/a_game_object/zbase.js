let Game_Objects = [];
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
