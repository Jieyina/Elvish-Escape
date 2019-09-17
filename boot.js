var boot = function(game){
	this.game = game;
};
  
boot.prototype = {
	create: function(){
		if (this.game.sound.context.state === 'suspended') {
			this.game.sound.context.resume();
		}
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.pageAlignHorizontally = true;
		this.game.scale.pageAlignVertically = true;

		Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.state.start("Preload");
	}
};