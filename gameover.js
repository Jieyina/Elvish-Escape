var gameOver = function(game) {
    this.game = game;
};

gameOver.prototype = {
    init: function(score) {
        this.score = score;
    },

    create: function() {
        this.map = this.add.tilemap('lose');
        this.map.addTilesetImage('Tile_Level1', 'tiles1');
        this.layer = this.map.createLayer('ground');
        this.torch = this.map.createLayer('torch');
        this.sprites = this.map.createLayer('sprites');

        this.torchUp = this.add.group();
        this.map.createFromTiles(89, -1, 'torch', this.torch, this.torchUp);
        this.torchUp.forEach(function(child) {
            child.animations.add('flame', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 15, true);
            child.play('flame');}, this);

        this.torchDown = this.add.group();
        this.map.createFromTiles(60, -1, 'torch', this.torch, this.torchDown);
        this.torchDown.forEach(function(child) {
            child.animations.add('flame', [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], 15, true);
            child.play('flame');}, this);

        this.torchLeft = this.add.group();
        this.map.createFromTiles(70, -1, 'torch', this.torch, this.torchLeft);
        this.torchLeft.forEach(function(child) {
            child.animations.add('flame', [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47], 15, true);
            child.play('flame');}, this);

        this.torchRight = this.add.group();
        this.map.createFromTiles(80, -1, 'torch', this.torch, this.torchRight);
        this.torchRight.forEach(function(child) {
            child.animations.add('flame', [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], 15, true);
            child.play('flame');}, this);

        this.ghosts = this.add.group();
        this.map.createFromTiles(65, -1, 'skull-dance', this.sprites, this.ghosts);
        this.ghosts.forEach(function(child) {
            child.animations.add('dance', [0, 1, 2, 3, 4, 5, 6, 7], 15, true);
            child.play('dance');}, this);

        this.player = this.add.group();
        this.map.createFromTiles(20, -1, 'hero', this.sprites, this.player);
        this.player.children[0].animations.add("die", [18, 19, 20, 21, 22, 23, 30, 31, 32, 33, 34, 35, 42, 43, 44, 45, 46, 47, 54, 55, 56, 57, 58, 59, 66, 67, 68, 69, 70, 71], 15, false);
        this.player.children[0].play("die");
        this.game.add.text(110, 245, "Your Score: " + this.score, { fontSize: "36px", fill: "#000" });
        this.game.add.text(140, 520, "Press Enter to restart.", { fontSize: "24px", fill: "#fff" });
    },

    update: function() {
        if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            this.game.state.start("TheGame", true, false, 0, 3, 1);
        }
    }
};