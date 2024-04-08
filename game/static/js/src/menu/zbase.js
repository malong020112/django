class GameMenu{
    constructor(root) {
        this.root = root;
        this.$menu = $(`
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
        <div class="game-menu-field-item game-menu-field-item-settings">
            退出
        </div>
    </div>
    
</div>            
        `);

        this.$menu.hide();
        this.root.$game.append(this.$menu);
        this.$single = this.$menu.find('.game-menu-field-item-single');
        this.$multi = this.$menu.find('.game-menu-field-item-multi');
        this.$settings = this.$menu.find('.game-menu-field-item-settings');
        //console.log(this.root);

        this.start();
    }
    start() {//游戏创建时自动调用
        this.add_listening_events()
    }
    add_listening_events(){
        let outer = this;
        this.$single.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
            outer.root.playground.resize();
        });
        this.$multi.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
            outer.root.playground.resize();
        });
        this.$settings.click(function(){
            outer.root.settings.logout_remote();
        });
    }

    show(){
        this.$menu.show();
    }
    hide(){
        this.$menu.hide();
    }
}