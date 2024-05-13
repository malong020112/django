let SCALE;
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
}