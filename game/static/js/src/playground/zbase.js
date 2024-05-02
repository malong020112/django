class GamePlayground{
    constructor(root){
        this.root = root;
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
        if(this.game_map) this.game_map.resize();//若地图已创建 resize
    }
    show(mode){
        this.$playground.show();
        this.resize();
        //生成游戏界面

        this.mode = mode; // 记录模式

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.state = "waiting"; // waiting ==> fighting ==> over
        this.notice_board = new NoticeBoard(this);
        this.ending_Interface = new endingInterface(this);
        this.player_count = 0;

        this.resize();

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.3, "me", this.root.settings.username, this.root.settings.photo));



        //console.log(mode);
        if(mode === "single mode"){
            //人机
            for(let i = 0; i < 5; i ++ ){
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.3, "robot"));
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