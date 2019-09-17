var gameTitle = function(game){
	this.game = game;
};

gameTitle.prototype = {
  	create: function() {
		var gameTitle = this.game.add.sprite(280,160,"gametitle");
		gameTitle.anchor.setTo(0.5,0.5);
		this.game.add.text(100, 430, "Press Enter to start.", { fontSize: "36px", fill: "#fff" });
	},
	
	update: function() {
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			this.game.state.start("TheGame");
		}
	}
};