class GamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="game-playground"></div>`);

        this.hide();

        this.start();
    }
    start(){

    }
    show(){
        this.$playground.show();

        //生成游戏界面
        this.root.$game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.game_map = new GameMap(this);

        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "black", this.height * 0.3, true));

        //人机
        for(let i = 0; i < 5; i ++ ){
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.3, false));
        }
    }
    hide(){
        this.$playground.hide();
    }
    get_random_color(){
        let colors = ["blue", "green", "pink", "grey", "red"];
        return colors[Math.floor(Math.random() * 5)];
    }
}