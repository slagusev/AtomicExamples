// Atomic Component

var glmatrix = require("gl-matrix");
var quat = glmatrix.quat;
var vec3 = glmatrix.vec3;

var game = Atomic.game;
var node = self.node;

var cameraNode = game.cameraNode;

var onGround = true;
var isGrounded = true;
var okToJump = true;
var inAirTimer = 0.0;

var MOVE_FORCE = 64.8;
var INAIR_MOVE_FORCE = 4.32;
var BRAKE_FORCE = 7.2;
var JUMP_FORCE = 7.0;
var LAND_FORCE = 12;
var YAW_SENSITIVITY = 3.6;
var INAIR_THRESHOLD_TIME = 0.01;

var cameraMode = 0;

var yaw = 0;
var roll = 0;
var pitch = 0;

var moveForward = false;
var moveBackwards = false;
var moveLeft = false;
var moveRight = false;
var mouseMoveX = 0.0;
var mouseMoveY = 0.0;
var button0 = false;
var button1 = false;

var lastButton0 = false;
var lastButton1 = false;

var timer = 0.79;
var fallTimer = 1.5;

self.idle = true;
self.walk = false;
self.run = false;
self.jump = false;

rotationSpeed = 2;
//self.isFalling = false;

function start() {

    // Create rigidbody, and set non-zero mass so that the body becomes dynamic
    var body = node.createComponent("RigidBody");
    body.mass = 36.0;

    // Set zero angular factor so that physics doesn't turn the character on its own.
    // Instead we will control the character yaw manually
    body.angularFactor = [0, 0, 0];

    // Set the rigidbody to signal collision also when in rest, so that we get ground collisions properly
    body.collisionEventMode = Atomic.COLLISION_ALWAYS;

    // Set a capsule shape for collision
    var shape = node.createComponent("CollisionShape");
    shape.setCapsule(4, 8, [0, 4, 0]);
    
}

function fixedUpdate(timeStep) {

    var body = node.getComponent("RigidBody");

    // Update the in air timer. Reset if grounded
    /*if (!onGround)
    {
        inAirTimer += timeStep;
    }
    else
    {
        inAirTimer = 0.0;
    }*/

    // When character has been in air less than 1/10 second, it's still interpreted as being on ground
    var softGrounded = inAirTimer < INAIR_THRESHOLD_TIME;

    var rot = node.getRotation();

    var moveDir = [0, 0, 0];

    // Update movement & animation
    var velocity = body.getLinearVelocity();

    // Velocity on the XZ plane
    var planeVelocity = [velocity[0], 4.0, velocity[2]];

    if (cameraMode != 2) {
        if (moveForward) {
            vec3.add(moveDir, moveDir, [0, 0, 1])
        }
        if (moveBackwards) {
            vec3.add(moveDir, moveDir, [0, 0, 1])
        }
        if (moveLeft) {
            vec3.add(moveDir, moveDir, [0, 0, 1])
        }
        if (moveRight) {
            vec3.add(moveDir, moveDir, [0, 0, 1])
        }
    }

    if (vec3.length(moveDir) > 0.0)
        vec3.normalize(moveDir, moveDir);

    vec3.transformQuat(moveDir, moveDir, [rot[1], rot[2], rot[3], rot[0]]);
    vec3.scale(moveDir, moveDir, (softGrounded ? MOVE_FORCE : INAIR_MOVE_FORCE));
    body.applyImpulse(moveDir);

    if (softGrounded) {
        // When on ground, apply a braking force to limit maximum ground velocity
        vec3.negate(planeVelocity, planeVelocity);
        vec3.scale(planeVelocity, planeVelocity, BRAKE_FORCE);
        body.applyImpulse(planeVelocity);

        // Jump. Must release jump control inbetween jumps
        if (button0) {
            if (okToJump) {
                var jumpforce = [0, 108, 0];
                vec3.scale(jumpforce, jumpforce, JUMP_FORCE);
                body.applyImpulse(jumpforce);
                okToJump = false;
                isGrounded = false;
            }
        }
    }

    if (softGrounded && vec3.length(moveDir) > 0.0)
        self.idle = false;
    else
        self.idle = true;

    if (!okToJump){
        self.jump = true;
    } else {
        self.jump = false;
    }

    // Reset grounded flag for next frame
    //onGround = true;
    
}

function MoveCamera(timeStep) {

    // Movement speed as world units per second
    var MOVE_SPEED = 10.0;
    // Mouse sensitivity as degrees per pixel
    var MOUSE_SENSITIVITY = 0.1;

    //yaw = yaw + MOUSE_SENSITIVITY * mouseMoveX;
    //pitch = pitch + MOUSE_SENSITIVITY * mouseMoveY;

    /*if (pitch < -90)
        pitch = -90;

    if (pitch > 90)
        pitch = 90;￿￿*/

    // Construct new orientation for the camera scene node from yaw and pitch. Roll is fixed to zero
    //cameraNode.rotation = QuatFromEuler(pitch, yaw, 0.0);

    var speed = MOVE_SPEED * timeStep;

    if (moveForward)
        cameraNode.translate([0.0, 0.0, speed]);
    if (moveBackwards)
        cameraNode.translate([0.0, 0.0, -speed]);
    if (moveLeft)
        cameraNode.translate([-speed, 0.0, 0.0]);
    if (moveRight)
        cameraNode.translate([speed, 0.0, 0.0]);
        
}

function UpdateControls() {

    var input = game.input;

    moveForward = false;
    moveBackwards = false;
    moveLeft = false;
    moveRight = false;
    mouseMoveX = 0.0;
    mouseMoveY = 0.0;
    button0 = false;
    button1 = false;

    // Movement speed as world units per second
    var MOVE_SPEED = 20.0;
    // Mouse sensitivity as degrees per pixel
    var MOUSE_SENSITIVITY = 0.1;

    if (yaw >= 360)
    {
        yaw = 0;
    }
    else if (yaw <= 0)
    {
        yaw = 360;
    }


    // We set the default movement keys here
    if (input.getKeyDown(Atomic.KEY_W) || input.getKeyDown(Atomic.KEY_UP)) {
        if (yaw < 360 && yaw >= 180)
        {
            yaw += rotationSpeed;
        }
        if (yaw <= 180)
        {
            if (yaw != 0)
            {
                yaw -= rotationSpeed;
            }
        }
        moveForward = true;
    }
    if (input.getKeyDown(Atomic.KEY_S) || input.getKeyDown(Atomic.KEY_DOWN)) {
        if (yaw < 180)
        {
            yaw += rotationSpeed;
        }
        if (yaw > 180)
        {
            yaw -= rotationSpeed;
        }
        moveBackwards = true;
    }
    if (input.getKeyDown(Atomic.KEY_A) || input.getKeyDown(Atomic.KEY_LEFT)) {
        if (yaw > 270 && yaw <= 360)
        {
            yaw -= rotationSpeed;
        }
        if (yaw <= 89)
        {
            yaw -= rotationSpeed;
        }
        if (yaw < 270 && yaw >= 90)
        {
            yaw += rotationSpeed;
        }
        moveLeft = true;
    }
    if (input.getKeyDown(Atomic.KEY_D) || input.getKeyDown(Atomic.KEY_RIGHT)) {
        if (yaw > 90 && yaw <= 270)
        {
            yaw -= rotationSpeed;
        }
        if (yaw >= 270 || yaw < 90)
        {
            if (yaw != 90)
            {
                yaw += rotationSpeed;
            }
        }
        moveRight = true;
    }
    
    // This is the key for changing camera modes
    if (input.getKeyPress(Atomic.KEY_F)) {
        button1 = true;
    }
    // This is the key for jumping
    if (input.getKeyDown(Atomic.KEY_SPACE)) {
        button0 = true;
    }

    // Here we set the angled directions
    if (input.getKeyDown(Atomic.KEY_W) && input.getKeyDown(Atomic.KEY_A) || input.getKeyDown(Atomic.KEY_UP) && input.getKeyDown(Atomic.KEY_LEFT)) {
        if (yaw > 315 || yaw <= 180)
        {
            yaw -= rotationSpeed;
        }
        if (yaw >= 180 && yaw < 315)
        {
            if (yaw != 315)
            {
                yaw += rotationSpeed;
            }
        }
    }
    if (input.getKeyDown(Atomic.KEY_W) && input.getKeyDown(Atomic.KEY_D) || input.getKeyDown(Atomic.KEY_UP) && input.getKeyDown(Atomic.KEY_RIGHT)) {
        if (yaw > 45 && yaw <= 270)
        {
            yaw -= rotationSpeed;
        }
        if (yaw >= 270 || yaw < 45)
        {
            if (yaw != 45)
            {
                yaw += rotationSpeed;
            }
        }
    }
    if (input.getKeyDown(Atomic.KEY_S) && input.getKeyDown(Atomic.KEY_A) || input.getKeyDown(Atomic.KEY_DOWN) && input.getKeyDown(Atomic.KEY_LEFT)) {
        if (yaw > 225 || yaw <= 90)
        {
            yaw -= rotationSpeed;
        }
        if (yaw >= 90 && yaw < 225)
        {
            if (yaw != 225)
            {
                yaw += rotationSpeed;
            }
        }
    }
    if (input.getKeyDown(Atomic.KEY_S) && input.getKeyDown(Atomic.KEY_D) || input.getKeyDown(Atomic.KEY_DOWN) && input.getKeyDown(Atomic.KEY_RIGHT)) {
        if (yaw != 135)
        {
            if (yaw > 135 && yaw <= 315)
            {
                yaw -= rotationSpeed;
            }
            if (yaw >= 315 || yaw < 135)
            {
                yaw += rotationSpeed;
            }
        }
    }

    // Here we define if a default move key is pressed, it should animate RoboMan
    if (input.getKeyDown(Atomic.KEY_W) || input.getKeyDown(Atomic.KEY_S) || input.getKeyDown(Atomic.KEY_A) || input.getKeyDown(Atomic.KEY_D) || input.getKeyDown(Atomic.KEY_UP) || input.getKeyDown(Atomic.KEY_DOWN) || input.getKeyDown(Atomic.KEY_LEFT) || input.getKeyDown(Atomic.KEY_RIGHT)) {
        // If RoboMan is NOT jumping we want to play walk animation
        if (!self.jump)
        {
            self.walk = true;
            self.run = false;
            
            // If we're not holding the run button down, we want the move force to be normal and walk animation to play
            if (!input.getKeyDown(Atomic.KEY_LSHIFT))
            {
                MOVE_FORCE = 64.8;
                self.walk = true;
                self.run = false;
            }
            // Else if we ARE holding the run button down WHILE pressing a move key, then we want RoboMan to play the run animation
            else
            {
                MOVE_FORCE = 129.6;
                self.walk = false;
                self.run = true;
            }
        }
        // Else if we are jumping, we don't want to play either the run or walk animations
        else
        {
            self.walk = false;
            self.run = false;
            
            if (!input.getKeyDown(Atomic.KEY_LSHIFT))
            {
                MOVE_FORCE = 64.8;
                self.walk = false;
                self.run = false;
            }
            else
            {
                MOVE_FORCE = 129.6;
                self.walk = false;
                self.run = false;
            }
        }
    }
    // If we're not pressing a move key we normally want to play the idle animation on RoboMan
    else
    {
        if (!self.jump)
        {
            self.idle = true;
            self.walk = false;
            self.run = false;
            
            if (input.getKeyDown(Atomic.KEY_LSHIFT))
            {
                self.idle = true;
            }
        }
        // Here we want to play the jump animation even though we're only moving in the Y axis!
        else
        {
            self.idle = false;
            
            if (input.getKeyDown(Atomic.KEY_LSHIFT))
            {
                self.idle = false;
            }
        } 
    }

    //mouseMoveX = input.getMouseMoveX();
    //mouseMoveY = input.getMouseMoveY();
    
}

function update(timeStep) {

    /*if (yaw >= 360)
        yaw = 0;
    else if (yaw <= 0)
        yaw = 0;*/

    UpdateControls();

    /*if (cameraMode != 2) {
        yaw += mouseMoveX * YAW_SENSITIVITY;
        pitch += mouseMoveY * YAW_SENSITIVITY;
    }*/

    if (!okToJump) {
        timer -= timeStep;//0.0048;
    }

    if (timer <= 0) {
        okToJump = true;
        isGrounded = true;
        onGround = true;
        timer = 0.79;
    } else if (timer < 0.69 && timer > 0.1) {
        okToJump = false;
    }

    /*if (pitch < -80)
        pitch = -80;
    if (pitch > 80)
        pitch = 80;*/

    if (button1) {
        cameraMode++;
        if (cameraMode == 3)
            cameraMode = 0;
    }
    
}

function postUpdate(timestep) {

    // Get camera lookat dir from character yaw + pitch
    var rot = node.getRotation();

    dir = quat.create();
    //quat.setAxisAngle(dir, [1, 0, 0], (pitch * Math.PI / 180.0));

    //quat.multiply(dir, [rot[1], rot[2], rot[3], rot[0]], dir);

    var headNode = node.getChild("Head_Tip", true);

    if (cameraMode == 1) {
        var headPos = headNode.getWorldPosition();
        var offset = [0.0, 0.15, 0.2];
        vec3.add(headPos, headPos, vec3.transformQuat(offset, offset, [rot[1], rot[2], rot[3], rot[0]]));
        cameraNode.setPosition(headPos);
        cameraNode.setRotation([dir[3], dir[0], dir[1], dir[2]]);
        quat.setAxisAngle(dir, [0, 1, 0], (yaw * Math.PI / 180.0));
        node.setRotation([dir[3], dir[0], dir[1], dir[2]]);
    }
    if (cameraMode == 0) {
        var aimPoint = node.getPosition();
        var aimOffset = [0, 5, -15];
        //var rotPoint = cameraNode.getRotation();
        //var rotOffset = [0, 0, 0];
        vec3.transformQuat(aimOffset, aimOffset, dir);
        vec3.add(aimPoint, aimPoint, aimOffset);

        var rayDir = vec3.create();
        vec3.transformQuat(rayDir, [0, 0, -0.5], dir);
        vec3.scale(rayDir, rayDir, 8);

        vec3.add(aimPoint, aimPoint, rayDir);

        cameraNode.setPosition(aimPoint);
        cameraNode.setRotation([dir[3], dir[0], dir[1], dir[2]]);
        quat.setAxisAngle(dir, [0, 1, 0], (yaw * Math.PI / 180.0));
        //quat.setAxisAngle(dir, [0, 0, 1], (roll * Math.PI / 180.0));
        node.setRotation([dir[3], dir[0], dir[1], dir[2]]);
    }
    //else
    //MoveCamera(timestep);
    
}