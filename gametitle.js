var gameTitle = function(game){
	this.game = game;
};

gameTitle.prototype = {
  	create: function() {
		this.game.add.text(140, 200, "Kaba Kaba", { fontSize: "48px", fill: "#fff" });
		this.game.add.text(100, 430, "Press Enter to start.", { fontSize: "36px", fill: "#fff" });
	},

	update: function() {
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			this.game.state.start("TheGame");
		}
	}
};