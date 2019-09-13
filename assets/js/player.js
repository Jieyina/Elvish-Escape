export default class Player {
    constructor(scene, position, anim, dieCallback)
    {       
        this.sprite=scene.physics.add.sprite(position.x, position.y, 'pacman')
            .setScale(0.9)
            .setOrigin(0.5);
        this.spawnPoint=position;
        this.anim=anim;        
        this.dieCallback=dieCallback;
        this.speed = 95;
        this.moveTo = new Phaser.Geom.Point();
        this.sprite.angle = 180;
        this.safetile = -1;
        this.directions = [];
        this.opposites = [ null, null, null, null, null, Phaser.DOWN, Phaser.UP, Phaser.RIGHT, Phaser.LEFT ];        
        this.turning=Phaser.NONE;
        this.current = Phaser.NONE;
        this.turningPoint = new Phaser.Geom.Point();
        this.threshold = 5;
        this.life = 3;
        this.score=0;
        this.active=true;
        this.sprite.anims.play(this.anim.Stay, true);
        let ref=this;
        this.want2go = Phaser.NONE;
        this.sprite.on('animationcomplete', function(animation, frame) {
            ref.animComplete(animation, frame);
        }, scene);
        this.playing = false;
    }

    die() {
        this.active=false;
        this.playing=false;
        this.life--;
        this.moveTo = new Phaser.Geom.Point();
        this.sprite.anims.play(this.anim.Die, true);
    }

    animComplete (animation, frame)
    {        
        if(animation.key==this.anim.Die) {
            this.dieCallback();
        }
    }

    respawn() {
        this.active=true;
        this.playing = false;
        this.sprite.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.moveTo = new Phaser.Geom.Point();
        this.sprite.anims.play(this.anim.Stay, true);
        this.sprite.angle = 180;
        this.turning = Phaser.NONE;
        this.current = Phaser.NONE;
    }

    update()
    {
        if (this.turning !== Phaser.NONE)
        {
            this.turn();
        }
    }

    setDirections(directions) {
        this.directions = directions;
    }

    setTurningPoint(turningPoint) {
        this.turningPoint=turningPoint;
    }


    turn()
    {
        //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
        if (!Phaser.Math.Within(Math.floor(this.sprite.x), this.turningPoint.x, this.threshold) || !Phaser.Math.Within(Math.floor(this.sprite.y), this.turningPoint.y, this.threshold))
        {
            return false;
        }
        
        this.sprite.setPosition(this.turningPoint.x, this.turningPoint.y);
        this.move(this.turning);
        this.turning = Phaser.NONE;
        return true;
    }

    move(direction)
    {
        this.playing = true;

        this.current = direction;

        if (direction === Phaser.NONE) {
            this.sprite.velocity.x = this.sprite.velocity.y = 0;
            return;
        }

        var speed = this.speed;

        if (direction === Phaser.LEFT || direction === Phaser.UP)
        {
            speed = -speed;
        }

        if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
        {
            this.sprite.setVelocityX(speed);
        }
        else
        {
            console.log("move up");
            this.sprite.setVelocityY(speed);
        }

        if (direction === Phaser.LEFT)
        {
            this.sprite.anims.play(this.anim.Eat, true);
            this.sprite.angle = 180;
        }
        else if (direction === Phaser.RIGHT)
        {
            this.sprite.anims.play(this.anim.Eat, true);
            this.sprite.angle = 0;
        }
        else if (direction === Phaser.UP)
        {
            this.sprite.anims.play(this.anim.Eat, true);
            this.sprite.angle = 270;
        }
        else if (direction === Phaser.DOWN)
        {
            this.sprite.anims.play(this.anim.Eat, true);
            this.sprite.angle = 90;
        }
    }

    checkKeys(cursors) {
        if (cursors.left.isDown ||
            cursors.right.isDown ||
            cursors.up.isDown ||
            cursors.down.isDown) {
        }

        if (cursors.left.isDown && this.current !== Phaser.LEFT)
        {
            this.want2go = Phaser.LEFT;
        }
        else if (cursors.right.isDown && this.current !== Phaser.RIGHT)
        {
            this.want2go = Phaser.RIGHT;
        }
        else if (cursors.up.isDown && this.current !== Phaser.UP)
        {
            this.want2go = Phaser.UP;
        }
        else if (cursors.down.isDown && this.current !== Phaser.DOWN)
        {
            this.want2go = Phaser.DOWN;
        }
            this.checkDirection(this.want2go);
    }

    checkDirection(turnTo) {
        if (!this.active || this.turning === turnTo || this.directions[turnTo] === null || this.directions[turnTo].index !== this.safetile)
        {
            return;
        }

        //  Check if they want to turn around and can
        if (this.current === this.opposites[turnTo])
        {
            this.move(turnTo);
        }
        else
        {
            this.turning = turnTo;
            this.want2go = Phaser.NONE;
        }
    }
}