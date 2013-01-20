var canvas = document.getElementById("mainGameCanvas");
var context = canvas.getContext("2d");

// Gets Animated Frames from the browser
window.requestAnimationFrame = (function () {
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
})();

var getMousePos = function (canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
};

//TODO: Remove this listener when gameState is not PLAYING
canvas.addEventListener("mousemove", function (event) {
    var mousePos = getMousePos(canvas, event);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
});

var mousePressed = 0;
document.body.onmousedown = function () {
    mousePressed += 1;
};
document.body.onmouseup = function () {
    mousePressed -= 1;
};

//A simple random generator
var random = function (min, max) {
    return Math.random() * (max - min) + min;
};

var AssetManager = function() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = {};
    this.downloadQueue = [];
};



//This is an Asset Manager Class for Images
AssetManager.prototype.queueDownload = function(path) {
    this.downloadQueue.push(path);
};

AssetManager.prototype.downloadAll = function(callback) {
    if(this.downloadQueue.length === 0) {
        callback();
    }

    for(var i = 0; i < this.downloadQueue.length; i++) {
        var path = this.downloadQueue[i];
        var img = new Image();
        var that = this;
        img.addEventListener("load", function() {
            console.log(this.src + ' is loaded');
            that.successCount += 1;
            if (that.isDone()) {
                callback();
            }
        }, false);
        img.addEventListener("error", function() {
            that.errorCount += 1;
            if (that.isDone()) {
                callback();
            }
        }, false);
        img.src = path;
        this.cache[path] = img;
    }
};

AssetManager.prototype.getAsset = function(path) {
    return this.cache[path];
};

AssetManager.prototype.isDone = function() {
    return (this.downloadQueue.length == this.errorCount + this.successCount);
};
