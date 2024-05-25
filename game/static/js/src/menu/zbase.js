class GameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class = "add-photo-div">
    <i class = "layui-icon layui-icon-add-circle add-photo" lay-on="add-photo" style = "font-size: 55px;cursor: pointer;"></i>
    <i class = "layui-icon layui-icon-time history-rank-icon" style = "font-size: 55px; margin-left:20px;cursor: pointer;"></i>
    <i class = "layui-icon layui-icon-question game-description" style = "font-size: 55px; margin-left:20px;cursor: pointer;"></i>
</div>   
<div class="game-menu">
    <div class="game-menu-field">
        <div class="game-menu-field-item game-menu-field-item-single">
            人机模式
        </div>
        <br>
        <div class="game-menu-field-item game-menu-field-item-multi">
            匹配模式
        </div>
        <br>
        <div class = "game-menu-field-item game-menu-field-item-rank">
            排行榜
        </div>
        <br>
        <div class="game-menu-field-item game-menu-field-item-settings">
            退出
        </div>
    </div>
</div>          

        `);
        this.$historyRankDiv = $(`
<div class = "history-rank">
    <i class = "layui-icon layui-icon-error" style = "cursor: pointer;font-size: 50px;position: absolute; top: 10px; right: 10px;" id = "history-rank"></i>
    <canvas id="history-rank-chart" style = "position: absolute;top:60px"></canvas>
</div>          
        `);
        this.$descriptionDiv = $(`
<div class = "game-description-div">
    <i class = "layui-icon layui-icon-error" style = "cursor: pointer;font-size: 50px;position: absolute; top: 10px; right: 10px;" id = "game-description-close"></i>
    <h1 style = "margin-top: 3vh">游戏说明</h1>
    <br>
    <br>
    <br>
    <h4>游戏移动：鼠标右键点击要移动到的位置</h4>
    <h4>发射火球：按Q键后向鼠标位置发射火球</h4>
</div>   
        `);
        this.$menu.hide();
        this.root.$game.append(this.$menu);

        this.$single = this.$menu.find('.game-menu-field-item-single');
        this.$multi = this.$menu.find('.game-menu-field-item-multi');
        this.$rank = this.$menu.find('.game-menu-field-item-rank');
        this.$settings = this.$menu.find('.game-menu-field-item-settings');
        //console.log(this.root);

        this.$addPhoto = this.$menu.find(".add-photo");

        this.$historyRankDiv.hide();
        this.root.$game.append(this.$historyRankDiv);
        this.$historyRankIcon = this.$menu.find(".history-rank-icon");
        this.$historyRankClose = this.$historyRankDiv.find("#history-rank");

        this.$descriptionDiv.hide();
        this.root.$game.append(this.$descriptionDiv);
        this.$descriptionIcon = this.$menu.find(".game-description");
        this.$descriptionClose = this.$descriptionDiv.find("#game-description-close");

        this.start();
    }

    start() {//游戏创建时自动调用
        this.add_listening_events()
    }

    add_listening_events() {
        let outer = this;
        this.$single.click(function () {
            outer.hide();
            outer.root.playground.show("single mode");
            outer.root.playground.resize();
        });
        this.$multi.click(function () {
            outer.hide();
            outer.root.playground.show("multi mode");
            outer.root.playground.resize();
        });
        this.$settings.click(function () {
            outer.root.settings.logout_remote();
        });
        this.$rank.click(function () {
            //outer.hide();
            outer.root.rank.show();
        })
        this.$historyRankIcon.click(function () {
            console.log("click!!!")
            outer.get_history_rank();
        })
        this.$historyRankClose.click(function(){
            outer.$historyRankDiv.hide();
        })
        this.$descriptionIcon.click(function(){
            console.log(outer.$descriptionDiv)
            outer.$descriptionDiv.show();
        });
        this.$descriptionClose.click(function(){
            outer.$descriptionDiv.hide();
        })
        this.add_listening_events_photo();
    }

    add_listening_events_photo() {
        let outer = this;
        layui.use(function () {
            var layer = layui.layer;
            var util = layui.util;
            // 事件
            util.on('lay-on', {
                'add-photo': function () {
                    layer.prompt({title: '请输入图片链接'}, function (value, index, elem) {
                        if (value === '') return elem.focus();
                        let src = util.escape(value);

                        // 关闭 prompt
                        $.ajax({
                            url: "http://8.140.22.23:8000/photo/addphoto/",
                            type: "GET",
                            data: {
                                src: src,
                            },
                            success: function (resp) {
                                //console.log(resp);
                                if (resp.result === "success") {
                                    layer.msg('已添加：' + src); // 显示 value
                                    outer.root.settings.getinfo();
                                }
                            }
                        });
                        layer.close(index);
                    });
                },

            })
        });

    }

    get_history_rank() {

        let outer = this;
        if (outer.$chart) {
            // 销毁之前的 Chart 实例
            outer.$chart.destroy();
        }
        $.ajax({
            url: "http://8.140.22.23:8000/rank/gethistoryrank/",
            type: "GET",
            success: function (resp) {//检查是否上传头像
                //console.log(resp);
                if (resp.result === "success") {
                    console.log(resp.history_scores);
                    var ctx = outer.$historyRankDiv.find("#history-rank-chart")[0].getContext('2d');
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                    // 创建折线图
                    var labels = resp.history_scores.map(function(value, index) {
                        return index; // 使用索引作为标签
                    });
                    outer.$chart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels, // 横轴标签
                            datasets: [{
                                label: '历史分数',
                                data: resp.history_scores, // 分数数据
                                backgroundColor: 'rgba(75, 192, 192, 0.4)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                yAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: '分数'
                                    }
                                }],
                                xAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: '下标'
                                    },
                                    ticks: {
                                        // 如果需要自定义格式（比如下标从1开始）
                                        callback: function (value) {
                                            return value + 1; // 这里简单地将下标+1，根据需求修改
                                        }
                                    }
                                }]
                            }
                        }
                    });
                }
            }
        });
        this.$historyRankDiv.show();
    }

    render_chart() {

    }

    show() {
        this.$menu.show();
    }

    hide() {
        this.$menu.hide();
    }
}