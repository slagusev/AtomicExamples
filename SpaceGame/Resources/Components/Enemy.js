var game = Atomic.game;
var node = self.node;

self.allowShoot = true;
self.shootDelta = 0;

var moveDelta = 0;

var dead = false;

self.onHit = function() {
    
    var expNode = game.scene.createChild("Explosion");
    var exp = expNode.createJSComponent("Explosion");
    exp.init(node.worldPosition2D);    
    SpaceGame.removeEnemy(self);
    
}

function start() {

    // install AI
    node.createJSComponent("AI");

    var spaceSheet = game.getSpriteSheet("Sprites/spacegame_sheet.xml");

    // add a sprite component to our node
    var sprite2D = node.createComponent("StaticSprite2D");
    sprite2D.blendMode = Atomic.BLEND_ALPHA;
    sprite2D.sprite = spaceSheet.getSprite(self.spriteName);

    node.position2D = self.spawnPosition;
    node.roll(180);
    node.scale2D = [0.65, 0.65];

    self.dir = (Math.random() > .5);


}

// update function called per frame with delta time
function update(timeStep) {

    var pos = node.position2D;
    var ppos = SpaceGame.playerNode.position2D;

    if (Math.random() > .98) {
        self.dir = !self.dir;
    }

    moveDelta += (self.dir ? timeStep * 4 : -timeStep * 4);

    pos = [self.spawnPosition[0], self.spawnPosition[1]];
    pos[1] += Math.sin(moveDelta) * .1;
    node.position2D = pos;

}