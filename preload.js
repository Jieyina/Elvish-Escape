var preload = function(game){
	this.game = game;
};

preload.prototype = {
	preload: function() {
		this.game.load.image('tiles1', 'assets/levels/Tile_Level1.png');
		this.game.load.tilemap('map1', 'assets/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.image('tiles2', 'assets/levels/Tile_Level2.png');
		this.game.load.tilemap('map2', 'assets/levels/level2.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.image('tiles3', 'assets/levels/Tile_Level3.png');
		this.game.load.tilemap('map3', 'assets/levels/level3.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.image("lifecounter", "assets/heart32.png");
		this.game.load.spritesheet('key_yellow', 'assets/pickups/yellow-key-sparkle.png', 32, 32);
		this.game.load.spritesheet('key_red', 'assets/pickups/red-key-sparkle.png', 32, 32);
		this.game.load.spritesheet('key_blue', 'assets/pickups/blue-key-sparkle.png', 32, 32);
		this.game.load.spritesheet('key_green', 'assets/pickups/green-key-sparkle.png', 32, 32);
		this.game.load.image('sword', 'assets/pickups/sword-big.png');
		this.game.load.spritesheet('hero', 'assets/hero/elf.png', 32, 32);
		this.game.load.spritesheet('monster1', 'assets/monsters/Skull_WalkCycle.png', 32, 32);
		this.game.load.spritesheet('monster2', 'assets/monsters/Skull_WalkCycle.png', 32, 32);
		this.game.load.spritesheet('monster3', 'assets/monsters/Skull_WalkCycle.png', 32, 32);
		this.game.load.spritesheet('monster4', 'assets/monsters/Skull_WalkCycle.png', 32, 32);
		this.game.load.spritesheet('treasure', 'assets/pickups/treasure.png', 32, 32);
		this.game.load.spritesheet('torch', 'assets/props/torch.png', 32, 32);
		this.game.load.spritesheet('grass', 'assets/props/grass.png', 32, 32);
	},
  	create: function() {
		this.game.state.start("GameTitle");
	}
};