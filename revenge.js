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
        this.bonus.play();
        this.revenge = this.game.add.sprite(5, 300, 'revenge', 0);
        this.revenge.scale.setTo(0.6,0.6);
        this.revenge.animations.add("fire", [0, 1, 2, 3, 4], 15, true);
        this.revenge.play("fire");
    },

    update: function() {
        this.game.time.events.add(5000, this.startRevenge, this, null);
    },

    startRevenge: function(){
        this.game.state.start("Bonus", true, false, this.score);
    }
};