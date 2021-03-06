var game = Atomic.game;
var node = self.node;

Ground = self;

var idle = true;

node.position = [0, 0, 0];

node.scale = [20, 6, 20];

function start() {

    var cache = game.cache;

    var model = node.createComponent("StaticModel");
    model.setModel(cache.getResource("Model", "Models/Ground.mdl"));
    model.setMaterial(cache.getResource("Material", "Materials/Ground.xml"));

    model.castShadows = true;    
    
    var body = node.createComponent("RigidBody");
    body.isKinematic = true;
    body.collisionEventMode = Atomic.COLLISION_ALWAYS;
    
    var shape = node.createComponent("CollisionShape");
    shape.setTriangleMesh(model.getModel());
    shape.size = [1, 1, 1];
    shape.position = [0, 0, 0];
    
    //shape.enabled = true;
}

function update(timeStep) {

}