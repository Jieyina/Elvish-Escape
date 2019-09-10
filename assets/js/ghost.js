export default class Ghost {
    constructor(name, scene, position, anim)
    {
        this.name = name;
        this.sprite=scene.physics.add.sprite(position.x, position.y, 'ghost')
            .setScale(0.85)
            .setOrigin(0.5);
        this.spawnPoint=position;
        this.anim=anim;
        this.speed = 0;
        this.ghostSpeed = 100;
        this.ghostScatterSpeed = 75;
        this.ghostFrightenedSpeed = 50;
        this.ghostDestination = new Phaser.Math.Vector2();
        this.returnDestination = new Phaser.Math.Vector2(12 * 32 + 16, 9 * 32 + 16);
        this.cruiseElroySpeed = 110;
        this.moveTo = new Phaser.Geom.Point();
        // empty tile
        this.safetile = -1;
        // empty tile or gate
        this.safetileReturn = [-1, 19];
        this.directions = [];
        // Phaser.left/right/up/down/none = 7/8/5/6/4
        this.opposites = [ null, null, null, null, Phaser.NONE, Phaser.DOWN, Phaser.UP, Phaser.RIGHT, Phaser.LEFT ];
        this.turning=Phaser.NONE;
        this.current=Phaser.NONE;
        this.turningPoint = new Phaser.Geom.Point();
        this.threshold = 5;
        this.rnd = new Phaser.Math.RandomDataGenerator();
        this.sprite.anims.play(anim.Move, true);
        this.turnCount=0;
        this.turnAtTime=[4, 8, 16, 32, 64];
        this.turnAt=this.rnd.pick(this.turnAtTime);
        this.turnTimer = 0;
        this.turning_cooldown = 150;
        this.returning_cooldown = 100;
        this.RANDOM     = "random";
        this.SCATTER    = "scatter";
        this.CHASE      = "chase";
        this.STOP       = "stop";
        this.AT_HOME    = "at_home";
        this.EXIT_HOME  = "leaving_home";
        this.RETURNING_HOME = "returning_home";
        this.isAttacking = false;
        this.mode = this.AT_HOME;

        switch (this.name) {
            case "clyde":
                this.scatterDestination = new Phaser.Math.Vector2(0, 17 * 32);
                break;
            case "pinky":
                this.scatterDestination = new Phaser.Math.Vector2(0, 0);
                break;
            case "blinky":
                this.scatterDestination = new Phaser.Math.Vector2(24 * 32, 0);
                this.mode = this.SCATTER;
                break;
            case "inky":
                this.scatterDestination = new Phaser.Math.Vector2(24 * 32, 0);
                break;
            default:
                break;
        }
        
    }

    attack() {
        if (this.mode !== this.RETURNING_HOME) {
            this.isAttacking = true;
            /* if (this.mode !== this.AT_HOME && this.mode !== this.EXIT_HOME) {
                this.current = this.opposites[this.current];
            } */
        }
    }

    enterFrightenedMode() {
        if (this.mode !== this.AT_HOME && this.mode !== this.EXIT_HOME && this.mode !== this.RETURNING_HOME) {
            this.sprite.anims.play('ghost-frightened', true);
            this.mode = this.RANDOM;
            this.isAttacking = false;
        }
    }

    freeze() {
        this.moveTo = new Phaser.Geom.Point();
        this.current = Phaser.NONE;
    }

    respawn() {       
        this.sprite.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.move(this.rnd.pick([Phaser.UP, Phaser.DOWN]));
        this.sprite.flipX = false;
    }

    setDirections(directions) {
        this.directions = directions;
    }

    setTurningPoint(turningPoint) {
        this.turningPoint=turningPoint;
    }

    setTurnTimer(time)
    {
        this.turnTimer = time;
    }


    move(direction)
    {
        this.current = direction;

        this.speed = this.ghostSpeed;
        if (this.mode == this.SCATTER) {
            this.speed = this.ghostScatterSpeed;
        }
        if (this.mode == this.RANDOM) {
            this.speed = this.ghostFrightenedSpeed;
        } else if (this.mode == this.RETURNING_HOME) {
            this.speed = this.cruiseElroySpeed;
        }

        if (this.current === Phaser.NONE) {
            this.sprite.setVelocity(0, 0);
            return;
        }

        if (direction === Phaser.LEFT || direction === Phaser.UP) {
            this.speed = -this.speed;
        }
        if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
            this.sprite.setVelocityX(this.speed);
        } else if (direction === Phaser.UP || direction === Phaser.DOWN){
            this.sprite.setVelocityY(this.speed);
        }
    }

    isSafe(index) {
        if (this.mode == this.RETURNING_HOME && this.mode == this.EXIT_HOME)
        {
            for (let i of this.safetileReturn) {
                if(i===index) return true;
            }
        } else {
            if(index === this.safetile) return true;
        }
        return false;
    }

    hasReachedHome() {
        if (this.sprite.x < 9 * 32 || this.sprite.x > 16 * 32 ||
            this.sprite.y < 9 * 32 || this.sprite.y > 11 * 32) {
            return false;
        }
        return true;
    }

    scatter() {
        if (this.mode !== this.RETURNING_HOME) {
            this.isAttacking = false;
            if (this.mode !== this.AT_HOME && this.mode !== this.EXIT_HOME) {
                this.mode = this.SCATTER;
            }
        }
    }

    drawDebug(graphics) 
    {        
        let thickness = 4;
        let alpha = 1;
        let color = 0x00ff00;        
        for (var t = 5; t < 9; t++)
        {
            if (this.directions[t] === null || this.directions[t] === undefined)
            {
                continue;
            }

            if ( !this.isSafe(this.directions[t].index))
            {
                color = 0xff0000;
            }
            else
            {
                color = 0x00ff00;
            }

            graphics.lineStyle(thickness, color, alpha);
            graphics.strokeRect(this.directions[t].pixelX, this.directions[t].pixelY, 32, 32);
        }

        color = 0x00ff00;
        graphics.lineStyle(thickness, color, alpha);
        graphics.strokeRect(this.turningPoint.x, this.turningPoint.y, 1, 1);

    }
}