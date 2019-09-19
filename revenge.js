var Revenge = function(game){
    this.game = game;
};

Revenge.prototype = {
    init: function(score, result) {
        this.score = score;
        this.result = result;
    },

    preload: function() {
        this.game.load.audio('bonus-bgm', 'assets/audio/Bonus Level.wav');
    },

    create: function() {
        this.game.bonus = this.game.add.audio('bonus-bgm', 1, false);
        this.game.bonus.play();
        this.revenge = this.game.add.sprite(5, 300, 'revenge', 0);
        this.revenge.scale.setTo(0.6,0.6);
        this.revenge.animations.add("fire", [0, 1, 2, 3, 4], 15, true);
        this.revenge.play("fire");
        this.countDown = this.game.add.text(250, 400, "", { fontSize: "48px", fill: "#fff" });
        this.countStart = this.time.time;
    },

    update: function() {
        this.game.time.events.add(6000, this.startRevenge, this, null);
        if (this.time.time > this.countStart + 1000 && this.time.time < this.countStart + 2000) {
            this.countDown.text = "5";
        } else if (this.time.time > this.countStart + 2000 && this.time.time < this.countStart + 3000) {
            this.countDown.text = "4";
        } else if (this.time.time > this.countStart + 3000 && this.time.time < this.countStart + 4000) {
            this.countDown.text = "3";
        } else if (this.time.time > this.countStart + 4000 && this.time.time < this.countStart + 5000) {
            this.countDown.text = "2";
        } else if (this.time.time > this.countStart + 5000 && this.time.time < this.countStart + 6000) {
            this.countDown.text = "1";
        }
    },

    startRevenge: function(){
        this.countDown.text = "";
        this.game.state.start("Bonus", true, false, this.score, this.result);
    }
};