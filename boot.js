var boot = function(game){
	this.game = game;
};
  
boot.prototype = {
	create: function(){
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.pageAlignHorizontally = true;
		this.game.scale.pageAlignVertically = true;

		Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.state.start("Preload");
	}
};