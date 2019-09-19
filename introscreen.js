var introScreen = function(game){
	this.game = game;
};

introScreen.prototype = {
  	create: function() {
		this.game.add.image(0, 0, 'intro');
	},

	update: function() {
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			this.game.bgm_menu.stop();
			this.game.state.start("TheGame");
		}
	}
};