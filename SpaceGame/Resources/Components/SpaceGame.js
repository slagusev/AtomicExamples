var game = Atomic.game;
var scene = game.scene;

// expose ourselves as a global
SpaceGame = self;

self.halfWidth = game.graphics.width * Atomic.PIXEL_SIZE * 0.5;
self.halfHeight = game.graphics.height * Atomic.PIXEL_SIZE * 0.5;

var enemyBaseDir = false;
var enemyBaseNode = scene.createChild("EnemyBaseNode");
var enemyBasePosX = 0;

var score = 0;

self.enemies = [];
self.gameOver = false;

self.random = function random(min, max) {
    return Math.random() * (max - min) + min;
}

self.spawnBullet = function(pos, isPlayer) {

    var bulletNode = scene.createChild("Bullet");
    var bullet = bulletNode.createJSComponent("Bullet");
    bullet.init(isPlayer, pos);
}

self.removeEnemy = function(enemy) {

    score += 10;

    self.hud.updateScore(score);

    self.enemies.splice(self.enemies.indexOf(enemy), 1);
    Atomic.destroy(enemy.node);
    return;

}

self.capitalShipDestroyed = function() {

    score += 1000;

    self.hud.updateScore(score);

    Atomic.destroy(self.capitalShipNode);
    self.capitalShipNode = self.capitalShip = null;

}

function spawnSpace() {

    var spaceNode = scene.createChild("Space");
    spaceNode.createJSComponent("Space");

}

function spawnEnemies() {

    self.capitalShipNode = scene.createChild("CapitalShip");
    self.capitalShip = self.capitalShipNode.createJSComponent("CapitalShip");

    var pos = [0, 0];

    pos[1] = self.halfHeight - 2.5;

    for (var y = 0; y < 3; y++) {

        pos[0] = -4.5;

        for (var x = 0; x < 12; x++) {

            var enemyNode = enemyBaseNode.createChild("Enemy");
            enemy = enemyNode.createJSComponent("Enemy");
            enemy.spriteName = Math.random() < .85 ? "spaceship_louse" : "spaceship_scarab";
            enemy.spawnPosition = [pos[0], pos[1]];
            self.enemies.push(enemy);

            pos[0] += 0.75;

        }

        pos[1] -= 0.75;

    }

}

function updateEnemies(timeStep) {

    if (!enemyBaseDir)
        enemyBasePosX += timeStep;
    else
        enemyBasePosX -= timeStep;

    var xvalue = 2;

    if (enemyBasePosX > xvalue) {
        enemyBasePosX = xvalue;
        enemyBaseDir = !enemyBaseDir;
    }

    if (enemyBasePosX < -xvalue) {
        enemyBasePosX = -xvalue;
        enemyBaseDir = !enemyBaseDir;
    }

    enemyBaseNode.position2D = [enemyBasePosX, 0];

}

self.win = function() {

    self.hud.updateGameText("YOU WIN!!!!");
    self.gameOver = true;

}

self.lose = function() {

    self.hud.updateGameText("YOU LOSE!!!!");
    self.gameOver = true;

}

function spawnPlayer() {

    self.playerNode = scene.createChild("Player");
    self.player = self.playerNode.createJSComponent("Player");
}


function start() {

    self.hud = scene.createJSComponent("HUD");    

    spawnSpace();
    spawnPlayer();
    spawnEnemies();

    var musicFile = game.cache.getResource("Sound", "Music/battle.ogg");
    musicFile.looped = true;
    var musicNode = scene.createChild("MusicNode");
    var musicSource = musicNode.createComponent("SoundSource");
    musicSource.gain = .5;
    musicSource.soundType = Atomic.SOUND_MUSIC;
    musicSource.play(musicFile);    
}


function update(timeStep) {

    updateEnemies(timeStep);


}