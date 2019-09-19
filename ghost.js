var Ghost = function(game, key, name, index, startPos, startDir, scatterDes, returnDes, exitDes) {
    this.game = game;
    this.key  = key;
    this.name = name;

    this.gridsize = this.game.gridsize;
    this.safetiles = this.game.safetile;
    this.startDir = startDir;
    this.startPos = startPos;
    this.threshold = 6;
    this.returnDes = returnDes;
    this.exitDes = exitDes;

    this.turnTimer = 0;
    this.TURNING_COOLDOWN = 150;
    this.RANDOM     = "random";
    this.SCATTER    = "scatter";
    this.CHASE      = "chase";
    this.STOP       = "stop";
    this.AT_HOME    = "at_home";
    this.EXIT_HOME  = "leaving_home";
    this.RETURNING_HOME = "returning_home";
    this.lastDirection = null;

    if (this.game.mode === "normal")
    {
        if (this.name === "blinky") this.mode = this.SCATTER;
        else this.mode = this.AT_HOME;
    }
    else if (this.game.mode === "bonus")
    {
        this.mode = this.RANDOM;
    }

    this.turnPoint = new Phaser.Point();
    this.ghostDestination = new Phaser.Point();
    this.returnDestination = new Phaser.Point(returnDes.x * this.gridsize + this.gridsize/2, returnDes.y * this.gridsize + this.gridsize/2);
    this.scatterDestination = new Phaser.Point(scatterDes.x * this.gridsize + this.gridsize/2, scatterDes.y * this.gridsize + this.gridsize/2);
    this.exitDestination = new Phaser.Point(exitDes.x * this.gridsize + this.gridsize/2, exitDes.y * this.gridsize + this.gridsize/2);

    this.ghostSpeed = this.game.ghostSpeed;
    this.ghostScatterSpeed = this.game.ghostScatterSpeed;
    this.ghostFrightenedSpeed = this.game.ghostFrightenedSpeed;
    this.cruiseSpeed = this.game.cruiseSpeed;
    this.ElroySpeed = this.game.ElroySpeed;
    this.directions = [ null, null, null, null, null ];
    // Phaser.none/left/right/up/down = 0/1/2/3/4
    this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];
    this.currentDir = startDir;

    this.ghost = this.game.add.sprite((startPos.x * this.gridsize) + this.gridsize/2, (startPos.y * this.gridsize) + this.gridsize/2, key, 0);
    this.ghost.name = this.name;
    this.ghost.index = index;
    this.ghost.anchor.set(0.5);

    this.ghost.animations.add("left", [16, 17, 18, 19, 20, 21, 22, 23], 15, true);
    this.ghost.animations.add("right", [0, 1, 2, 3, 4, 5, 6, 7], 15, true);
    this.ghost.animations.add("frightened left", [24, 25, 26, 27, 28, 29, 30, 31], 15, true);
    this.ghost.animations.add("frightened right", [8, 9, 10, 11, 12, 13, 14, 15], 15, true);
    this.ghost.animations.add("dead-right", [32, 33, 34, 35, 36, 37, 38, 39], 15, true);
    this.ghost.animations.add("dead-left", [40, 41, 42, 43, 44, 45, 46, 47], 15, true);

    this.game.physics.arcade.enable(this.ghost);
    this.ghost.body.setSize(32, 32, 0, 0);

    this.move(startDir);
};

Ghost.prototype = {
    update: function() {
        if (this.currentDir === Phaser.LEFT && this.mode !== this.STOP && this.mode !== this.RANDOM && this.mode !== this.RETURNING_HOME) {
            this.ghost.animations.play("left");
        } else if (this.currentDir === Phaser.RIGHT && this.mode !== this.STOP && this.mode !== this.RANDOM && this.mode !== this.RETURNING_HOME) {
            this.ghost.animations.play("right");
        } else if (this.currentDir === Phaser.UP && this.mode !== this.STOP && this.mode !== this.RANDOM && this.mode !== this.RETURNING_HOME && this.lastDirection === Phaser.LEFT) {
            this.ghost.animations.play("left");
        } else if (this.currentDir === Phaser.UP && this.mode !== this.STOP && this.mode !== this.RANDOM && this.mode !== this.RETURNING_HOME && this.lastDirection === Phaser.RIGHT) {
            this.ghost.animations.play("right");
        } else if (this.currentDir === Phaser.DOWN && this.mode !== this.STOP && this.mode !== this.RANDOM && this.mode !== this.RETURNING_HOME && this.lastDirection === Phaser.LEFT) {
            this.ghost.animations.play("left");
        } else if (this.currentDir === Phaser.DOWN && this.mode !== this.STOP && this.mode !== this.RANDOM && this.mode !== this.RETURNING_HOME && this.lastDirection === Phaser.RIGHT) {
            this.ghost.animations.play("right");
        } else if (this.currentDir === Phaser.LEFT && this.mode === this.RANDOM) {
            this.ghost.animations.play("frightened left");
        } else if (this.currentDir === Phaser.RIGHT && this.mode === this.RANDOM) {
            this.ghost.animations.play("frightened right");
        } else if (this.currentDir === Phaser.UP && this.mode === this.RANDOM && this.lastDirection === Phaser.LEFT) {
            this.ghost.animations.play("frightened left");
        } else if (this.currentDir === Phaser.UP && this.mode === this.RANDOM && this.lastDirection === Phaser.RIGHT) {
            this.ghost.animations.play("frightened right");
        } else if (this.currentDir === Phaser.DOWN && this.mode === this.RANDOM && this.lastDirection === Phaser.LEFT) {
            this.ghost.animations.play("frightened left");
        } else if (this.currentDir === Phaser.DOWN && this.mode === this.RANDOM && this.lastDirection === Phaser.RIGHT) {
            this.ghost.animations.play("frightened right");
        } else if (this.currentDir === Phaser.LEFT && this.mode === this.RETURNING_HOME) {
            this.ghost.animations.play("dead-left");
        } else if (this.currentDir === Phaser.RIGHT && this.mode === this.RETURNING_HOME) {
            this.ghost.animations.play("dead-right");
        } else if (this.currentDir === Phaser.UP && this.mode === this.RETURNING_HOME && this.lastDirection === Phaser.LEFT) {
            this.ghost.animations.play("dead-left");
        } else if (this.currentDir === Phaser.UP && this.mode === this.RETURNING_HOME && this.lastDirection === Phaser.RIGHT) {
            this.ghost.animations.play("dead-right");
        } else if (this.currentDir === Phaser.DOWN && this.mode === this.RETURNING_HOME && this.lastDirection === Phaser.LEFT) {
            this.ghost.animations.play("dead-left");
        } else if (this.currentDir === Phaser.DOWN && this.mode === this.RETURNING_HOME && this.lastDirection === Phaser.RIGHT) {
            this.ghost.animations.play("dead-right");
        }

        this.game.physics.arcade.collide(this.ghost, this.game.layer);
        
        var x = this.game.math.snapToFloor(Math.floor(this.ghost.x), this.gridsize) / this.gridsize;
        var y = this.game.math.snapToFloor(Math.floor(this.ghost.y), this.gridsize) / this.gridsize;
        this.turnPoint.x = (x * this.gridsize) + (this.gridsize / 2);
        this.turnPoint.y = (y * this.gridsize) + (this.gridsize / 2);

        if (this.ghost.x < 0) {
            this.ghost.x = this.game.map.widthInPixels - 2;
        }
        if (this.ghost.x >= this.game.map.widthInPixels - 1) {
            this.ghost.x = 1;
        }
        if (this.ghost.y < 0) {
            this.ghost.y = this.game.map.heightInPixels - 2;
        }
        if (this.ghost.y >= this.game.map.heightInPixels - 1) {
            this.ghost.y = 1;
        }
        
        if (this.game.math.fuzzyEqual((x * this.gridsize) + (this.gridsize /2), this.ghost.x, this.threshold) &&
           this.game.math.fuzzyEqual((y * this.gridsize) + (this.gridsize /2), this.ghost.y, this.threshold)) {
            this.directions[0] = this.game.map.getTile(x, y, this.game.layer);
            this.directions[1] = this.game.map.getTileLeft(this.game.layer.index, x, y) || this.directions[1];
            this.directions[2] = this.game.map.getTileRight(this.game.layer.index, x, y) || this.directions[2];
            this.directions[3] = this.game.map.getTileAbove(this.game.layer.index, x, y) || this.directions[3];
            this.directions[4] = this.game.map.getTileBelow(this.game.layer.index, x, y) || this.directions[4];
            // console.log(this.name + " " + x + " " + this.currentDir);

            var canContinue = this.checkSafetile(this.directions[this.currentDir].index);
            var possibleExits = [];
            for (var q=1; q<this.directions.length; q++) {
                if (this.checkSafetile(this.directions[q].index) && q !== this.opposites[this.currentDir]) {
                    possibleExits.push(q);
                }
            }
            // console.log(this.name, possibleExits);
            switch (this.mode) {
                case this.RANDOM:
                    if (this.turnTimer < this.game.time.time) {
                        if (possibleExits.length < 1)
                        {
                            this.ghost.x = this.turnPoint.x;
                            this.ghost.y = this.turnPoint.y;

                            this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                            this.lastDirection = this.currentDir;
                            this.move(this.opposites[this.currentDir]);
                        }
                        else if (possibleExits.length > 1 || !canContinue)
                        {
                            var select = Math.floor(Math.random() * possibleExits.length);
                            var newDirection = possibleExits[select];

                            // snap to grid exact position before turning
                            this.ghost.x = this.turnPoint.x;
                            this.ghost.y = this.turnPoint.y;

                            this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                            this.lastDirection = this.currentDir;
                            this.move(newDirection);
                        }
                        this.turnTimer = this.game.time.time + this.TURNING_COOLDOWN;
                    }
                    break;
                    
                case this.RETURNING_HOME:
                    if (x === this.returnDes.x && y === this.returnDes.y) {
                        this.ghost.x = this.turnPoint.x;
                        this.ghost.y = this.turnPoint.y;
                        this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                        this.mode = this.AT_HOME;
                        this.game.gimeMeExitOrder(this);
                    }
                    this.ghostDestination = this.returnDestination;
                    if (this.turnTimer < this.game.time.time) {
                        var distanceToObj = 999999;
                        var direction, decision, bestDecision;
                        if (possibleExits.length < 1)
                        {
                            this.ghost.x = this.turnPoint.x;
                            this.ghost.y = this.turnPoint.y;

                            this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                            this.lastDirection = this.currentDir;
                            this.move(this.opposites[this.currentDir]);
                        }
                        else
                        {
                            for (q=0; q<possibleExits.length; q++) {
                                direction = possibleExits[q];
                                switch (direction) {
                                    case Phaser.LEFT:
                                        decision = new Phaser.Point((x-1)*this.gridsize + (this.gridsize/2),
                                            (y * this.gridsize) + (this.gridsize / 2));
                                        break;
                                    case Phaser.RIGHT:
                                        decision = new Phaser.Point((x+1)*this.gridsize + (this.gridsize/2),
                                            (y * this.gridsize) + (this.gridsize / 2));
                                        break;
                                    case Phaser.UP:
                                        decision = new Phaser.Point(x * this.gridsize + (this.gridsize/2),
                                            ((y-1)*this.gridsize) + (this.gridsize / 2));
                                        break;
                                    case Phaser.DOWN:
                                        decision = new Phaser.Point(x * this.gridsize + (this.gridsize/2),
                                            ((y+1)*this.gridsize) + (this.gridsize / 2));
                                        break;
                                    default:
                                        break;
                                }
                                var dist = this.ghostDestination.distance(decision);
                                if (dist < distanceToObj) {
                                    bestDecision = direction;
                                    distanceToObj = dist;
                                }
                                if (this.game.isSpecialTile({x: x, y: y}) && bestDecision === Phaser.DOWN) {
                                    bestDecision = this.currentDir;
                                }
                            }

                            // snap to grid exact position before turning
                            this.ghost.x = this.turnPoint.x;
                            this.ghost.y = this.turnPoint.y;

                            this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                            this.lastDirection = this.currentDir;
                            this.move(bestDecision);
                        }

                        this.turnTimer = this.game.time.time + this.TURNING_COOLDOWN;
                    }
                    break;
                    
                case this.CHASE:
                    this.ghostDestination = this.getGhostDestination();
                    if (this.turnTimer < this.game.time.time) {
                        var distanceToObj = 999999;
                        var direction, decision, bestDecision;
                        if (possibleExits.length < 1)
                        {
                            this.ghost.x = this.turnPoint.x;
                            this.ghost.y = this.turnPoint.y;

                            this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                            this.lastDirection = this.currentDir;
                            this.move(this.opposites[this.currentDir]);
                        }
                        else
                        {
                            for (q=0; q<possibleExits.length; q++) {
                                direction = possibleExits[q];
                                switch (direction) {
                                    case Phaser.LEFT:
                                        decision = new Phaser.Point((x-1)*this.gridsize + (this.gridsize/2),
                                            (y * this.gridsize) + (this.gridsize / 2));
                                        break;
                                    case Phaser.RIGHT:
                                        decision = new Phaser.Point((x+1)*this.gridsize + (this.gridsize/2),
                                            (y * this.gridsize) + (this.gridsize / 2));
                                        break;
                                    case Phaser.UP:
                                        decision = new Phaser.Point(x * this.gridsize + (this.gridsize/2),
                                            ((y-1)*this.gridsize) + (this.gridsize / 2));
                                        break;
                                    case Phaser.DOWN:
                                        decision = new Phaser.Point(x * this.gridsize + (this.gridsize/2),
                                            ((y+1)*this.gridsize) + (this.gridsize / 2));
                                        break;
                                    default:
                                        break;
                                }
                                var dist = this.ghostDestination.distance(decision);
                                if (dist < distanceToObj) {
                                    bestDecision = direction;
                                    distanceToObj = dist;
                                }
                            }

                            // snap to grid exact position before turning
                            this.ghost.x = this.turnPoint.x;
                            this.ghost.y = this.turnPoint.y;

                            this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                            this.lastDirection = this.currentDir;
                            this.move(bestDecision);
                        }

                        this.turnTimer = this.game.time.time + this.TURNING_COOLDOWN;
                    }
                    break;
                    
                case this.AT_HOME:
                    if (!canContinue) {
                        this.ghost.x = this.turnPoint.x;
                        this.ghost.y = this.turnPoint.y;
                        this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                        this.lastDirection = this.currentDir;
                        var dir = (this.currentDir === Phaser.LEFT) ? Phaser.RIGHT : Phaser.LEFT;
                        this.move(dir);
                    } else {
                        this.move(this.currentDir);
                    }
                    break;
                    
                case this.EXIT_HOME:
                    if (x === this.exitDes.x && y === this.exitDes.y)
                    {
                        this.ghost.x = this.turnPoint.x;
                        this.ghost.y = this.turnPoint.y;
                        this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                        if (this.game.mode === "normal")
                            this.mode = this.game.getCurrentMode();
                        else if (this.game.mode === "bonus")
                            this.mode = this.CHASE;
                    }
                    this.ghostDestination = this.exitDestination;
                    if (this.turnTimer < this.game.time.time) {
                        var distanceToObj = 999999;
                        var direction, decision, bestDecision;
                        if (possibleExits.length < 1)
                        {
                            this.ghost.x = this.turnPoint.x;
                            this.ghost.y = this.turnPoint.y;

                            this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                            this.lastDirection = this.currentDir;
                            this.move(this.opposites[this.currentDir]);
                        }
                        else
                        {
                            for (q=0; q<possibleExits.length; q++) {
                                direction = possibleExits[q];
                                switch (direction) {
                                    case Phaser.LEFT:
                                        decision = new Phaser.Point((x-1)*this.gridsize + (this.gridsize/2),
                                            (y * this.gridsize) + (this.gridsize / 2));
                                        break;
                                    case Phaser.RIGHT:
                                        decision = new Phaser.Point((x+1)*this.gridsize + (this.gridsize/2),
                                            (y * this.gridsize) + (this.gridsize / 2));
                                        break;
                                    case Phaser.UP:
                                        decision = new Phaser.Point(x * this.gridsize + (this.gridsize/2),
                                            ((y-1)*this.gridsize) + (this.gridsize / 2));
                                        break;
                                    case Phaser.DOWN:
                                        decision = new Phaser.Point(x * this.gridsize + (this.gridsize/2),
                                            ((y+1)*this.gridsize) + (this.gridsize / 2));
                                        break;
                                    default:
                                        break;
                                }
                                var dist = this.ghostDestination.distance(decision);
                                if (dist < distanceToObj) {
                                    bestDecision = direction;
                                    distanceToObj = dist;
                                }
                            }

                            // snap to grid exact position before turning
                            this.ghost.x = this.turnPoint.x;
                            this.ghost.y = this.turnPoint.y;

                            this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                            this.lastDirection = this.currentDir;
                            this.move(bestDecision);
                        }

                        this.turnTimer = this.game.time.time + this.TURNING_COOLDOWN;
                    }
                    break;
                    
                case this.SCATTER:
                    this.ghostDestination = this.scatterDestination;
                    if (this.turnTimer < this.game.time.time) {
                        var distanceToObj = 999999;
                        var direction, decision, bestDecision;
                        if (possibleExits.length < 1)
                        {
                            this.ghost.x = this.turnPoint.x;
                            this.ghost.y = this.turnPoint.y;

                            this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                            this.lastDirection = this.currentDir;
                            this.move(this.opposites[this.currentDir]);
                        }
                        else
                        {
                            for (q=0; q<possibleExits.length; q++) {
                                direction = possibleExits[q];
                                switch (direction) {
                                    case Phaser.LEFT:
                                        decision = new Phaser.Point((x-1)*this.gridsize + (this.gridsize/2),
                                            (y * this.gridsize) + (this.gridsize / 2));
                                        break;
                                    case Phaser.RIGHT:
                                        decision = new Phaser.Point((x+1)*this.gridsize + (this.gridsize/2),
                                            (y * this.gridsize) + (this.gridsize / 2));
                                        break;
                                    case Phaser.UP:
                                        decision = new Phaser.Point(x * this.gridsize + (this.gridsize/2),
                                            ((y-1)*this.gridsize) + (this.gridsize / 2));
                                        break;
                                    case Phaser.DOWN:
                                        decision = new Phaser.Point(x * this.gridsize + (this.gridsize/2),
                                            ((y+1)*this.gridsize) + (this.gridsize / 2));
                                        break;
                                    default:
                                        break;
                                }
                                var dist = this.ghostDestination.distance(decision);
                                if (dist < distanceToObj) {
                                    bestDecision = direction;
                                    distanceToObj = dist;
                                }
                            }

                            // snap to grid exact position before turning
                            this.ghost.x = this.turnPoint.x;
                            this.ghost.y = this.turnPoint.y;

                            this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);
                            this.lastDirection = this.currentDir;
                            this.move(bestDecision);
                        }

                        this.turnTimer = this.game.time.time + this.TURNING_COOLDOWN;
                    }
                    break;
                    
                case this.STOP:
                    this.lastDirection = this.currentDir;
                    this.move(Phaser.NONE);
                    break;
            }
        }
    },
    
    attack: function() {
        if (!this.game.pacman.isDead && !this.game.gameWin && this.mode !== this.RETURNING_HOME) {
            //this.ghost.animations.play(this.currentDir);
            if (this.mode !== this.AT_HOME && this.mode !== this.EXIT_HOME) {
                this.mode = this.CHASE;
            }
        }
    },
    
    checkSafetile: function(tileIndex) {
        for (var q=0; q<this.safetiles.length; q++) {
            if (this.safetiles[q] === tileIndex) {
                return true;
            }
        }
        return false;
    },
    
    enterFrightenedMode: function() {
        if (this.mode !== this.AT_HOME && this.mode !== this.EXIT_HOME && this.mode !== this.RETURNING_HOME) {
            //this.ghost.play("frightened");
            this.mode = this.RANDOM;
        }
    },
    
    getGhostDestination: function() {
        switch (this.name) {
            case "blinky":
                return this.game.pacman.getPosition();
                
            case "pinky":
                var dest = this.game.pacman.getPosition();
                var dir = this.game.pacman.getCurrentDirection();
                var offsetX = 0, offsetY = 0;
                if (dir === Phaser.LEFT || dir === Phaser.RIGHT) {
                    offsetX = (dir === Phaser.RIGHT) ? -4 : 4;
                }
                if (dir === Phaser.UP || dir === Phaser.DOWN) {
                    offsetY = (dir === Phaser.DOWN) ? -4 : 4;
                }
                offsetX *= this.gridsize;
                offsetY *= this.gridsize;
                dest.x -= offsetX;
                dest.y -= offsetY;
                if (dest.x < this.gridsize/2) dest.x = this.gridsize/2;
                if (dest.x > this.game.map.widthInPixels - this.gridsize/2) dest.x = this.game.map.widthInPixels - this.gridsize/2;
                if (dest.y < this.gridsize/2) dest.y = this.gridsize/2;
                if (dest.y > this.game.map.heightInPixels - this.gridsize/2) dest.y = this.game.map.heightInPixels - this.gridsize/2;
                return dest;
                
            case "inky":
                if (this.game.mode === "normal")
                {
                    var pacmanPos = this.game.pacman.getPosition();
                    var blinkyPos = this.game.blinky.getPosition();
                    var diff = Phaser.Point.subtract(pacmanPos, blinkyPos);
                    var dest = Phaser.Point.add(pacmanPos, diff);
                    if (dest.x < this.gridsize/2) dest.x = this.gridsize/2;
                    if (dest.x > this.game.map.widthInPixels - this.gridsize/2) dest.x = this.game.map.widthInPixels - this.gridsize/2;
                    if (dest.y < this.gridsize/2) dest.y = this.gridsize/2;
                    if (dest.y > this.game.map.heightInPixels - this.gridsize/2) dest.y = this.game.map.heightInPixels - this.gridsize/2;
                    return dest;
                }
                else if (this.game.mode === "bonus")
                {
                    switch (this.ghost.index)
                    {
                        case 14:
                            var blinkyPos = this.game.ghosts[0].getPosition();
                            break;
                        case 15:
                            var blinkyPos = this.game.ghosts[1].getPosition();
                            break;
                        case 16:
                            var blinkyPos = this.game.ghosts[2].getPosition();
                            break;
                        case 17:
                            var blinkyPos = this.game.ghosts[3].getPosition();
                            break;
                        case 18:
                            var blinkyPos = this.game.ghosts[4].getPosition();
                            break;
                        case 19:
                            var blinkyPos = this.game.ghosts[5].getPosition();
                            break;
                        case 20:
                            var blinkyPos = this.game.ghosts[6].getPosition();
                            break;
                    }
                    var pacmanPos = this.game.pacman.getPosition();
                    var diff = Phaser.Point.subtract(pacmanPos, blinkyPos);
                    var dest = Phaser.Point.add(pacmanPos, diff);
                    if (dest.x < this.gridsize/2) dest.x = this.gridsize/2;
                    if (dest.x > this.game.map.widthInPixels - this.gridsize/2) dest.x = this.game.map.widthInPixels - this.gridsize/2;
                    if (dest.y < this.gridsize/2) dest.y = this.gridsize/2;
                    if (dest.y > this.game.map.heightInPixels - this.gridsize/2) dest.y = this.game.map.heightInPixels - this.gridsize/2;
                    return dest;
                }
                
            case "clyde":
                var pacmanPos = this.game.pacman.getPosition();
                var clydePos = this.getPosition();
                if (clydePos.distance(pacmanPos) > 8 * this.gridsize) {
                    return pacmanPos;
                } else {
                    return new Phaser.Point(this.scatterDestination.x, this.scatterDestination.y);
                }
                
            default:
                return new Phaser.Point(this.scatterDestination.x, this.scatterDestination.y);
        }
    },
    
    getPosition: function() {
        var x = this.game.math.snapToFloor(Math.floor(this.ghost.x), this.gridsize) / this.gridsize;
        var y = this.game.math.snapToFloor(Math.floor(this.ghost.y), this.gridsize) / this.gridsize;
        return new Phaser.Point((x * this.gridsize) + (this.gridsize / 2), (y * this.gridsize) + (this.gridsize / 2));
    },
    
    move: function(dir) {
        this.currentDir = dir;
        
        var speed;
        if (this.mode === this.SCATTER) {
            speed = this.ghostScatterSpeed;
        } else if (this.mode === this.RANDOM) {
            speed = this.ghostFrightenedSpeed;
        } else if (this.mode === this.RETURNING_HOME) {
            speed = this.cruiseSpeed;
            // this.ghost.animations.play(dir+20);
        } else {
            speed = this.ghostSpeed;
            // this.ghost.animations.play(dir);
            if (this.game.mode === "normal")
            {
                if (this.name === "blinky" && this.game.numKeys === 2) {
                    speed = this.cruiseSpeed;
                } else if (this.name === "blinky" && this.game.numKeys < 2) {
                    speed = this.ElroySpeed;
                }
            }
        }
        
        if (this.currentDir === Phaser.NONE) {
            this.ghost.body.velocity.x = this.ghost.body.velocity.y = 0;
            return;
        }

        if (dir === Phaser.LEFT || dir === Phaser.UP)
            speed = -speed;

        if (dir === Phaser.LEFT || dir === Phaser.RIGHT) {
            this.ghost.body.velocity.x = speed;
        } else {
            this.ghost.body.velocity.y = speed;
        }
    },
    
    scatter: function() {
        if (!this.game.pacman.isDead && !this.game.gameWin && this.mode !== this.RETURNING_HOME) {
            // this.ghost.animations.play(this.currentDir);
            if (this.mode !== this.AT_HOME && this.mode !== this.EXIT_HOME) {
                this.mode = this.SCATTER;
            }
        }
    },

    respawn: function() {
        this.ghost.x = this.startPos.x * this.gridsize + this.gridsize/2;
        this.ghost.y = this.startPos.y * this.gridsize + this.gridsize/2;
        this.ghost.body.reset(this.startPos.x * this.gridsize + this.gridsize/2, this.startPos.y * this.gridsize + this.gridsize/2);
        this.currentDir = this.startDir;
        if (this.name === "blinky") this.mode = this.SCATTER;
        else {
            this.mode = this.AT_HOME;
            this.game.gimeMeExitOrder(this);
        }
    }
};
