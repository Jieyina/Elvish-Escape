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
        this.safetile = [-1, 18];
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

    moveLeft()
    {
        this.moveTo.x=-1;
        this.moveTo.y=0;
        this.sprite.anims.play(this.anim.Eat, true);
        this.sprite.angle = 180;
    }

    moveRight()
    {
        this.moveTo.x=1;
        this.moveTo.y=0;
        this.sprite.anims.play(this.anim.Eat, true);
        this.sprite.angle = 0;
    }

    moveUp()
    {
        this.moveTo.x=0;
        this.moveTo.y=-1;
        this.sprite.anims.play(this.anim.Eat, true);
        this.sprite.angle = 270;
    }

    moveDown()
    {
        this.moveTo.x=0;
        this.moveTo.y=1;
        this.sprite.anims.play(this.anim.Eat, true);
        this.sprite.angle = 90;
    }

    update()
    {
        this.sprite.setVelocity(this.moveTo.x * this.speed,  this.moveTo.y * this.speed);
        this.turn();
    }

    setDirections(directions) {
        this.directions = directions;
    }

    setTurningPoint(turningPoint) {
        this.turningPoint=turningPoint;
    }


    setTurn(turnTo)
    {
        if (!this.active || !this.directions[turnTo] || this.turning === turnTo || this.current === turnTo || !this.isSafe(this.directions[turnTo].index)) {
            return false;
        }

        if(this.opposites[turnTo] && this.opposites[turnTo] === this.current) {
            this.move(turnTo);
            this.turning = Phaser.NONE;
            this.turningPoint = new Phaser.Geom.Point();
        }
        else {
            this.turning = turnTo;
        }
    }


    turn()
    {
        if(this.turning === Phaser.NONE) {
            return false;
        }

        //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
        if (!Phaser.Math.Within(this.sprite.x, this.turningPoint.x, this.threshold) || !Phaser.Math.Within(this.sprite.y, this.turningPoint.y, this.threshold))
        {
            return false;
        }        
        
        this.sprite.setPosition(this.turningPoint.x, this.turningPoint.y);
        this.move(this.turning);
        this.turning = Phaser.NONE;
        this.turningPoint = new Phaser.Geom.Point();
        return true;
    }

    move(direction)
    {
        this.playing = true;
        this.current=direction;

        switch(direction)
        {
            case Phaser.LEFT:
            this.moveLeft();
            break;

            case Phaser.RIGHT:
            this.moveRight();
            break;

            case Phaser.UP:
            this.moveUp();
            break;

            case Phaser.DOWN:
            this.moveDown();
            break;
        }
    }

    isSafe(index) {
        for (let i of this.safetile) {
            if(i===index) return true;
        }

        return false;
    }

    drawDebug(graphics) 
    {
        let thickness = 4;
        let alpha = 1;
        let color = 0x00ff00;

        for (var t = 0; t < 9; t++)
        {
            if (this.directions[t] === null || this.directions[t] === undefined)
            {
                continue;
            }

            if (this.directions[t].index !== -1)
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