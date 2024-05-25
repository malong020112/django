class GameMusic {
    constructor(playground) {
        this.playground = playground;
        this.$bgm = $(`<audio class="game-playground-bgm" src="" autoplay='autoplay' loop='loop'></audio>`);
        this.playground.$playground.append(this.$bgm);

        let bgm = document.getElementsByClassName("game-playground-bgm")[0];




    }
    show() {
        this.$bgm.show();
    }
    hide() {
        this.$bgm.hide();
    }
    stop() {
        this.$bgm.stop();
    }
}

