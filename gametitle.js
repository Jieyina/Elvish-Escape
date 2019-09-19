var gameTitle = function(game){
	this.game = game;
};

gameTitle.prototype = {
	preload: function() {
		this.game.load.audio('menu', 'assets/audio/main-menu.wav');
	},

  	create: function() {
		this.game.bgm_menu = this.game.add.audio('menu', 1, true);
		if (this.game.bgm_menu.isPlaying)
			this.game.bgm_menu.restart();
		this.game.bgm_menu.play();
		this.game.add.image(0, 0, 'title');
		this.game.add.text(113, 428, "Press Enter to start!", { fontSize: "32px", fill: "#fff" });
	},

	update: function() {
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			this.game.state.start("IntroScreen");
		}
	}
};