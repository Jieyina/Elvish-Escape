var PacmanGame = function (game) {
    this.life = 3;
    this.level = 1;
    this.game = game;
    this.gameSound = new Sounds(this);
};

PacmanGame.prototype = {
    init: function (score, life, level) {
        this.map = null;
        this.layer = null;
        this.item = null;
        this.numKeys = 4;
        this.mode = "normal";
        this.TOTAL_KEYS = 0;
        if (level >= 1) {
            this.level = level;
        }
        if (this.level > 1)
        {
            this.score = score;
            this.life = life;
        } else {
            this.score = 0;
            this.life = 3;
        }
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
        this.gridsize = 32;
        this.threshold = 3;
        this.killCombo = 0;
        this.lifeBack = 1;
        this.treasureUnlocked = [];
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

        switch (this.level)
        {
            case 1:
                this.pacPos = {x:8, y:13};
                this.ghostSpeed = 112;
                this.ghostScatterSpeed = 105;
                this.ghostFrightenedSpeed = 75;
                this.cruiseSpeed = 120;
                this.ElroySpeed = 128;
                this.goalPos = {x: 8, y:12};
                this.blinkyPos = {x:8, y:7};
                this.blinkyScatterPos = {x:1, y:1};
                this.pinkyPos = {x:8, y:9};
                this.pinkyScatterPos = {x:15, y:1};
                this.inkyPos = {x:7, y:9};
                this.inkyScatterPos = {x:15, y:17};
                this.clydePos = {x:9, y:9};
                this.clydeScatterPos = {x:1, y:17};
                this.returnDes = {x:8, y:9};
                this.exitDes = {x:8, y:7};
                this.safetile = [13, 14, 15, 23, 25, 33, 34, 35, 24, 83, 84, 41, 51, 72, 78];
                this.SPECIAL_TILES = [
                    { x: 7, y: 3 },
                    { x: 9, y: 3 },
                ];
                break;

            case 2:
                this.pacPos = {x:8, y:13};
                this.ghostSpeed = 128;
                this.ghostScatterSpeed = 120;
                this.ghostFrightenedSpeed = 85;
                this.cruiseSpeed = 135;
                this.ElroySpeed = 140;
                this.goalPos = {x: 8, y:11};
                this.blinkyPos = {x:8, y:3};
                this.blinkyScatterPos = {x:2, y:1};
                this.pinkyPos = {x:8, y:1};
                this.pinkyScatterPos = {x:14, y:1};
                this.inkyPos = {x:7, y:1};
                this.inkyScatterPos = {x:14, y:17};
                this.clydePos = {x:9, y:1};
                this.clydeScatterPos = {x:2, y:17};
                this.returnDes = {x:8, y:1};
                this.exitDes = {x:8, y:3};
                this.safetile = [14, 51, 41, 24, 86, 85, 23, 25, 34, 72];
                this.SPECIAL_TILES = [];
                break;

            case 3:
                this.pacPos = {x:8, y:10};
                this.ghostSpeed = 135;
                this.ghostScatterSpeed = 130;
                this.ghostFrightenedSpeed = 90;
                this.cruiseSpeed = 150;
                this.ElroySpeed = 158;
                this.goalPos = {x:8, y:1};
                this.blinkyPos = {x:8, y:15};
                this.blinkyScatterPos = {x:1, y:1};
                this.pinkyPos = {x:8, y:17};
                this.pinkyScatterPos = {x:15, y:1};
                this.inkyPos = {x:7, y:17};
                this.inkyScatterPos = {x:1, y:17};
                this.clydePos = {x:9, y:17};
                this.clydeScatterPos = {x:15, y:17};
                this.returnDes = {x:8, y:17};
                this.exitDes = {x:8, y:15};
                this.safetile = [13, 14, 15, 23, 25, 33, 34, 35, 24, 81, 82, 51, 41, 78];
                this.SPECIAL_TILES = [];
                break;
        }
    },

    preload: function() {
        this.gameSound.loadAllSounds();
    },

    create: function () {
        this.gameSound.createAllInstances();

        switch (this.level)
        {
            case 1:
                this.map = this.add.tilemap('map1');
                this.map.addTilesetImage('Tile_Level1', 'tiles1');
                this.layer = this.map.createLayer('ground');
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
                break;

            case 2:
                this.map = this.add.tilemap('map2');
                this.map.addTilesetImage('Tile_Level2', 'tiles2');

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
                break;

            case 3:
                this.map = this.add.tilemap('map3');
                this.map.addTilesetImage('Tile_Level3', 'tiles3');
                this.layer = this.map.createLayer('ground');
                this.grass = this.map.createLayer('grass');

                this.grasses = this.add.group();
                this.map.createFromTiles(90, -1, 'grass1', this.grass, this.grasses);
                this.grasses.forEach(function(child) {
                    child.animations.add('wave', [0, 1, 2, 3, 4, 5], 15, true);
                    child.play('wave');}, this);
                break;
        }

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
            child.animations.add('lock', [0], 8, true);
            child.animations.add('unlock', [0, 1, 2, 3, 4, 5], 8, false);
            child.kill();}, this);

        this.door = this.add.group();
        this.map.createFromTiles(38, -1, 'door', this.item, this.door);
        this.door.children[0].animations.add('door-closed', [0], 15, true);
        this.door.children[0].animations.add('door-opening', [1, 2, 3, 4], 15, false);
        this.door.children[0].animations.add('door-blinking', [5, 6, 7, 8], 15, true);
        this.door.children[0].play('door-closed');

        //  Pacman should collide with everything except the safe tile
        this.map.setCollisionByExclusion(this.safetile, true, this.layer);
        this.map.setCollisionByExclusion([38], true, this.item);

        this.blinky = new Ghost(this, "monster1", "blinky", 0, this.blinkyPos, Phaser.LEFT, this.blinkyScatterPos, this.returnDes, this.exitDes);
        this.pinky = new Ghost(this, "monster2", "pinky", 1, this.pinkyPos, Phaser.RIGHT, this.pinkyScatterPos, this.returnDes, this.exitDes);
        this.inky = new Ghost(this, "monster3", "inky", 2, this.inkyPos, Phaser.RIGHT, this.inkyScatterPos, this.returnDes, this.exitDes);
        this.clyde = new Ghost(this, "monster4", "clyde", 3, this.clydePos, Phaser.LEFT, this.clydeScatterPos, this.returnDes, this.exitDes);
        this.ghosts.push(this.blinky, this.pinky, this.inky, this.clyde);

        // Our hero
        this.pacman = new Pacman(this, "hero", this.pacPos);
        for (var i =  0; i < this.life; i++) {
            this.livesImage.push(this.add.image(448 + (i * 32), 575, 'lifecounter'));
        }

        // Score and debug texts
        this.scoreText = this.game.add.text(35, 3, "Score: " + this.score, { fontSize: "24px", fill: "#fff" });
        this.winText = this.game.add.text(190, 140, "", { fontSize: "36px", fill: "#fff" });
        this.winHint = this.game.add.text(150, 230, "", { fontSize: "24px", fill: "#fff" });
        this.loseText = this.game.add.text(190, 140, "", { fontSize: "36px", fill: "#fff" });
        this.loseHint = this.game.add.text(155, 230, "", { fontSize: "24px", fill: "#fff" });
        this.bonusHint = this.game.add.text(200, 580, "", { fontSize: "12px", fill: "#fff" });
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.cursors["d"] = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
        this.cursors["r"] = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.cursors["s"] = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        this.changeModeTimer = this.time.time + this.TIME_MODES[this.currentMode].time;
        this.gimeMeExitOrder(this.pinky);
        this.gameSound.playBgm();
    },

    update: function () {
        this.scoreText.text = "Score: " + this.score;
        if (this.gameWin === true && this.gameOver === false) {
            this.winText.text = "You Win!";
            this.winHint.text = "Press Enter to continue.";
        } else {
            this.winText.text = "";
            this.winHint.text = "";
        }
        if (this.gameOver === true && this.gameWin === false) {
            this.loseText.text = "You Lose!";
            this.loseHint.text = "Press Enter to continue.";
            this.bonusHint.text = "Or press Space to revenge."
        } else {
            this.loseText.text = "";
            this.loseHint.text = "";
            this.bonusHint.text = "";
        }
        
        if (!this.pacman.isDead && !this.gameWin) {
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
                this.killCombo = 0;
                this.pacman.sprite.play('munch');
                if (this.TIME_MODES[this.currentMode].mode === "chase") {
                    this.sendAttackOrder();
                } else {
                    this.sendScatterOrder();
                }
                this.gameSound.playBgm();
                console.log("new mode:", this.TIME_MODES[this.currentMode].mode, this.TIME_MODES[this.currentMode].time);
            }
        }

        this.checkKeys();
        this.checkMouse();

        this.pacman.update();
		this.updateGhosts();
		/*
        for (var i=0; i< this.ghosts.length; i++)
            console.log(this.ghosts[i].name, this.ghosts[i].currentDir, this.ghosts[i].mode);
		 */

        if (this.score > 6000 * this.lifeBack) {
            this.life++;
            if (this.life > 3) {
                this.life = 3;
            }
            this.lifeBack++;
        }
        this.updateLife();

        if (this.gameOver === true && this.cursors.r.isDown)
        {
            this.gameSound.clear();
            this.game.state.start("GameOver", true, false, this.score);
        }
        if (this.gameOver === true && this.cursors.s.isDown)
        {
            this.gameSound.clear();
            this.game.state.start("Revenge", true, false, this.score, "lose");
        }
        if (this.gameWin === true && this.cursors.r.isDown)
        {
            if (this.level < 3)
            {
                this.gameSound.clear();
                this.game.state.restart(true, false, this.score, this.life, this.level + 1);
            }
            else if (this.level === 3)
            {
                this.gameSound.clear();
                this.game.state.start("Revenge", true, false, this.score, "win");
            }
        }
    },
    
    enterFrightenedMode: function() {
        if (!this.isPaused) {
            this.remainingTime = this.changeModeTimer - this.time.time;
        }
        this.changeModeTimer = this.time.time + this.FRIGHTENED_MODE_TIME;
        this.isPaused = true;
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
        for (var i = this.life; i < 3; i++) {
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
        this.gameSound.playBgm();
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
        if (Phaser.Math.distance(pacman.x, pacman.y, ghost.x, ghost.y) < 20) {
            if (this[ghost.name].mode === this[ghost.name].RANDOM) {
                this[ghost.name].slash.play("slash");
                this.gameSound.playKillEnemy();
                this[ghost.name].mode = this[ghost.name].RETURNING_HOME;
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
            } else if (this[ghost.name].mode !== this[ghost.name].RETURNING_HOME) {
                this.killPacman();
            }
        }
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
        if (!this.pacman.isDead)
        {
            this.pacman.isDead = true;
            this.life --;
            this.gameSound.playPlayerDeath();
            this.stopGhosts();
            this.game.time.events.add(3000, function() {
                if(this.life <= 0) {
                    this.gameOver = true;
                }
                else {
                    this.respawn();
                }
            }, this, null);
        }
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
        this.gameSound.playLevelComplete();
        this.door.children[0].play('door-opening');
    },

    isSpecialTile: function(tile) {
        if (this.SPECIAL_TILES.length > 1)
        {
            for (var q=0; q<this.SPECIAL_TILES.length; q++) {
                if (tile.x === this.SPECIAL_TILES[q].x && tile.y === this.SPECIAL_TILES[q].y) {
                    return true;
                }
            }
        }
        return false;
    }
};