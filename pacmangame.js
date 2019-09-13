var game = new Phaser.Game(1216/2, 1344/2, Phaser.AUTO, "game");

var PacmanGame = function (game) {    
    this.map = null;
    this.layer = null;
    this.item = null;
    
    this.numKeys = 4;
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
    this.gameOver = false;
    this.gameWin = false;
    this.ghosts = [];
    this.livesImage = [];

    this.safetile = [12, 13, 14, 21, 22, 23, 30, 31, 32, 37, 46, 62, 65, 66, 71, 75, 76];
    this.gridsize = 32;
    this.threshold = 3;
    
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
    this.dieTimer = 0;
    this.currentMode = 0;
    this.isPaused = false;
    this.FRIGHTENED_MODE_TIME = 7000;
    
    this.ORIGINAL_OVERFLOW_ERROR_ON = false;
    this.DEBUG_ON = false;
    
    this.KEY_COOLING_DOWN_TIME = 250;
    this.dieTimer = 0;
    this.lastKeyPressed = 0;
    
    this.game = game;
    this.sounds;
    this.killCombo = 0;
};

PacmanGame.prototype = {

    init: function () {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        // this.scale.pageAlignVertically = true;

        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas); // full retro mode, i guess ;)

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.sound = new Sounds(this);
    },

    preload: function () {
        this.load.image('tiles', 'assets/tile32.png');
        this.load.image("lifecounter", "assets/heart32.png");
        this.load.image('key_yellow', 'assets/pickups/key_yellow.png');
        this.load.image('key_red', 'assets/pickups/key_red.png');
        this.load.image('key_blue', 'assets/pickups/key_blue.png');
        this.load.image('key_green', 'assets/pickups/key_green.png');
        this.load.image('sword', 'assets/pickups/sword.png')
        this.load.tilemap('map', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.spritesheet('hero', 'assets/hero/pax.png', 32, 32);
        this.load.spritesheet('monster', 'assets/monsters/zombie_sheet.png', 32, 32);
        this.sound.loadAllSounds();
    },

    create: function () {
        this.sound.createAllInstances();
        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('tile32', 'tiles');

        this.layer = this.map.createLayer('background');
        this.item = this.map.createLayer('items');

        this.keys = this.add.physicsGroup();
        this.key1 = this.map.createFromTiles(42, 22, 'key_yellow', this.item, this.keys);
        this.key2 = this.map.createFromTiles(2, 22, 'key_red', this.item, this.keys);
        this.key3 = this.map.createFromTiles(38, 21, 'key_blue', this.item, this.keys);
        this.key4 = this.map.createFromTiles(6, 22, 'key_green', this.item, this.keys);
        this.TOTAL_KEYS = this.numKeys;
        for (var i = 1; i < this.numKeys; i++) {
            this.keys.children[i].kill();
        }
        
        this.pills = this.add.physicsGroup();
        this.numPills = this.map.createFromTiles([59, 80], [13, 31], "sword", this.item, this.pills);

        //  The keys will need to be offset by 12px to put them back in the middle of the grid
        // this.keys.setAll('x', 12, false, false, 1);
        // this.keys.setAll('y', 12, false, false, 1);

        //  Pacman should collide with everything except the safe tile
        this.map.setCollisionByExclusion(this.safetile, true, this.layer);
        this.map.setCollisionByExclusion([35], true, this.item);

		// Our hero
        this.pacman = new Pacman(this, "hero");
        for (var i =  0; i < this.pacman.life; i++) {
            this.livesImage.push(this.add.image(490 + (i * 32), 400, 'lifecounter'));
        }

        // Score and debug texts
        this.scoreText = game.add.text(20, 272, "Score: " + this.score, { fontSize: "24px", fill: "#fff" });
        this.winText = game.add.text(230, 140, "", { fontSize: "36px", fill: "#fff" });
        this.loseText = game.add.text(230, 140, "", { fontSize: "36px", fill: "#fff" });
        this.loseHint = game.add.text(190, 230, "", { fontSize: "24px", fill: "#fff" });
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors["d"] = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.cursors["r"] = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        //this.game.time.events.add(1250, this.sendExitOrder, this);
        //this.game.time.events.add(7000, this.sendAttackOrder, this);
        
        this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;
        
        // Ghosts
        // debugger;
        this.blinky = new Ghost(this, "monster", "blinky", {x:9, y:8}, Phaser.RIGHT);
        this.pinky = new Ghost(this, "monster", "pinky", {x:9, y:10}, Phaser.LEFT);
        this.inky = new Ghost(this, "monster", "inky", {x:8, y:10}, Phaser.LEFT);
        this.clyde = new Ghost(this, "monster", "clyde", {x:10, y:10}, Phaser.RIGHT);
        this.ghosts.push(this.clyde, this.pinky, this.inky, this.blinky);
        
        this.gimeMeExitOrder(this.pinky);
        this.sound.playBgm();
    },

    update: function () {
        this.scoreText.text = "Score: " + this.score;
        if (this.gameWin == true) {
            this.winText.text = "You Win!";
        } else {
            this.winText.text = "";
        }
        if (this.gameOver == true) {
            this.loseText.text = "You Lose!";
            this.loseHint.text = "Press Enter to restart.";
        } else {
            this.loseText.text = "";
            this.loseHint.text = "";
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
        // console.log("clyde" + " " + this.ghosts[0].mode);
        // console.log("pinky" + " " + this.ghosts[1].mode);
        // console.log("inky" + " " + this.ghosts[2].mode);
        // console.log("blinky" + " " + this.ghosts[3].mode);
		this.updateGhosts();
        
        this.checkKeys();
        this.checkMouse();
        

        if (this.score >= 6000) {
            this.pacman.life++;
            this.score -= 6000;
            if (this.pacman.life > 3) {
                this.pacman.life = 3;
            }
        }

        this.updateLife();

        if ((this.gameOver == true || this.gameWin == true) && this.cursors.r.isDown)
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
        for (var i = 2; i > /*this.pacman.life - 1 */0; i--) {
            var image = this.livesImage[i];
            if (image) {
                if (i > this.pacman.life - 1)
                    image.alpha = 0;
                else
                    image.alpha = 1;
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
        this.sound.playBgm();
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
        if (Phaser.Math.distance(pacman.x, pacman.y, ghost.x, ghost.y) < 25) {
            if (this[ghost.name].mode === this[ghost.name].RANDOM) {
                this.sound.playKillEnemy();
                this[ghost.name].mode = this[ghost.name].RETURNING_HOME;
                this[ghost.name].ghostDestination = new Phaser.Point(14 * this.gridsize, 14 * this.gridsize);
                switch(this.killCombo++) {
                    case 0:
                        this.score += 200;
                        console.log("//////////////////////////////   200");
                        break;
                    case 1:
                        this.score += 400;
                        console.log("//////////////////////////////   400");
                        break;
                    case 2:
                        this.score += 800;
                        console.log("//////////////////////////////   800");
                        break;
                    case 3:
                        this.score += 1600;
                        console.log("//////////////////////////////   1600");
                        break;
                }
            } else {
                this.killPacman();
                this.lastDieTime = this.time.time;
            }
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
        this.sound.playPlayerDeath();
        this.stopGhosts();
        // console.log("wait a sec");
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