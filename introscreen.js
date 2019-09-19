var introScreen = function(game){
	this.game = game;
};

introScreen.prototype = {
	preload: function() {

	},

  	create: function() {
		this.game.add.image(0, 0, 'intro');
	},

	update: function() {
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			this.game.state.start("TheGame");
		}
	}
};