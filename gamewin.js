var gameWin = function(game) {
    this.game = game;
};

gameWin.prototype = {
    init: function(score) {
        this.score = score;
    },

    create: function() {
        this.game.bonus.play();
        this.map = this.add.tilemap('ending');
        this.map.addTilesetImage('Tile_Level3', 'tiles3');
        this.layer = this.map.createLayer('ground');
        this.grass = this.map.createLayer('grass');
        this.sprites = this.map.createLayer('sprites');

        this.grasses = this.add.group();
        this.map.createFromTiles(90, -1, 'grass1', this.grass, this.grasses);
        this.grasses.forEach(function(child) {
            child.animations.add('wave', [0, 1, 2, 3, 4, 5], 15, true);
            child.play('wave');}, this);

        this.ghosts = this.add.group();
        this.map.createFromTiles(65, -1, 'skull-dance', this.sprites, this.ghosts);
        this.ghosts.forEach(function(child) {
            child.animations.add('dance', [0, 1, 2, 3, 4, 5, 6, 7], 15, true);
            child.play('dance');}, this);
        this.player = this.add.group();
        this.map.createFromTiles(20, -1, 'hero', this.sprites, this.player);
        this.player.children[0].animations.add("dance", [72, 73, 74, 75, 76, 77, 78, 79], 15, true);
        this.player.children[0].play("dance");
        this.game.add.text(105, 245, "Your Score: " + this.score, { fontSize: "36px", fill: "#fff" });
    }
};