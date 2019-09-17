var Sounds = function(game) {
    this.game = game;
};

Sounds.prototype.loadAllSounds = function() {
    this.game.load.audio('bgm', 'assets/audio/bgm.wav');
    this.game.load.audio('bgm-attack', 'assets/audio/bgm-attack2.wav');
    this.game.load.audio('enemy-death', 'assets/audio/enemy-death.wav');
    this.game.load.audio('player-death', 'assets/audio/player-death.wav');
    this.game.load.audio('player-pickup-key', 'assets/audio/player-pickup-key.wav');
    this.game.load.audio('player-slash', 'assets/audio/player-slash.wav');
    this.game.load.audio('bgm-level-complete', 'assets/audio/bgm-level-complete.wav');
};

Sounds.prototype.createAllInstances = function() {
    this.bgm = this.game.add.audio('bgm', 1, true);
    this.bgm_attack = this.game.add.audio('bgm-attack', 1, true);
    this.player_slash = this.game.add.audio('player-slash', 1,  false);
    this.enemy_death = this.game.add.audio('enemy-death', 1, false);
    this.player_death = this.game.add.audio('player-death', 1, false);
    this.player_pickup_key = this.game.add.audio('player-pickup-key', 1, false);
    this.level_complete = this.game.add.audio('bgm-level-complete', 1, false);
    
};

Sounds.prototype.playBgm = function() {
    if (this.bgm_attack.isPlaying)
        this.bgm_attack.stop();
    if (this.bgm.isPlaying)
        this.bgm.restart();
    else this.bgm.play();
};

Sounds.prototype.playBgmAttack = function() {
    this.bgm.stop();
    this.bgm_attack.play();
};

Sounds.prototype.playKillEnemy = function() {
    this.player_slash.play();
    this.enemy_death.play();
};

Sounds.prototype.playPlayerDeath = function() {
    if (this.bgm_attack.isPlaying)
        this.bgm_attack.stop();
    if (this.bgm.isPlaying)
        this.bgm.stop();
    this.player_death.play();
};

Sounds.prototype.playPickupKey = function() {
    this.player_pickup_key.play();
};

Sounds.prototype.playLevelComplete = function() {
    this.level_complete.play();
    this.bgm.stop();
    this.bgm_attack.stop();
};

Sounds.prototype.clear = function() {
    this.bgm.destroy();
    this.bgm_attack.destroy();
    this.player_slash.destroy();
    this.enemy_death.destroy();
    this.player_death.destroy();
    this.player_pickup_key.destroy();
    this.level_complete.destroy();
};