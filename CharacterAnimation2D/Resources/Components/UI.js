// Atomic Component

var game = Atomic.game;
var node = self.node;

var ui = game.ui;
var root = ui.getRoot();

var font = game.cache.getResource("Font", "Fonts/Anonymous Pro.ttf");

var uiStyle = game.cache.getResource("XMLFile", "UI/DefaultStyle.xml");
root.defaultStyle = uiStyle;

var container = new Atomic.UIElement();
container.horizontalAlignment = Atomic.HA_RIGHT;
container.verticalAlignment = Atomic.VA_CENTER;
container.layoutMode = Atomic.LM_VERTICAL;

root.addChild(container);

var buttons = {};

function addButton(name, text, callback) {

    var button = new Atomic.Button();
    
    button.setName(name);
    button.setMinWidth(120);
    button.setMinHeight(24);

    var buttonText = new Atomic.Text();
    buttonText.text = text;
    buttonText.setFont(font, 12);
    buttonText.color = [0, 1, 0, 1];

    buttonText.horizontalAlignment = Atomic.HA_CENTER;
    buttonText.verticalAlignment = Atomic.VA_CENTER;
    button.addChild(buttonText); 
    container.addChild(button);
    button.setStyleAuto();   
    
    buttons[name] = callback;       
   
}

addButton("PlayIdle", "Idle", function() { TheImp.playAnimation("idle"); }); 
addButton("PlayRun", "Run", function() { TheImp.playAnimation("run"); }); 
addButton("PlayAttack", "Attack", function() { TheImp.playAnimation("attack"); });
addButton("PlayHit", "Hit", function() { TheImp.playAnimation("hit"); });
addButton("PlayDead", "Dead", function() { TheImp.playAnimation("dead"); }); 

self.onMouseClick = function(element) {

    var name = element.name;
    
    buttons[name]();
    
}

function start() {

    self.listenToEvent(null, "UIMouseClick", self.onMouseClick );
}

function update(timeStep) {

    

}

