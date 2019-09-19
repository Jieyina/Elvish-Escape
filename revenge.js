var Revenge = function(game){
    this.game = game;
};

Revenge.prototype = {
    init: function(score) {
        this.score = score;
    },

    preload: function() {
        this.game.load.audio('bonus-bgm', 'assets/audio/Bonus Level.wav');
    },

    create: function() {
        this.bonus = this.game.add.audio('bonus-bgm', 1, false);
        if (this.bgm_menu.isPlaying)
            this.bgm_menu.restart();
        this.bgm_menu.play();
        this.game.add.image(0, 0, 'title');
        this.game.add.text(100, 280, "Press Enter to start.", { fontSize: "36px", fill: "#fff" });
    },

    update: function() {
        if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            this.bgm_menu.stop();
            this.game.state.start("IntroScreen");
        }
    }
};