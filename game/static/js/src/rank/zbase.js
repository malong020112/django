class RankList{
    constructor(root) {
        this.root = root;
        this.$rank = $(`
            <div class = "rank-board">
                <i class = "layui-icon layui-icon-error" style = "cursor: pointer;font-size: 50px;position: absolute; top: 10px; right: 10px;" id = "close"></i>
                <h1 style = "margin-top: 3vh">天梯分</h1>
                <div id = "rank-list">
                </div>
            </div>
        `);

        this.$rank.hide();
        this.root.$game.append(this.$rank);
        this.start();
    }
    start() {//游戏创建时自动调用
        console.log("start")
        this.add_listening_events()
        this.get_rank_list();
    }
    add_listening_events(){
        let outer = this;
        document.getElementById("close").addEventListener("click", function(){
            outer.hide();
            //outer.root.menu.show();
        })
    }
    get_rank_list(){
        $.ajax({
            url: "http://8.140.22.23:8000/rank/getrank",
            type: "GET",

            success: function(resp){
                console.log(resp);
                for(let i = 0; i < resp.rank_list.length; i ++ ){
                    const newDiv = $('<div class = "rank-list-item"></div>');
                    if(i == 0) newDiv.addClass("gold");
                    if(i == 1) newDiv.addClass("silver");
                    if(i == 2) newDiv.addClass("copper");
                    // 填充div内容，例如显示用户的名字和得分
                    newDiv.html(`<span class = "rank-list-item-no">NO${i}</span><span class = "rank-list-item-name">${resp.rank_list[i].username}</span> <span class = "rank-list-item-score">${resp.rank_list[i].score}</span>`);


                    $('#rank-list').append(newDiv);
                }

                const iDiv = $('<div class = "rank-i rank-list-item"></div>');
                iDiv.html(`<span class = "rank-i-no rank-list-item-no">iNO${resp.rank_me}</span><span class = "rank-i-name rank-list-item-name">${resp.iname}</span> <span class = "rank-i-score rank-list-item-score">${resp.score_me}</span>`);
                $('#rank-list').append(iDiv);
            }
        });

    }
    show(){
        this.$rank.fadeIn(500);
    }
    hide(){
        this.$rank.fadeOut(300);
    }
}