var Sounds = function(game) {
    this.game = game;

    this.bgm;
    this.bgm_attack;
    
    this.player_slash;
    this.player_death;
    this.player_pickup_key;
    
    this.enemy_death;
};

Sounds.prototype.loadAllSounds = function() {
    this.game.load.audio('bgm', 'assets/audio/bgm.wav');
    this.game.load.audio('bgm-attack', 'assets/audio/bgm-attack.wav');
    this.game.load.audio('enemy-death', 'assets/audio/enemy-death.wav');
    this.game.load.audio('player-death', 'assets/audio/player-death.wav');
    this.game.load.audio('player-pickup-key', 'assets/audio/player-pickup-key.wav');
    this.game.load.audio('player-slash', 'assets/audio/player-slash.wav');
}

Sounds.prototype.createAllInstances = function() {
    this.bgm = this.game.add.audio('bgm', 1, true);
    this.bgm_attack = this.game.add.audio('bgm-attack', 1, true);
    
    this.player_slash = this.game.add.audio('player-slash', 1,  false);
    this.enemy_death = this.game.add.audio('enemy-death', 1, false);

    this.player_death = this.game.add.audio('player-death', 1, false);
    this.player_pickup_key = this.game.add.audio('player-pickup-key', 1, false);
    
}

Sounds.prototype.playBgm = function() {
    this.bgm.play();
    this.bgm_attack.stop();
};

Sounds.prototype.playBgmAttack = function() {
    this.bgm.stop();
    this.bgm_attack.play();
};

Sounds.prototype.playKillEnemy = function() {
    this.player_slash.play();
    this.enemy_death.play();
}

Sounds.prototype.playPlayerDeath = function() {
    this.player_death.play();
}

Sounds.prototype.playPickupKey = function() {
    this.player_pickup_key.play();
}