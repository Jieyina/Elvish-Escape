var game = new Phaser.Game(1216/2, 1344/2, Phaser.AUTO, "game");

var PacmanGame = function (game) {    
    this.map = null;
    this.layer = null;
    this.item = null;
    
    this.numKeys = 4;
    this.TOTAL_KEYS = 0;
    this.score = 0;
    this.scoreText = null;

    this.ghostSpeed = 112;
    this.ghostScatterSpeed = 105;
    this.ghostFrightenedSpeed = 75;
    this.cruiseSpeed = 120;
    this.ElroySpeed = 128;
    
    this.pacman = null; 
    this.clyde = null;
    this.pinky = null;
    this.inky = null;
    this.blinky = null;
    this.isInkyOut = false;
    this.isClydeOut = false;
    this.gameOver = false;
    this.gameWin = false;
    this.ghosts = [];
    this.livesImage = [];
    this.goalPos = {x: 8, y:11};

    this.safetile = [14, 51, 41, 24, 86, 85, 23, 25, 34, 72];
    this.gridsize = 32;
    this.threshold = 3;

    this.chest1Unlocked = false;
    this.chest2Unlocked = false;
    
    /* this.SPECIAL_TILES = [
        { x: 12, y: 11 },
        { x: 15, y: 11 },
        { x: 12, y: 23 },
        { x: 15, y: 23 }
    ]; */
    
    this.TIME_MODES = [
        {
            mode: "scatter",
            time: 7000
        },
        {
            mode: "chase",
            time: 20000
        },
        {
            mode: "scatter",
            time: 7000
        },
        {
            mode: "chase",
            time: 20000
        },
        {
            mode: "scatter",
            time: 5000
        },
        {
            mode: "chase",
            time: 20000
        },
        {
            mode: "scatter",
            time: 5000
        },
        {
            mode: "chase",
            time: -1 // -1 = infinite
        }
    ];
    this.changeModeTimer = 0;
    this.remainingTime = 0;
    this.currentMode = 0;
    this.isPaused = false;
    this.FRIGHTENED_MODE_TIME = 7000;
    

    this.DEBUG_ON = false;
    this.KEY_COOLING_DOWN_TIME = 250;
    this.lastKeyPressed = 0;
    
    this.game = game;
    this.sounds = null;
    this.killCombo = 0;
};

PacmanGame.prototype = {

    init: function () {
        if (this.game.sound.context.state === 'suspended') {
            this.game.sound.context.resume();
        }
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        // this.scale.pageAlignVertically = true;

        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas); // full retro mode, i guess ;)

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.sound = new Sounds(this);
    },

    preload: function () {
        this.load.image('tiles', 'assets/levels/Tile_Level2.png');
        this.load.image("lifecounter", "assets/heart32.png");
        this.load.spritesheet('key_yellow', 'assets/pickups/yellow-key-sparkle.png', 32, 32);
        this.load.spritesheet('key_red', 'assets/pickups/red-key-sparkle.png', 32, 32);
        this.load.spritesheet('key_blue', 'assets/pickups/blue-key-sparkle.png', 32, 32);
        this.load.spritesheet('key_green', 'assets/pickups/green-key-sparkle.png', 32, 32);
        this.load.image('sword', 'assets/pickups/sword-big.png');
        this.load.tilemap('map', 'assets/levels/level2.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.spritesheet('hero', 'assets/hero/elf.png', 32, 32);
        this.load.spritesheet('monster1', 'assets/monsters/zombie_red_sheet.png', 32, 32);
        this.load.spritesheet('monster2', 'assets/monsters/zombie_pink_sheet.png', 32, 32);
        this.load.spritesheet('monster3', 'assets/monsters/zombie_blue_sheet.png', 32, 32);
        this.load.spritesheet('monster4', 'assets/monsters/zombie_orange_sheet.png', 32, 32);
        this.load.spritesheet('treasure', 'assets/pickups/treasure.png', 32, 32);
        this.load.spritesheet('torch', 'assets/props/torch.png', 32, 32);
        this.load.spritesheet('grass', 'assets/props/grass.png', 32, 32);
        this.sound.loadAllSounds();
    },

    create: function () {
        this.sound.createAllInstances();
        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('Tile1', 'tiles');

        this.layer = this.map.createLayer('ground');
        this.grass = this.map.createLayer('grass');
        this.torch = this.map.createLayer('torch');

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

        this.grasses = this.add.group();
        this.map.createFromTiles(90, -1, 'grass', this.grass, this.grasses);
        this.grasses.forEach(function(child) {
            child.animations.add('wave', [0, 1, 2, 3, 4, 5], 15, true);
            child.play('wave');}, this);


        this.item = this.map.createLayer('item');
        this.keys = this.add.physicsGroup();
        this.map.createFromTiles(2, -1, 'key_yellow', this.item, this.keys);
        this.map.createFromTiles(46, -1, 'key_red', this.item, this.keys);
        this.map.createFromTiles(6, -1, 'key_blue', this.item, this.keys);
        this.map.createFromTiles(42, -1, 'key_green', this.item, this.keys);
        this.TOTAL_KEYS = this.numKeys;
        this.keys.forEach(function(child) {
            child.animations.add('shine', [0, 1, 2, 3, 4, 5], 15, true);
            child.play('shine');}, this);
        for (var i = 1; i < this.numKeys; i++) {
            this.keys.children[i].kill();
        }
        
        this.pills = this.add.physicsGroup();
        this.numPills = this.map.createFromTiles(65, -1, "sword", this.item, this.pills);

        this.treasure = this.add.physicsGroup();
        this.map.createFromTiles(20, -1, 'treasure', this.item, this.treasure);
        this.map.createFromTiles(88, -1, 'treasure', this.item, this.treasure);
        this.treasure.forEach(function(child) {
            child.animations.add('unlock', [0, 1, 2, 3, 4, 5], 8, false);
            child.animations.add('lock', [0], 8, true);}, this);

        //  Pacman should collide with everything except the safe tile
        this.map.setCollisionByExclusion(this.safetile, true, this.layer);
        this.map.setCollisionByExclusion([38], true, this.item);

		// Our hero
        this.pacman = new Pacman(this, "hero", {x:8, y:13});
        for (var i =  0; i < this.pacman.life; i++) {
            this.livesImage.push(this.add.image(448 + (i * 32), 575, 'lifecounter'));
        }

        // Score and debug texts
        this.scoreText = this.game.add.text(20, 272, "Score: " + this.score, { fontSize: "24px", fill: "#fff" });
        this.winText = this.game.add.text(230, 140, "", { fontSize: "36px", fill: "#fff" });
        this.loseText = this.game.add.text(230, 140, "", { fontSize: "36px", fill: "#fff" });
        this.loseHint = this.game.add.text(190, 230, "", { fontSize: "24px", fill: "#fff" });
        
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.cursors["d"] = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
        this.cursors["r"] = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        //this.game.time.events.add(1250, this.sendExitOrder, this);
        //this.game.time.events.add(7000, this.sendAttackOrder, this);
        
        this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;
        
        // Ghosts
        // debugger;
        this.blinky = new Ghost(this, "monster1", "blinky", {x:8, y:3}, Phaser.LEFT, {x:2, y:1}, {x:8, y:1}, {x:8, y:3});
        this.pinky = new Ghost(this, "monster2", "pinky", {x:8, y:1}, Phaser.RIGHT, {x:14, y:1}, {x:8, y:1}, {x:8, y:3});
        this.inky = new Ghost(this, "monster3", "inky", {x:7, y:1}, Phaser.RIGHT, {x:14, y:17}, {x:8, y:1}, {x:8, y:3});
        this.clyde = new Ghost(this, "monster4", "clyde", {x:9, y:1}, Phaser.LEFT, {x:2, y:17}, {x:8, y:1}, {x:8, y:3});
        this.ghosts.push(this.clyde, this.pinky, this.inky, this.blinky);
        
        this.gimeMeExitOrder(this.pinky);
        this.sound.playBgm();
        console.log("bgm play")
    },

    update: function () {
        this.scoreText.text = "Score: " + this.score;
        if (this.gameWin === true) {
            this.winText.text = "You Win!";
        } else {
            this.winText.text = "";
        }
        if (this.gameOver === true) {
            this.loseText.text = "You Lose!";
            this.loseHint.text = "Press Enter to restart.";
        } else {
            this.loseText.text = "";
            this.loseHint.text = "";
        }
        
        if (!this.pacman.isDead) {
            for (var i=0; i<this.ghosts.length; i++) {
                if (this.ghosts[i].mode !== this.ghosts[i].RETURNING_HOME) {
                    this.physics.arcade.overlap(this.pacman.sprite, this.ghosts[i].ghost, this.dogEatsDog, null, this);
                }
            }

            if (this.TOTAL_KEYS - this.numKeys === 1 && !this.isInkyOut) {
                this.isInkyOut = true;
                this.sendExitOrder(this.inky);
            }
            
            if (this.TOTAL_KEYS - this.numKeys === 2 && !this.isClydeOut) {
                this.isClydeOut = true;
                this.sendExitOrder(this.clyde);
            }

            if (this.TIME_MODES[this.currentMode].time !== -1 && !this.isPaused && this.changeModeTimer < this.time.time) {
                this.currentMode++;
                this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;
                if (this.TIME_MODES[this.currentMode].mode === "chase") {
                    this.sendAttackOrder();
                } else {
                    this.sendScatterOrder();
                }
                console.log("new mode:", this.TIME_MODES[this.currentMode].mode, this.TIME_MODES[this.currentMode].time);
            }
            if (this.isPaused && this.changeModeTimer < this.time.time) {
                this.changeModeTimer = this.time.time + this.remainingTime;
                this.isPaused = false;
                this.pacman.sprite.play('munch');
                if (this.TIME_MODES[this.currentMode].mode === "chase") {
                    this.sendAttackOrder();
                } else {
                    this.sendScatterOrder();
                }
                this.sound.playBgm();
                this.killCombo = 0;
                console.log("new mode:", this.TIME_MODES[this.currentMode].mode, this.TIME_MODES[this.currentMode].time);
            }
        }

        this.pacman.update();
        this.updateLife();
		this.updateGhosts();
        for (var i=0; i< this.ghosts.length; i++)
            console.log(this.ghosts[i].name, this.ghosts[i].currentDir, this.ghosts[i].mode);

        this.checkKeys();
        this.checkMouse();
        

        if (this.score >= 6000) {
            this.pacman.life++;
            this.score -= 6000;
            if (this.pacman.life > 3) {
                this.pacman.life = 3;
            }
        }

        if ((this.gameOver === true || this.gameWin === true) && this.cursors.r.isDown)
            this.newGame();
    },
    
    enterFrightenedMode: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].enterFrightenedMode();
        }
        if (!this.isPaused) {
            this.remainingTime = this.changeModeTimer - this.time.time;
        }
        this.changeModeTimer = this.time.time + this.FRIGHTENED_MODE_TIME;
        this.isPaused = true;
    },
    
    /* isSpecialTile: function(tile) {
        for (var q=0; q<this.SPECIAL_TILES.length; q++) {
            if (tile.x === this.SPECIAL_TILES[q].x && tile.y === this.SPECIAL_TILES[q].y) {
                return true;
            } 
        }
        return false;
    }, */
    
    updateGhosts: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].update();
        }
    },
    
    render: function() {
        if (this.DEBUG_ON) {
            for (var i=0; i<this.ghosts.length; i++) {
                var color = "rgba(0, 255, 255, 0.6)";
                switch (this.ghosts[i].name) {
                    case "blinky":
                        color = "rgba(255, 0, 0, 0.6";
                        break;
                    case "pinky":
                        color = "rgba(255, 105, 180, 0.6";
                        break;
                    case "clyde":
                        color = "rgba(255, 165, 0, 0.6";
                        break;
                }
                if (this.ghosts[i].ghostDestination) {
                    var x = this.game.math.snapToFloor(Math.floor(this.ghosts[i].ghostDestination.x), this.gridsize);
                    var y = this.game.math.snapToFloor(Math.floor(this.ghosts[i].ghostDestination.y), this.gridsize);
                    this.game.debug.geom(new Phaser.Rectangle(x, y, 16, 16), color);
                }
                this.game.debug.body(this.ghosts[i].ghost);
                this.game.debug.body(this.pacman.sprite);
            }
            if (this.debugPosition) {
                this.game.debug.geom(new Phaser.Rectangle(this.debugPosition.x, this.debugPosition.y, 16, 16), "#00ff00");
            }
        } else {
            this.game.debug.reset();
        }

    },
    
    sendAttackOrder: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].attack();
        }
    },
    
    sendExitOrder: function(ghost) {
        if (ghost.mode === ghost.AT_HOME)
            ghost.mode = ghost.EXIT_HOME;
    },
    
    sendScatterOrder: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].scatter();
        }
    },

    updateLife: function() {
        for (var i = this.pacman.life; i < 3; i++) {
            var image = this.livesImage[i];
            if (image) {
                image.alpha = 0;
            }
        }
    },

    respawn: function() {
        this.currentMode = 0;
        this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;
        this.isPaused = false;
        this.remainingTime = 0;
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].respawn();
        }
        this.pacman.respawn();
    },

    checkKeys: function () {
        this.pacman.checkKeys(this.cursors);

        if (this.lastKeyPressed < this.time.time) {
            if (this.cursors.d.isDown) {
                this.DEBUG_ON = (!this.DEBUG_ON);
                this.lastKeyPressed = this.time.time + this.KEY_COOLING_DOWN_TIME;
            }
        }
    },

    checkMouse: function() {
        if (this.input.mousePointer.isDown) {
            var x = this.game.math.snapToFloor(Math.floor(this.input.x), this.gridsize) / this.gridsize;
            var y = this.game.math.snapToFloor(Math.floor(this.input.y), this.gridsize) / this.gridsize;
            this.debugPosition = new Phaser.Point(x * this.gridsize, y * this.gridsize);
        }
    },

    dogEatsDog: function(pacman, ghost) {
        if (Phaser.Math.distance(pacman.x, pacman.y, ghost.x, ghost.y) < 25) {
            if (this[ghost.name].mode === this[ghost.name].RANDOM) {
                this.sound.playKillEnemy();
                this[ghost.name].mode = this[ghost.name].RETURNING_HOME;
                this[ghost.name].ghostDestination = new Phaser.Point(14 * this.gridsize, 14 * this.gridsize);
                switch(this.killCombo++) {
                    case 0:
                        this.score += 200;
                        break;
                    case 1:
                        this.score += 400;
                        break;
                    case 2:
                        this.score += 800;
                        break;
                    case 3:
                        this.score += 1600;
                        break;
                }
            } else {
                this.killPacman();
                this.lastDieTime = this.time.time;
            }
        }
    },

    checkDieTime: function() {
        return this.lastDieTime + 2000 <= this.time.time;
    },

    getCurrentMode: function() {
        if (this.TIME_MODES[this.currentMode].mode === "scatter") {
            return "scatter";
        } else {
            return "chase";
        }
    },

    gimeMeExitOrder: function(ghost) {
        this.game.time.events.add(Math.random() * 3000, this.sendExitOrder, this, ghost);
    },

    killPacman: function() {
        this.pacman.isDead = true;
        this.pacman.life --;
        this.sound.playPlayerDeath();
        this.stopGhosts();
        this.game.time.events.add(1000, function() {
            if(this.pacman.life <= 0) {
                this.gameOver = true;
            }
            else {
                this.respawn();
            }
        }, this, null);
    },

    stopGhosts: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].mode = this.ghosts[i].STOP;
        }
    },

    winGame: function() {
        this.gameWin = true;
        this.score += 500;
        this.stopGhosts();
        this.pacman.move(Phaser.NONE);
        this.sound.playLevelComplete();
    },

    newGame: function() {
        this.gameOver = false;
        this.pacman.life=3;
        this.score=0;
        this.currentMode = 0;
        this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;
        this.isPaused = false;
        this.isClydeOut = false;
        this.isInkyOut = false;
        this.gameOver = false;
        this.gameWin = false;
        this.remainingTime = 0;
        this.keys.callAll('kill');
        this.keys.getChildAt(0).revive();
        this.pills.callAll('revive');
        this.treasure.callAll('revive');
        this.treasure.callAll('play', null, 'lock');
        this.numKeys = 4;
        this.numPills = 2;
        for (let i = 0; i < this.pacman.life; i++) {
            let image = this.livesImage[i];
            if(image) {
                image.alpha=1;
            }
        }
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].restart();
        }
        this.gimeMeExitOrder(this.pinky);
        this.pacman.respawn();
        this.sound.playBgm();
    }
};

game.state.add('Game', PacmanGame, true);