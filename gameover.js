var gameOver = function(game) {
    this.game = game;
};

gameOver.prototype = {
    init: function(score) {
        this.score = score;
    },

    create: function() {
        this.game.add.text(90, 280, "Your Score: " + this.score, { fontSize: "48px", fill: "#fff" });
        this.game.add.text(80, 350, "Press Enter to restart.", { fontSize: "36px", fill: "#fff" });
    },

    update: function() {
        if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            this.game.state.start("TheGame", true, false, 0, 3, 1);
        }
    }
};