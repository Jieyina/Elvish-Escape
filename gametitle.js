var gameTitle = function(game){
	this.game = game;
};

gameTitle.prototype = {
	preload: function() {
		this.game.load.audio('menu', 'assets/audio/main-menu.wav');
	},

  	create: function() {
		this.bgm_menu = this.game.add.audio('menu', 1, true);
		if (this.bgm_menu.isPlaying)
			this.bgm_menu.restart();
		this.bgm_menu.play();
		this.game.add.text(140, 200, "Kaba Kaba", { fontSize: "48px", fill: "#fff" });
		this.game.add.text(100, 430, "Press Enter to start.", { fontSize: "36px", fill: "#fff" });
	},

	update: function() {
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			this.bgm_menu.stop();
			this.game.state.start("TheGame");
		}
	}
};