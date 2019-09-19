var preload = function(game){
	this.game = game;
};

preload.prototype = {
	preload: function() {
		this.game.load.image('title', 'assets/title_static_elvish.png');
		this.game.load.image('intro', 'assets/static_title_intro2.png');
		this.game.load.image('tiles1', 'assets/levels/Tile_Level1.png');
		this.game.load.tilemap('map1', 'assets/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.image('tiles2', 'assets/levels/Tile_Level2.png');
		this.game.load.tilemap('map2', 'assets/levels/level2.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.image('tiles3', 'assets/levels/Tile_Level3.png');
		this.game.load.tilemap('map3', 'assets/levels/level3.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('tiles4', 'assets/levels/Tile_Level4.png');
        this.game.load.tilemap('map4', 'assets/levels/level4.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.tilemap('ending', 'assets/levels/ending.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.tilemap('lose', 'assets/levels/lose.json', null, Phaser.Tilemap.TILED_JSON);
		this.game.load.image("lifecounter", "assets/heart32.png");
		this.game.load.spritesheet('key_yellow', 'assets/pickups/yellow-key-sparkle.png', 32, 32);
		this.game.load.spritesheet('key_red', 'assets/pickups/red-key-sparkle.png', 32, 32);
		this.game.load.spritesheet('key_blue', 'assets/pickups/blue-key-sparkle.png', 32, 32);
		this.game.load.spritesheet('key_green', 'assets/pickups/green-key-sparkle.png', 32, 32);
		this.game.load.image('sword', 'assets/pickups/sword-big.png');
		this.game.load.spritesheet('hero', 'assets/hero/elf.png', 32, 32, 80);
		this.game.load.spritesheet('monster1', 'assets/monsters/Skull_WalkCycle-red.png', 32, 32);
		this.game.load.spritesheet('monster2', 'assets/monsters/Skull_WalkCycle-pink.png', 32, 32);
		this.game.load.spritesheet('monster3', 'assets/monsters/Skull_WalkCycle-green.png', 32, 32);
		this.game.load.spritesheet('monster4', 'assets/monsters/Skull_WalkCycle.png', 32, 32);
		this.game.load.spritesheet('skull-dance', 'assets/monsters/skull_dance.png', 32, 32);
		this.game.load.spritesheet('treasure', 'assets/pickups/treasure.png', 32, 32);
		this.game.load.spritesheet('torch', 'assets/props/torch.png', 32, 32);
		this.game.load.spritesheet('grass', 'assets/props/grass.png', 32, 32);
        this.game.load.spritesheet('grass1', 'assets/props/grass_forest.png', 32, 32);
		this.game.load.spritesheet('door', 'assets/props/DoorOpen_5f_DoorReady_4f.png', 32, 32);
		this.game.load.spritesheet('revenge', 'assets/revenge.png', 845, 119);
		this.game.load.spritesheet('firework1', 'assets/props/firework_green.png', 128, 128);
		this.game.load.spritesheet('firework2', 'assets/props/firework_pink.png', 128, 128);
		this.game.load.spritesheet('firework3', 'assets/props/firework_orange.png', 128, 128);
		this.game.load.spritesheet('firework4', 'assets/props/firework_blue.png', 128, 128);
		this.game.load.spritesheet('slash', 'assets/monsters/Slash.png', 96, 96);
	},
  	create: function() {
		this.game.state.start("GameTitle");
	}
};