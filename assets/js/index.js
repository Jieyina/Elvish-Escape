import Player  from "./player.js";
import Ghost  from "./ghost.js";
        
let width = 800;
let height = 625;
let gridSize = 32;
let offset=parseInt(gridSize/2);
let threshold = 5;
let config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }            
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

let cursors;
let player;
let ghosts=[];
let TIME_MODES = [
    {
        mode: "scatter",
        interval: 7000
    },
    {
        mode: "chase",
        interval: 20000
    },
    {
        mode: "scatter",
        interval: 7000
    },
    {
        mode: "chase",
        interval: 20000
    },
    {
        mode: "scatter",
        interval: 5000
    },
    {
        mode: "chase",
        interval: 200000
    },
    {
        mode: "scatter",
        interval: 5000
    },
    {
        mode: "chase",
        interval: -1
    }
];
let changeModeTimer = 0;
let remainingTime = 0;
let currentMode = 0;
let isPaused = false;
let isInkyOut = false;
let isClydeOut = false;
let FRIGHTENED_MODE_TIME = 7000;
let dots;
let dotsCount=0;
let dotsAte=0;
let powers;
let map;
let layer1;
let graphics;
let scoreText;
let livesImage=[];
let spritesheet = 'pacman-spritesheet';
let spritesheetPath = 'assets/images/pacmansprites.png';
let tiles = "pacman-tiles";
let tilesPath = 'assets/images/background.png';
let mapPath = 'assets/levels/codepen-level.json';
let Animation= {
    Player : {
        Eat: 'player-eat',
        Stay: 'player-stay',
        Die: 'player-die'
    },
    Ghost :{
        Blue : {
            Move: 'ghost-blue-move',
        },

        Orange : {
            Move: 'ghost-orange-move',
        },

        White : {
            Scared: 'ghost-frightened',
            Return: 'ghost-return',
        },

        Pink : {
            Move: 'ghost-pink-move',
        },

        Red : {
            Move: 'ghost-red-move',
        },
    }
};

function preload ()
{
    this.load.spritesheet(spritesheet, spritesheetPath, { frameWidth: gridSize, frameHeight: gridSize });
    this.load.tilemapTiledJSON("map", mapPath);
    this.load.image(tiles, tilesPath);
    this.load.image("dot", "assets/images/pac man pill/spr_pill_0.png");
    this.load.image("power", "assets/images/pac man pill/spr_power_pill_0.png");
    this.load.image("lifecounter", "assets/images/pac man life counter/spr_lifecounter_0.png");
}

function create ()
{    
    this.anims.create({
            key: Animation.Player.Eat,
            frames: this.anims.generateFrameNumbers(spritesheet, { start: 9, end: 13 }),
            frameRate: 10,
            repeat: -1
        });

    this.anims.create({
        key: Animation.Player.Stay,
        frames: [ { key: spritesheet, frame: 9 } ],
        frameRate: 20
    });

    this.anims.create({
        key: Animation.Player.Die,
        frames: this.anims.generateFrameNumbers(spritesheet, { start: 6, end: 8 }),
        frameRate: 5
    });

    this.anims.create({
            key: Animation.Ghost.Blue.Move,
            frames: this.anims.generateFrameNumbers(spritesheet, { start: 4, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

    this.anims.create({
            key: Animation.Ghost.Orange.Move,
            frames: this.anims.generateFrameNumbers(spritesheet, { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

    this.anims.create({
            key: Animation.Ghost.White.Scared,
            frames: [ { key: spritesheet, frame: 2 } ],
            frameRate: 10,
            repeat: -1
        });

    this.anims.create({
        key: Animation.Ghost.White.Return,
        frames: [ { key: spritesheet, frame: 3 } ],
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
            key: Animation.Ghost.Pink.Move,
            frames: this.anims.generateFrameNumbers(spritesheet, { start: 14, end: 15 }),
            frameRate: 10,
            repeat: -1
        });

    this.anims.create({
            key: Animation.Ghost.Red.Move,
            frames: this.anims.generateFrameNumbers(spritesheet, { start: 16, end: 17 }),
            frameRate: 10,
            repeat: -1
        });

    map = this.make.tilemap({ key: "map", tileWidth: gridSize, tileHeight: gridSize });
    const tileset = map.addTilesetImage(tiles);

    // layer for background scene
    layer1 = map.createStaticLayer("Layer 1", tileset, 0, 0);
    layer1.setCollisionByProperty({ collides: true});

    // place player in the scene
    let spawnPoint = map.findObject("Objects", obj => obj.name == "Player");
    let position = new Phaser.Geom.Point(spawnPoint.x + offset, spawnPoint.y - offset);
    player = new Player(this, position, Animation.Player, function() {
        if(player.life <= 0) {
            newGame();
        }
        else {
            respawn();
        }
    });

    let scene = this;

    dots = this.physics.add.group();
    powers = this.physics.add.group();
    map.filterObjects("Objects", function (value, index, array) {
        if(value.name == "Pill") {
            let dot = scene.physics.add
                .sprite(value.x + offset, value.y - offset, "dot");
            dots.add(dot);
            dotsCount++;
        }
        if(value.name == "Power") {
            let power = scene.physics.add
                .sprite(value.x + offset, value.y - offset, "power");
            powers.add(power);
        }
    });

    let ghostsGroup = this.physics.add.group();
    let i=0;
    let skins=[Animation.Ghost.Blue, Animation.Ghost.Red, Animation.Ghost.Orange , Animation.Ghost.Pink];
    let names=["inky", "blinky", "clyde", "pinky"];
     map.filterObjects("Objects", function (value, index, array) {        
        if(value.name == "Ghost") {
            let position = new Phaser.Geom.Point(value.x + offset, value.y - offset);
            let ghost = new Ghost(names[i], scene, position, skins[i]);
            ghosts.push(ghost);    
            ghostsGroup.add(ghost.sprite);
            i++;
        }
     });

    sendExitOrder(ghosts[3]);
    ghosts[1].mode = getCurrentMode();

    this.physics.add.collider(player.sprite, layer1);
    this.physics.add.collider(ghostsGroup, layer1);

    cursors= this.input.keyboard.createCursorKeys();

    graphics = this.add.graphics();

    scoreText =  this.add.text(25, 595, 'Score: '+player.score).setFontFamily('Arial').setFontSize(18).setColor('#ffffff');
    this.add.text(630, 595, 'Lives:').setFontFamily('Arial').setFontSize(18).setColor('#ffffff');
    for (let i =  0; i < player.life; i++) {
        livesImage.push(this.add.image(700 + (i * 25), 605, 'lifecounter'));
    }
}

function respawn() {
    player.respawn();
    for(let ghost of ghosts) {
            ghost.respawn();
        }    
}

function reset() {
    respawn();
    for (let child of dots.getChildren()) {
            child.enableBody(false, child.x, child.y, true, true);
        }
    dotsAte=0;
    
}

function newGame() {
    reset();
    player.life=3;
    player.score=0;
    for (let i = 0; i < player.life; i++) {
        let image = livesImage[i];
        if(image) {
            image.alpha=1;
        }
    }
}

function update()
{
    //console.log(ghosts[0].mode);
    //console.log(ghosts[0].ghostDestination);
    //console.log(ghosts[3].current);
    //console.log(ghosts[3].mode);

    if(!player.playing) {
        for(let ghost of ghosts) {
            ghost.freeze();
        }
    }
    player.setDirections(getDirection(map, layer1, player.sprite));
    player.setTurningPoint(getTurningPoint(map, player.sprite));
    player.checkKeys(cursors);
    player.update();

    if(player.active) {
        if(player.sprite.x < 0 - offset ) {
            player.sprite.setPosition(width + offset, player.sprite.y);
        }
        else if(player.sprite.x> width + offset) {
            player.sprite.setPosition(0 - offset, player.sprite.y);
        }
    }

    this.physics.add.overlap(player.sprite, dots, function(sprite, dot) {
        dot.disableBody(true, true);
        dotsAte++;
        player.score+=10;
        if(dotsCount==dotsAte) {
            reset();
        }
    }, null, this);

    if (dotsAte > 30 && !isInkyOut) {
        isInkyOut = true;
        sendExitOrder(ghosts[0]);
    }

    if (dotsAte > dotsCount/3*2 && !isClydeOut) {
        isClydeOut = true;
        sendExitOrder(ghosts[2]);
    }

    if (TIME_MODES[currentMode].interval !== -1 && !isPaused && changeModeTimer < this.time.now) {
        currentMode++;
        changeModeTimer = this.time.now + TIME_MODES[currentMode].interval;
        if (TIME_MODES[currentMode].mode == "chase") {
            sendAttackOrder();
        } else {
            sendScatterOrder();
        }
    }

    this.physics.add.overlap(player.sprite, powers, function(sprite, power) {
        power.disableBody(true, true);
        for (var i=0; i<ghosts.length; i++) {
            ghosts[i].enterFrightenedMode();
        }
        if (!isPaused) {
            remainingTime = changeModeTimer - this.time.now;
        }
        changeModeTimer = this.time.now + FRIGHTENED_MODE_TIME;
        isPaused = true;
    }, null, this);

    if (isPaused && changeModeTimer < this.time.now) {
        changeModeTimer = this.time.now + remainingTime;
        isPaused = false;
        ghosts[0].sprite.anims.play('ghost-blue-move', true);
        ghosts[1].sprite.anims.play('ghost-red-move', true);
        ghosts[2].sprite.anims.play('ghost-orange-move', true);
        ghosts[3].sprite.anims.play('ghost-pink-move', true);
        if (TIME_MODES[currentMode].mode == "chase") {
            sendAttackOrder();
        } else {
            sendScatterOrder();
        }
    }

    if (dotsCount - dotsAte < 20) {
        ghosts[1].speed = ghosts[1].cruiseElroySpeed;
        ghosts[1].mode = ghosts[1].CHASE;
    }

    for(let ghost of ghosts) {
        if (ghost.isAttacking && (ghost.mode == ghost.SCATTER || ghost.mode == ghost.CHASE)) {
            ghost.ghostDestination = getGhostDestination(ghost);
            ghost.mode = ghost.CHASE;
        }
        let sx = Math.floor(ghost.sprite.x);
        let sy = Math.floor(ghost.sprite.y);
        let currentTile = map.getTileAtWorldXY(sx, sy, true);
        if (Phaser.Math.Within(currentTile.pixelX + offset, ghost.sprite.x, threshold) &&
            Phaser.Math.Within(currentTile.pixelY + offset, ghost.sprite.y, threshold))
        {
            var x = currentTile.x;
            var y = currentTile.y;
            ghost.turningPoint.x = currentTile.pixelX + offset;
            ghost.turningPoint.y = currentTile.pixelY + offset;
            //return a tile or -1
            ghost.directions[Phaser.NONE] = map.getTileAt(x, y, true, layer1);
            ghost.directions[Phaser.LEFT] = map.getTileAt(x - 1, y, true, layer1);
            ghost.directions[Phaser.RIGHT] = map.getTileAt(x + 1, y, true, layer1);
            ghost.directions[Phaser.UP] = map.getTileAt(x, y - 1, true, layer1);
            ghost.directions[Phaser.DOWN] = map.getTileAt(x, y + 1, true, layer1);
            var canContinue = ghost.isSafe(ghost.directions[ghost.current].index);
            var possibleExits = [];
            for (var q = 5; q < ghost.directions.length; q++) {
                if (ghost.isSafe(ghost.directions[q].index) && q !== ghost.opposites[ghost.current]) {
                    possibleExits.push(q);
                }
            }
            switch (ghost.mode) {
                case ghost.RANDOM:
                    if (ghost.turnTimer < this.time.now && (possibleExits.length > 1 || !canContinue)) {
                        var select = Math.floor(Math.random() * possibleExits.length);
                        var newDirection = possibleExits[select];
                        ghost.sprite.setPosition(ghost.turningPoint.x, ghost.turningPoint.y);
                        ghost.move(newDirection);
                        ghost.setTurnTimer(this.time.now + ghost.turning_cooldown);
                    }
                    break;

                case ghost.RETURNING_HOME:
                    if (ghost.turnTimer < this.time.now) {
                        var distanceToObj = 999999;
                        var direction, decision, bestDecision;
                        for (var q = 0; q < possibleExits.length; q++) {
                            direction = possibleExits[q];
                            switch (direction) {
                                case Phaser.LEFT:
                                    decision = new Phaser.Math.Vector2((x - 1) * gridSize + offset, y * gridSize + offset);
                                    break;
                                case Phaser.RIGHT:
                                    decision = new Phaser.Math.Vector2((x + 1) * gridSize + offset, y * gridSize + offset);
                                    break;
                                case Phaser.UP:
                                    decision = new Phaser.Math.Vector2(x * gridSize + offset, (y - 1) * gridSize + offset);
                                    break;
                                case Phaser.DOWN:
                                    decision = new Phaser.Math.Vector2(x * gridSize + offset, (y + 1) * gridSize + offset);
                                    break;
                                default:
                                    break;
                            }
                            var dist = ghost.returnDestinationreturnDestination.distance(decision);
                            if (dist < distanceToObj) {
                                bestDecision = direction;
                                distanceToObj = dist;
                            }
                        }

                        /* if (this.game.isSpecialTile({x: x, y: y}) && bestDecision === Phaser.UP) {
                            bestDecision = ghost.current;
                        } */
                        ghost.sprite.setPosition(ghost.turningPoint.x, ghost.turningPoint.y);
                        ghost.move(bestDecision);
                        ghost.setTurnTimer(this.time.now + ghost.turning_cooldown);
                    }
                    if (ghost.hasReachedHome()) {
                        ghost.sprite.setPosition(ghost.turningPoint.x, ghost.turningPoint.y);
                        switch(ghost.name)
                        {
                            case "blinky":
                                ghost.sprite.anims.play("ghost-red-move", true);
                                break;
                            case "inky":
                                ghost.sprite.anims.play("ghost-blue-move", true);
                                break;
                            case "pinky":
                                ghost.sprite.anims.play("ghost-pink-move", true);
                                break;
                            case "clyde":
                                ghost.sprite.anims.play("ghost-orange-move", true);
                                break;
                        }
                        ghost.mode = ghost.AT_HOME;
                        this.time.addEvent(Math.random() * 3000, sendExitOrder, this, ghost);
                    }
                    break;

                case ghost.CHASE:
                    if (ghost.turnTimer < this.time.now) {
                        var distanceToObj = 999999;
                        var direction, decision, bestDecision;
                        for (var q = 0; q < possibleExits.length; q++) {
                            direction = possibleExits[q];
                            switch (direction) {
                                case Phaser.LEFT:
                                    decision = new Phaser.Math.Vector2((x - 1) * gridSize + offset, y * gridSize + offset);
                                    break;
                                case Phaser.RIGHT:
                                    decision = new Phaser.Math.Vector2((x + 1) * gridSize + offset, y * gridSize + offset);
                                    break;
                                case Phaser.UP:
                                    decision = new Phaser.Math.Vector2(x * gridSize + offset, (y - 1) * gridSize + offset);
                                    break;
                                case Phaser.DOWN:
                                    decision = new Phaser.Math.Vector2(x * gridSize + offset, (y + 1) * gridSize + offset);
                                    break;
                                default:
                                    break;
                            }
                            var dist = ghost.ghostDestination.distance(decision);
                            if (dist < distanceToObj) {
                                bestDecision = direction;
                                distanceToObj = dist;
                            }
                        }

                        /* if (this.game.isSpecialTile({x: x, y: y}) && bestDecision === Phaser.UP) {
                            bestDecision = ghost.currentDir;
                        } */
                        ghost.sprite.setPosition(ghost.turningPoint.x, ghost.turningPoint.y);
                        ghost.move(bestDecision);
                        ghost.setTurnTimer(this.time.now + ghost.turning_cooldown);
                    }
                    break;

                case ghost.AT_HOME:
                    if (!canContinue) {
                        ghost.sprite.setPosition(ghost.turningPoint.x, ghost.turningPoint.y);
                        var dir = (ghost.current == Phaser.LEFT) ? Phaser.RIGHT : Phaser.LEFT;
                        ghost.move(dir);
                    } else {
                        ghost.move(ghost.current);
                    }
                    break;

                case ghost.EXIT_HOME:
                    if (ghost.current !== Phaser.UP && currentTile.x >= 11 && currentTile.x <= 13 && currentTile.y >= 8 && currentTile.y <= 10) {
                        ghost.sprite.setPosition(ghost.turningPoint.x, ghost.turningPoint.y);
                        ghost.move(Phaser.UP);
                    } else if (ghost.current !== Phaser.RIGHT && currentTile.x >= 9 && currentTile.x <= 10 && currentTile.y >= 9 && currentTile.y <= 10) {
                        ghost.sprite.setPosition(ghost.turningPoint.x, ghost.turningPoint.y);
                        ghost.move(Phaser.RIGHT);
                    } else if (ghost.current !== Phaser.LEFT && currentTile.x >= 14 && currentTile.x <= 15 && currentTile.y >= 9 && currentTile.y <= 10) {
                        ghost.sprite.setPosition(ghost.turningPoint.x, ghost.turningPoint.y);
                        ghost.move(Phaser.LEFT);
                    } else if (ghost.current == Phaser.UP && (currentTile.x >= 11 || currentTile.x <= 13) && currentTile.y == 7) {
                        ghost.sprite.setPosition(ghost.turningPoint.x, ghost.turningPoint.y);
                        ghost.mode = getCurrentMode();
                        return;
                    }
                    break;

                case ghost.SCATTER:
                    ghost.ghostDestination = ghost.scatterDestination;
                    ghost.mode = ghost.CHASE;
                    break;

                case ghost.STOP:
                    ghost.move(Phaser.NONE);
                    break;
            }
        }
        //ghost.drawDebug(graphics);
    }

    for (let i = player.life; i < 3; i++) {
        let image = livesImage[i];
        if (image) {
            image.alpha = 0;
        }
    }

    for (let ghost of ghosts) {
        this.physics.add.overlap(player.sprite, ghost.sprite, function (sprite, ghostSprite) {
            if (player.active && ghost.mode !== ghost.RETURNING_HOME) {
                if (isPaused) {
                    ghost.mode = ghost.RETURNING_HOME;
                    ghost.sprite.anims.play('ghost-return', true);
                    player.score += 100;
                } else {
                    player.die();
                    ghost.freeze();
                }
            }
        }, null, this);
    }

    scoreText.setText('Score: '+player.score);

    //drawDebug();
}

function drawDebug() {
    graphics.clear();
    player.drawDebug(graphics);
    for(let ghost of ghosts) {
            ghost.drawDebug(graphics);
        }
}

function getDirection(map, layer, sprite) {
    let directions = [];
    let sx = Math.floor(sprite.x);
    let sy = Math.floor(sprite.y);
    let currentTile = map.getTileAtWorldXY(sx, sy, true);
    if (currentTile)
    {
        var x = currentTile.x;
        var y = currentTile.y;
        //return a tile or -1
        directions[Phaser.NONE]     =   map.getTileAt(x, y, true, layer);
        directions[Phaser.LEFT]     =   map.getTileAt(x-1, y, true, layer);
        directions[Phaser.RIGHT]    =   map.getTileAt(x+1, y, true, layer);
        directions[Phaser.UP]       =   map.getTileAt(x, y-1, true, layer);
        directions[Phaser.DOWN]     =   map.getTileAt(x, y+1, true, layer);
    }

    return directions;
}

function getTurningPoint(map, sprite) {
    let turningPoint = new Phaser.Geom.Point();
    let sx = Math.floor(sprite.x);
    let sy = Math.floor(sprite.y);
    let currentTile = map.getTileAtWorldXY(sx, sy, true);
    if(currentTile) {    
        turningPoint.x = currentTile.pixelX + offset;
        turningPoint.y = currentTile.pixelY + offset;
    }

    return turningPoint;
}

function getGhostDestination(ghost) {
    switch (ghost.name) {
        case "blinky":
            return new Phaser.Math.Vector2(player.sprite.x, player.sprite.y);

        case "pinky":
            var dest = new Phaser.Math.Vector2(player.sprite.x, player.sprite.y);
            var dir = player.current;
            var offsetX = 0, offsetY = 0;
            if (dir == Phaser.LEFT || dir == Phaser.RIGHT) {
                offsetX = (dir == Phaser.RIGHT) ? -4 : 4;
            }
            if (dir === Phaser.UP || dir === Phaser.DOWN) {
                offsetY = (dir == Phaser.DOWN) ? -4 : 4;
            }
            offsetX *= gridSize;
            offsetY *= gridSize;
            dest.x -= offsetX;
            dest.y -= offsetY;
            if (dest.x < offset) dest.x = offset;
            if (dest.x > width - offset) dest.x = width - offset;
            if (dest.y < offset) dest.y = offset;
            if (dest.y > height - offset) dest.y = height - offset;
            return dest;

        case "inky":
            var pacmanPos = new Phaser.Math.Vector2(player.sprite.x, player.sprite.y);
            var blinkyPos = new Phaser.Math.Vector2(ghosts[1].sprite.x, ghosts[1].sprite.y);
            var diff = pacmanPos.subtract(blinkyPos);
            var dest = pacmanPos.add(diff);
            if (dest.x < offset) dest.x = offset;
            if (dest.x > width - offset) dest.x = width - offset;
            if (dest.y < offset) dest.y = offset;
            if (dest.y > height - offset) dest.y = height - offset;
            return dest;

        case "clyde":
            var pacmanPos = new Phaser.Math.Vector2(player.sprite.x, player.sprite.y);
            var clydePos = new Phaser.Math.Vector2(ghosts[2].sprite.x, ghosts[2].sprite.y);
            if (clydePos.distance(pacmanPos) > 8 * gridSize) {
                return new Phaser.Geom.Point(pacmanPos.x, pacmanPos.y);
            } else {
                return ghost.scatterDestination;
            }

        default:
            return ghost.scatterDestination;
    }
}

function sendExitOrder(ghost) {
    ghost.mode = ghost.EXIT_HOME;
}

function sendScatterOrder() {
    for (var i=0; i<ghosts.length; i++) {
        ghosts[i].scatter();
    }
}

function sendAttackOrder() {
    for (var i=0; i<ghosts.length; i++) {
        ghosts[i].attack();
    }
}

function getCurrentMode() {
    if (!isPaused) {
        if (TIME_MODES[currentMode].mode == "scatter") {
            return "scatter";
        } else {
            return "chase";
        }
    } else {
        return "random";
    }
}