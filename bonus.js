var Bonus = function (game) {
    this.game = game;
    this.gameSound = new Sounds(this);
};

Bonus.prototype = {
    init: function (score, result) {
        this.map = null;
        this.layer = null;

        this.score = score;
        this.result = result;
        this.mode = "bonus";

        this.pacman = null;
        this.gameOver = false;
        this.gameWin = false;
        this.bonusComplete = false;
        this.isPaused = true;
        this.ghosts = [];
        this.gridsize = 32;
        this.threshold = 3;
        this.killCombo = 0;
        this.isPaused = false;
        this.DEBUG_ON = false;
        this.KEY_COOLING_DOWN_TIME = 250;
        this.lastKeyPressed = 0;

        this.pacPos = {x:8, y:6};
        this.ghostSpeed = 150;
        this.ghostScatterSpeed = 135;
        this.ghostFrightenedSpeed = 95;
        this.cruiseSpeed = 150;
        this.ElroySpeed = 158;
        this.goalPos = {x:8, y:11};
        this.blinkyPos = [{x:4, y:4}, {x:12, y:4}, {x:3, y:9}, {x:14, y:11}, {x:8, y:12}, {x:13, y:13}, {x:3, y:15}];
        this.blinkyScatterPos = {x:2, y:1};
        this.pinkyPos = [{x:2, y:1}, {x:14, y:1}, {x:1, y:13}, {x:4, y:13}, {x:15, y:13}, {x:5, y:17}, {x:13, y:17}];
        this.pinkyScatterPos = {x:14, y:1};
        this.inkyPos = [{x:1, y:3}, {x:15, y:3}, {x:7, y:4}, {x:9, y:4}, {x:5, y:10}, {x:11, y:10}, {x:8, y:15}];
        this.inkyScatterPos = {x:14, y:17};
        this.clydePos = [{x:1, y:6}, {x:5, y:6}, {x:11, y:6}, {x:2, y:11}, {x:1, y:16}, {x:15, y:16}, {x:8, y:8}];
        this.clydeScatterPos = {x:2, y:17};
        this.returnDes = {x:8, y:3};
        this.exitDes = {x:8, y:4};
        this.safetile = [13, 14, 15, 23, 25, 33, 34, 35, 41, 51, 24, 86, 85, 72, 83];
        this.SPECIAL_TILES = [];
    },

    preload: function() {
        this.gameSound.loadAllSounds();
    },

    create: function () {
        this.gameSound.createAllInstances();

        this.map = this.add.tilemap('map4');
        this.map.addTilesetImage('Tile_Level4', 'tiles4');

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

        this.map.setCollisionByExclusion(this.safetile, true, this.layer);

        this.blinky1 = new Ghost(this, "monster1", "blinky", 0, this.blinkyPos[0], Phaser.LEFT, this.blinkyScatterPos, this.returnDes, this.exitDes);
        this.blinky2 = new Ghost(this, "monster1", "blinky", 1, this.blinkyPos[1], Phaser.LEFT, this.blinkyScatterPos, this.returnDes, this.exitDes);
        this.blinky3 = new Ghost(this, "monster1", "blinky", 2, this.blinkyPos[2], Phaser.LEFT, this.blinkyScatterPos, this.returnDes, this.exitDes);
        this.blinky4 = new Ghost(this, "monster1", "blinky", 3, this.blinkyPos[3], Phaser.LEFT, this.blinkyScatterPos, this.returnDes, this.exitDes);
        this.blinky5 = new Ghost(this, "monster1", "blinky", 4, this.blinkyPos[4], Phaser.LEFT, this.blinkyScatterPos, this.returnDes, this.exitDes);
        this.blinky6 = new Ghost(this, "monster1", "blinky", 5, this.blinkyPos[5], Phaser.LEFT, this.blinkyScatterPos, this.returnDes, this.exitDes);
        this.blinky7 = new Ghost(this, "monster1", "blinky", 6, this.blinkyPos[6], Phaser.LEFT, this.blinkyScatterPos, this.returnDes, this.exitDes);
        this.pinky1 = new Ghost(this, "monster2", "pinky", 7, this.pinkyPos[0], Phaser.RIGHT, this.pinkyScatterPos, this.returnDes, this.exitDes);
        this.pinky2 = new Ghost(this, "monster2", "pinky", 8, this.pinkyPos[1], Phaser.RIGHT, this.pinkyScatterPos, this.returnDes, this.exitDes);
        this.pinky3 = new Ghost(this, "monster2", "pinky", 9, this.pinkyPos[2], Phaser.RIGHT, this.pinkyScatterPos, this.returnDes, this.exitDes);
        this.pinky4 = new Ghost(this, "monster2", "pinky", 10, this.pinkyPos[3], Phaser.RIGHT, this.pinkyScatterPos, this.returnDes, this.exitDes);
        this.pinky5 = new Ghost(this, "monster2", "pinky", 11, this.pinkyPos[4], Phaser.RIGHT, this.pinkyScatterPos, this.returnDes, this.exitDes);
        this.pinky6 = new Ghost(this, "monster2", "pinky", 12, this.pinkyPos[5], Phaser.RIGHT, this.pinkyScatterPos, this.returnDes, this.exitDes);
        this.pinky7 = new Ghost(this, "monster2", "pinky", 13, this.pinkyPos[6], Phaser.RIGHT, this.pinkyScatterPos, this.returnDes, this.exitDes);
        this.inky1 = new Ghost(this, "monster3", "inky", 14, this.inkyPos[0], Phaser.RIGHT, this.inkyScatterPos, this.returnDes, this.exitDes);
        this.inky2 = new Ghost(this, "monster3", "inky", 15, this.inkyPos[1], Phaser.RIGHT, this.inkyScatterPos, this.returnDes, this.exitDes);
        this.inky3 = new Ghost(this, "monster3", "inky", 16, this.inkyPos[2], Phaser.RIGHT, this.inkyScatterPos, this.returnDes, this.exitDes);
        this.inky4 = new Ghost(this, "monster3", "inky", 17, this.inkyPos[3], Phaser.RIGHT, this.inkyScatterPos, this.returnDes, this.exitDes);
        this.inky5 = new Ghost(this, "monster3", "inky", 18, this.inkyPos[4], Phaser.RIGHT, this.inkyScatterPos, this.returnDes, this.exitDes);
        this.inky6 = new Ghost(this, "monster3", "inky", 19, this.inkyPos[5], Phaser.RIGHT, this.inkyScatterPos, this.returnDes, this.exitDes);
        this.inky7 = new Ghost(this, "monster3", "inky", 20, this.inkyPos[6], Phaser.RIGHT, this.inkyScatterPos, this.returnDes, this.exitDes);
        this.clyde1 = new Ghost(this, "monster4", "clyde", 21, this.clydePos[0], Phaser.LEFT, this.clydeScatterPos, this.returnDes, this.exitDes);
        this.clyde2 = new Ghost(this, "monster4", "clyde", 22, this.clydePos[1], Phaser.LEFT, this.clydeScatterPos, this.returnDes, this.exitDes);
        this.clyde3 = new Ghost(this, "monster4", "clyde", 23, this.clydePos[2], Phaser.LEFT, this.clydeScatterPos, this.returnDes, this.exitDes);
        this.clyde4 = new Ghost(this, "monster4", "clyde", 24, this.clydePos[3], Phaser.LEFT, this.clydeScatterPos, this.returnDes, this.exitDes);
        this.clyde5 = new Ghost(this, "monster4", "clyde", 25, this.clydePos[4], Phaser.LEFT, this.clydeScatterPos, this.returnDes, this.exitDes);
        this.clyde6 = new Ghost(this, "monster4", "clyde", 26, this.clydePos[5], Phaser.LEFT, this.clydeScatterPos, this.returnDes, this.exitDes);
        this.clyde7 = new Ghost(this, "monster4", "clyde", 27, this.clydePos[6], Phaser.LEFT, this.clydeScatterPos, this.returnDes, this.exitDes);
        this.ghosts.push(this.blinky1, this.blinky2, this.blinky3, this.blinky4, this.blinky5, this.blinky6, this.blinky7,
            this.pinky1, this.pinky2, this.pinky3, this.pinky4, this.pinky5, this.pinky6, this.pinky7,
            this.inky1, this.inky2, this.inky3, this.inky4, this.inky5, this.inky6, this.inky7,
            this.clyde1, this.clyde2, this.clyde3, this.clyde4, this.clyde5, this.clyde6, this.clyde7);

        // Our hero
        this.pacman = new Pacman(this, "hero", this.pacPos);

        this.firework1 = this.game.add.sprite(53, 118, 'firework1', 0);
        this.firework1.animations.add("fire", [0, 1, 2, 3, 4, 5], 15, true);
        this.firework1.play("fire");
        this.firework2 = this.game.add.sprite(337, 140, 'firework2', 0);
        this.firework2.animations.add("fire", [0, 1, 2, 3, 4, 5], 15, true);
        this.firework2.play("fire");
        this.firework3 = this.game.add.sprite(98, 318, 'firework3', 0);
        this.firework3.animations.add("fire", [0, 1, 2, 3, 4, 5], 15, true);
        this.firework3.play("fire");
        this.firework4 = this.game.add.sprite(309, 402, 'firework4', 0);
        this.firework4.animations.add("fire", [0, 1, 2, 3, 4, 5], 15, true);
        this.firework4.play("fire");

        this.slashSprite = this.game.add.sprite(8, 13, 'slash');
        this.slashSprite.animations.add('cut', [0, 1, 2, 3], 12, false);
        this.slashSprite.anchor.x = 0.5;
        this.slashSprite.anchor.y = 0.5;

        // Score and debug texts
        this.scoreText = this.game.add.text(35, 3, "Score: " + this.score, { fontSize: "24px", fill: "#fff" });
        this.winText = this.game.add.text(190, 140, "", { fontSize: "36px", fill: "#fff" });
        this.winHint = this.game.add.text(150, 230, "", { fontSize: "24px", fill: "#fff" });
        this.loseText = this.game.add.text(210, 140, "", { fontSize: "36px", fill: "#fff" });
        this.loseHint = this.game.add.text(150, 230, "", { fontSize: "24px", fill: "#fff" });
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.cursors["d"] = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
        this.cursors["r"] = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        this.startTime = this.time.time;
    },

    update: function () {

        this.scoreText.text = "Score: " + this.score;
        if (this.gameWin === true) {
            this.winText.text = "Time's Up!";
            this.winHint.text = "Press Enter to continue.";
        } else {
            this.winText.text = "";
            this.winHint.text = "";
        }
        if (this.gameOver === true) {
            this.loseText.text = "Ooops!";
            this.loseHint.text = "Press Enter to continue.";
        } else {
            this.loseText.text = "";
            this.loseHint.text = "";
        }

        this.checkKeys();
        this.checkMouse();

        this.pacman.update();
        this.updateGhosts();

        if (!this.pacman.isDead && this.gameWin === false) {
            for (var i=0; i<this.ghosts.length; i++) {
                if (this.ghosts[i].mode !== this.ghosts[i].RETURNING_HOME) {
                    this.physics.arcade.overlap(this.pacman.sprite, this.ghosts[i].ghost, this.dogEatsDog, null, this);
                }
            }
        }

        if (this.time.time > this.startTime + 26000 && this.bonusComplete === false && this.gameOver === false)
        {
            this.pacman.move(Phaser.NONE);
            this.pacman.sprite.play("dance");
            this.stopGhosts();
            this.gameWin = true;
            this.score += 1000;
            this.bonusComplete = true;
            this.gameSound.playLevelComplete();
        }

        if ((this.gameOver === true || this.gameWin === true) && this.cursors.r.isDown)
        {
            this.gameSound.clear();
            if (this.result === "lose") {
                this.game.state.start("GameOver", true, false, this.score);
            }
            if (this.result === "win") {
                this.game.state.start("GameWin", true, false, this.score);
            }
        }

        // console.log(this.killCombo);
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

    sendExitOrder: function(ghost) {
        if (ghost.mode === ghost.AT_HOME)
            ghost.mode = ghost.EXIT_HOME;
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
            if (this.ghosts[ghost.index].mode === "random") {
                this.gameSound.playKillEnemy();
                this.ghosts[ghost.index].mode = "returning_home";

                switch(this.killCombo++) {
                    case 0:
                        this.score += 50;
                        break;
                    case 1:
                        this.score += 55;
                        break;
                    case 2:
                        this.score += 60;
                        break;
                    case 3:
                        this.score += 65;
                        break;
                    case 4:
                        this.score += 70;
                        break;
                    case 5:
                        this.score += 80;
                        break;
                    case 6:
                        this.score += 90;
                        break;
                    case 7:
                        this.score += 100;
                        break;
                    case 8:
                        this.score += 110;
                        break;
                    case 9:
                        this.score += 120;
                        break;
                    case 10:
                        this.score += 135;
                        break;
                    case 11:
                        this.score += 150;
                        break;
                    case 12:
                        this.score += 165;
                        break;
                    case 13:
                        this.score += 180;
                        break;
                    case 14:
                        this.score += 195;
                        break;
                    case 15:
                        this.score += 220;
                        break;
                    case 16:
                        this.score += 240;
                        break;
                    case 17:
                        this.score += 260;
                        break;
                    case 18:
                        this.score += 280;
                        break;
                    case 19:
                        this.score += 300;
                        break;
                    case 20:
                        this.score += 350;
                        break;
                    case 21:
                        this.score += 400;
                        break;
                    case 22:
                        this.score += 450;
                        break;
                    case 23:
                        this.score += 500;
                        break;
                    case 24:
                        this.score += 600;
                        break;
                    case 25:
                        this.score += 700;
                        break;
                    case 26:
                        this.score += 800;
                        break;
                    case 27:
                        this.score += 1600;
                        break;
                }
                this.playSlashAnimation(ghost.x, ghost.y);
            } else if (this.ghosts[ghost.index].mode !== "returning_home") {
                this.killPacman();
            }
        }
    },

    gimeMeExitOrder: function(ghost) {
        this.game.time.events.add(17000, this.sendExitOrder, this, ghost);
    },

    killPacman: function() {
        this.pacman.isDead = true;
        this.stopGhosts();
        this.gameSound.playPlayerDeath();
        this.gameOver = true;
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
    },

    stopGhosts: function() {
        for (var i=0; i<this.ghosts.length; i++) {
            this.ghosts[i].mode = this.ghosts[i].STOP;
        }
    },

    playSlashAnimation: function(posX, posY) {
        this.slashSprite.animations.stop();
        this.slashSprite.x = posX;
        this.slashSprite.y = posY;
        this.slashSprite.play('cut');
    }
};