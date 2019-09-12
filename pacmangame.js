var game = new Phaser.Game(1216/2, 1344/2, Phaser.AUTO, "game");

var PacmanGame = function (game) {    
    this.map = null;
    this.layer = null;
    this.item = null;
    
    this.numKeys = 0;
    this.TOTAL_KEYS = 0;
    this.score = 0;
    this.scoreText = null;
    
    this.pacman = null; 
    this.clyde = null;
    this.pinky = null;
    this.inky = null;
    this.blinky = null;
    this.isInkyOut = false;
    this.isClydeOut = false;
    this.ghosts = [];
    this.livesImage = [];

    this.safetile = [12, 13, 14, 21, 22, 23, 30, 31, 32, 37, 46, 62, 65, 66, 71, 75, 76];
    this.gridsize = 32;
    this.threshold = 3;
    
    this.SPECIAL_TILES = [
        { x: 12, y: 11 },
        { x: 15, y: 11 },
        { x: 12, y: 23 },
        { x: 15, y: 23 }
    ];
    
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
    this.dieTimer = 0;
    this.currentMode = 0;
    this.isPaused = false;
    this.FRIGHTENED_MODE_TIME = 7000;
    
    this.ORIGINAL_OVERFLOW_ERROR_ON = true;
    this.DEBUG_ON = true;
    
    this.KEY_COOLING_DOWN_TIME = 250;
    this.dieTimer = 0;
    this.lastKeyPressed = 0;
    
    this.game = game;
};

PacmanGame.prototype = {

    init: function () {
        // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // this.scale.pageAlignHorizontally = true;
        // this.scale.pageAlignVertically = true;

        // Phaser.Canvas.setImageRenderingCrisp(this.game.canvas); // full retro mode, i guess ;)

        this.physics.startSystem(Phaser.Physics.ARCADE);
    },

    preload: function () {
        this.load.image('dot', 'assets/dot.png');
        this.load.image("pill", "assets/pill16.png");
        this.load.image('tiles', 'assets/tile32.png');
        this.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);
        this.load.spritesheet("ghosts", "assets/ghosts32.png", 32, 32);
        this.load.image("lifecounter", "assets/heart32.png");
        this.load.tilemap('map', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);

    },

    create: function () {
        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('tile32', 'tiles');

        this.layer = this.map.createLayer('background');
        this.item = this.map.createLayer('items');

        this.keys = this.add.physicsGroup();
        this.numKeys = this.map.createFromTiles([2, 6, 38, 42], [22, 22, 21, 22], 'dot', this.item, this.keys);
        this.TOTAL_KEYS = this.numKeys;
        
        this.pills = this.add.physicsGroup();
        this.numPills = this.map.createFromTiles(80, 22, "pill", this.item, this.pills);

        //  The keys will need to be offset by 12px to put them back in the middle of the grid
        this.keys.setAll('x', 12, false, false, 1);
        this.keys.setAll('y', 12, false, false, 1);

        //  Pacman should collide with everything except the safe tile
        this.map.setCollisionByExclusion(this.safetile, true, this.layer);
        this.map.setCollisionByExclusion([35], true, this.item);

		// Our hero
        this.pacman = new Pacman(this, "pacman");
        for (var i =  0; i < this.pacman.life; i++) {
            this.livesImage.push(this.add.image(490 + (i * 32), 400, 'lifecounter'));
        }

        // Score and debug texts
        this.scoreText = game.add.text(8, 272, "Score: " + this.score, { fontSize: "16px", fill: "#fff" });
        this.debugText = game.add.text(375, 260, "", { fontSize: "12px", fill: "#fff" });
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors["d"] = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.cursors["r"] = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        //this.game.time.events.add(1250, this.sendExitOrder, this);
        //this.game.time.events.add(7000, this.sendAttackOrder, this);
        
        this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;
        
        // Ghosts
        // debugger;
        this.blinky = new Ghost(this, "ghosts", "blinky", {x:9, y:8}, Phaser.RIGHT);
        this.pinky = new Ghost(this, "ghosts", "pinky", {x:9, y:10}, Phaser.LEFT);
        this.inky = new Ghost(this, "ghosts", "inky", {x:8, y:10}, Phaser.LEFT);
        this.clyde = new Ghost(this, "ghosts", "clyde", {x:10, y:10}, Phaser.RIGHT);
        this.ghosts.push(this.clyde, this.pinky, this.inky, this.blinky);
        
        this.gimeMeExitOrder(this.pinky);
    },

    update: function () {
        this.scoreText.text = "Score: " + this.score;
        if (this.DEBUG_ON) {
            this.debugText.text = "Debug ON";
        } else {
            this.debugText.text = "";
        }
        
        if (!this.pacman.isDead) {
            for (var i=0; i<this.ghosts.length; i++) {
                if (this.ghosts[i].mode !== this.ghosts[i].RETURNING_HOME) {
                    this.physics.arcade.overlap(this.pacman.sprite, this.ghosts[i].ghost, this.dogEatsDog, this.checkDieTime, this);
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
                // console.log("new mode:", this.TIME_MODES[this.currentMode].mode, this.TIME_MODES[this.currentMode].time);
            }
            if (this.isPaused && this.changeModeTimer < this.time.time) {
                this.changeModeTimer = this.time.time + this.remainingTime;
                this.isPaused = false;
                if (this.TIME_MODES[this.currentMode].mode === "chase") {
                    this.sendAttackOrder();
                } else {
                    this.sendScatterOrder();
                }
                // console.log("new mode:", this.TIME_MODES[this.currentMode].mode, this.TIME_MODES[this.currentMode].time);
            }
        }
        
        this.pacman.update();
        // console.log("ghost update");
		this.updateGhosts();
        
        this.checkKeys();
        this.checkMouse();

        this.updateLife();

        if (this.gameOver == true && this.cursors.r.isDown)
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
        // console.log(this.remainingTime);
    },
    
    isSpecialTile: function(tile) {
        for (var q=0; q<this.SPECIAL_TILES.length; q++) {
            if (tile.x === this.SPECIAL_TILES[q].x && tile.y === this.SPECIAL_TILES[q].y) {
                return true;
            } 
        }
        return false;
    },
    
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
        ghost.mode = this.clyde.EXIT_HOME;
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
                this.DEBUG_ON = (this.DEBUG_ON) ? false : true;
                this.lastKeyPressed = this.time.time + this.KEY_COOLING_DOWN_TIME;
            }
        }
    },

    checkMouse: function() {
        if (this.input.mousePointer.isDown) {
            var x = this.game.math.snapToFloor(Math.floor(this.input.x), this.gridsize) / this.gridsize;
            var y = this.game.math.snapToFloor(Math.floor(this.input.y), this.gridsize) / this.gridsize;
            this.debugPosition = new Phaser.Point(x * this.gridsize, y * this.gridsize);
            console.log(x, y);
        }
    },

    dogEatsDog: function(pacman, ghost) {
        if (this.isPaused) {
            this[ghost.name].mode = this[ghost.name].RETURNING_HOME;
            this[ghost.name].ghostDestination = new Phaser.Point(14 * this.gridsize, 14 * this.gridsize);
            this.score += 10;
        } else {
            this.killPacman();
            this.lastDieTime = this.time.time;
        }
    },

    checkDieTime: function() {
        if (this.lastDieTime + 2000 > this.time.time)
            return false;
        else return true;
    },

    getCurrentMode: function() {
        if (!this.isPaused) {
            if (this.TIME_MODES[this.currentMode].mode === "scatter") {
                return "scatter";
            } else {
                return "chase";
            }
        } else {
            return "random";
        }
    },

    gimeMeExitOrder: function(ghost) {
        this.game.time.events.add(Math.random() * 3000, this.sendExitOrder, this, ghost);
    },

    killPacman: function() {
        this.pacman.isDead = true;
        this.pacman.life --;
        this.stopGhosts();
        // console.log("wait a sec");
        this.game.time.events.add(1500, function() {
            if(this.pacman.life < 0) {
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

    newGame: function() {
        this.gameOver = false;
        this.pacman.life=3;
        this.score=0;
        this.currentMode = 0;
        this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;
        this.isPaused = false;
        this.isClydeOut = false;
        this.isInkyOut = false;
        this.remainingTime = 0;
        this.keys.callAll('revive');
        this.pills.callAll('revive');
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
    }

};

game.state.add('Game', PacmanGame, true);
