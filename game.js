// A cross-browser requestAnimationFrame
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.onload = init;

var canvas;
var context;

var gameWidth = 1000;
var gameHeight = 700;

var imgPlayer = new Image ();
imgPlayer.src = "img/1.png";

var imgEnemy = new Image ();
imgEnemy.src = "img/2.png";

var background = new Image ();
background.src = "img/bg.png";

var player;
var enemies = [];

var isPlaying;

var k = 5;

function init() {
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");

	context.width = gameWidth;
	context.height = gameHeight;

	player = new Player ();
	spawnEnemy(5);

	startLoop();

	document.addEventListener("keydown", checkKeyDown);
	document.addEventListener("keyup", checkKeyUp);
}

function spawnEnemy (count) {
	for(var i = 0; i < count; i++){
		enemies[i] = new Enemy ();
	}
}

function loop() {
	if(isPlaying){
		draw();
		update();
		requestAnimFrame(loop);
	}
}

function startLoop() {
	isPlaying = true;
	loop();
}

function stopLoop() {
	isPlaying = false;
}

function draw() {
	drawBackground();
	player.draw();
	for (i in enemies) enemies[i].draw();
}

function update() {
	player.update();
	for (i in enemies) enemies[i].update();
}

// Класс Player
function Player() {
	this.x = 0;
	this.y = 250;
	this.width = 100;
	this.height = 100;

	// движение
	this.isUp = false;
	this.isDown = false;
	this.isLeft = false;
	this.isRight = false;

	this.speed = 7;
}

Player.prototype.draw = function () {
	context.drawImage (imgPlayer, this.x, this.y, this.width, this.height);
}

Player.prototype.update = function () {
	if(this.x < 0) this.x = 0;
	if(this.y < 0) this.y = 0;
	if(this.x > gameWidth / 2 )
		this.x = gameWidth / 2;
	if(this.y > gameHeight - this.height)
		this.y = gameHeight - this.height;

	this.movement();
}

Player.prototype.movement = function () {
	if(this.isUp)
		this.y -= this.speed;
	if(this.isDown)
		this.y += this.speed;
	if(this.isLeft)
		this.x -= this.speed;
	if(this.isRight)
		this.x += this.speed;
}

// Класс Enemy
function Enemy() {
	this.width = 100;
	this.height = 60;
	this.x = gameWidth + this.width + Math.random() * this.width * k;
	this.y = Math.random() * (gameHeight - this.height);
	this.speed = 4;
}

Enemy.prototype.draw = function () {
	context.drawImage (imgEnemy, this.x, this.y, this.width, this.height);
}

Enemy.prototype.update = function () {
	this.x -= this.speed;
	if(this.x < 0 - this.width){
		this.x = gameWidth + this.width + Math.random() * this.width * k;
		this.y = Math.random() * (gameHeight - this.height);
	}
}

function checkKeyDown (e) {
	switch(e.code){
		case 'KeyW':
		case 'ArrowUp':
			player.isUp = true;
			e.preventDefault();
			break;
		case 'KeyA':
		case 'ArrowLeft':
			player.isLeft = true;
			e.preventDefault();
			break;
		case 'KeyS':
		case 'ArrowDown':
			player.isDown = true;
			e.preventDefault();
			break;
		case 'KeyD':
		case 'ArrowRight':
			player.isRight = true;
			e.preventDefault();
			break;
		default:
		e.preventDefault();
	}
}

function checkKeyUp (e) {
	switch(e.code){
		case 'KeyW':
		case 'ArrowUp':
			player.isUp = false;
			e.preventDefault();
			break;
		case 'KeyA':
		case 'ArrowLeft':
			player.isLeft = false;
			e.preventDefault();
			break;
		case 'KeyS':
		case 'ArrowDown':
			player.isDown = false;
			e.preventDefault();
			break;
		case 'KeyD':
		case 'ArrowRight':
			player.isRight = false;
			e.preventDefault();
			break;
		default:
		e.preventDefault();
	}
}

function clear() {
	context.clearRect(0, 0, gameWidth, gameHeight);
}

function drawBackground() {
	clear();
	context.drawImage(background, 0, 0, gameWidth, gameHeight);
}



