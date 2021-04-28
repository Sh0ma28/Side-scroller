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
imgPlayer.src = "img/player.png";

var imgEnemy = new Image ();
imgEnemy.src = "img/enemy.png";

var imgObstacle = new Image ();
imgObstacle.src = "img/obstacle.png";

var imgExplosion = new Image ();
imgExplosion.src = "img/explosion.png"

var background = new Image ();
background.src = "img/background.png";

var player;
var enemies = [];
var obstacles = [];
var bullets = [];

var isPlaying;

var k = 5;
var score = 0;
var time = 0;

var timeDeath;
var explodeX;
var explodeY;

var spawnTime = 300;
var spawnEnemiesAmout = 4;
var spawnObstaclesAmout = 2;



function init() {
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");

	context.width = gameWidth;
	context.height = gameHeight;

	player = new Player ();

	startLoop();

	document.addEventListener("keydown", checkKeyDown);
	document.addEventListener("keyup", checkKeyUp);
}

function spawnCreatures (enemiesCount, obstaclesCount) {
	if(enemies.length == 0 &&
		obstacles.length == 0){
		for(var i = 0; i < enemiesCount; i++){
			enemies[i] = new Enemy ();
		}
		for(var i = 0; i < obstaclesCount; i++){
			obstacles[i] = new Obstacle ();
		}
	}
}

function loop() {
	if(isPlaying){
		spawnCreatures(1 + Math.random() * spawnEnemiesAmout, 1 + Math.random() * spawnObstaclesAmout);
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
	for (i in bullets) bullets[i].draw();
	for (i in enemies) enemies[i].draw();
	for (i in obstacles) obstacles[i].draw();
	if (time < timeDeath + 20) 
		drawExplosion();
	context.fillStyle = "#00F";
	context.font = "italic 36pt Arial";
	context.textBaseline = "top";
	context.fillText("Score: " + score, gameWidth / 2, 10);
}

function update() {
	player.update();
	for (i in bullets) bullets[i].update();
	for (i in enemies) enemies[i].update();
	for (i in obstacles) obstacles[i].update();
	time++;
	if(time % 60 == 0) score += 10;
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

	this.isFire = false;

	this.health = 4;
	this.isInvulnerable = false;
	this.invulnerableTime = 0;
}

Player.prototype.draw = function () {
	context.drawImage (imgPlayer, this.x, this.y, this.width, this.height);
	context.fillStyle = '#FF0000';
	for(var i = 0; i < this.health; i++){
		context.fillRect(10 + 100*i, 10, 100, 36);
	}
}


Player.prototype.update = function () {
	this.borders();

	this.checkInvulnerable();

	this.checkCollusions();

	this.movement();
}

Player.prototype.borders = function () {
	if(this.x < 0) this.x = 0;
	if(this.y < 0) this.y = 0;
	if(this.x > gameWidth / 2 )
		this.x = gameWidth / 2;
	if(this.y > gameHeight - this.height)
		this.y = gameHeight - this.height;
}

Player.prototype.checkInvulnerable = function () {
	if(this.isInvulnerable)
		this.invulnerableTime--;
	if(this.invulnerableTime == 0)
		this.isInvulnerable = false
}

Player.prototype.checkCollusions = function () {
	for(i in enemies){
		if(this.x + this.width > enemies[i].x &&
		this.y + this.height > enemies[i].y &&
		this.x < enemies[i].x + enemies[i].width &&
		this.y < enemies[i].y + enemies[i].height &&
		!this.isInvulnerable){
			this.health--;
			this.isInvulnerable = true;
			this.invulnerableTime = 300;
			enemies[i].destroy();
		}
	}
	for(i in obstacles){
		if(this.x + this.width > obstacles[i].x &&
		this.y + this.height > obstacles[i].y &&
		this.x < obstacles[i].x + obstacles[i].width &&
		this.y < obstacles[i].y + obstacles[i].height &&
		!this.isInvulnerable){
			this.health--;
			this.isInvulnerable = true;
			this.invulnerableTime = 300;
			obstacles[i].destroy();
		}
	}
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
	if(this.isFire && time % 30 == 0) 
		bullets[bullets.length] = new Bullet();
}

function Bullet () {
	this.width = 30;
	this.height = 10;
	this.x = player.x + player.width;
	this.y = player.y + player.height / 2 - this.height / 2;
	this.speed = 15;
}

Bullet.prototype.draw = function () {
	context.fillStyle = '#FFFF00';
	context.fillRect(this.x, this.y, this.width, this.height);
}

Bullet.prototype.update = function () {
	this.x += this.speed;
	if(this.x > gameWidth){
		this.destroy();
	}
	this.checkCollusions();
}

Bullet.prototype.checkCollusions = function () {
	for(i in enemies){
		if(this.x + this.width > enemies[i].x &&
		this.y + this.height > enemies[i].y &&
		this.x < enemies[i].x + enemies[i].width &&
		this.y < enemies[i].y + enemies[i].height){
			enemies[i].health--;
			score += 10;
			this.destroy();
			break;
		}
	}
	for(i in obstacles){
		if(this.x + this.width > obstacles[i].x &&
		this.y + this.height > obstacles[i].y &&
		this.x < obstacles[i].x + obstacles[i].width &&
		this.y < obstacles[i].y + obstacles[i].height){
			obstacles[i].health--;
			score += 5;
			this.destroy();
			break;
		}
	}
}

Bullet.prototype.destroy = function () {
	bullets.splice(bullets.indexOf(this), 1);
}


// Класс Enemy
function Enemy() {
	this.width = 100;
	this.height = 60;
	this.x = gameWidth + this.width + Math.random() * this.width * k;
	this.y = Math.random() * (gameHeight - this.height);
	this.speed = 5;
	this.health = 3;
}

Enemy.prototype.draw = function () {
	context.drawImage (imgEnemy, this.x, this.y, this.width, this.height);
}

Enemy.prototype.update = function () {
	this.x -= this.speed;
	if(this.x + this.width < 0 || this.health == 0){
		this.destroy();
	}
}

Enemy.prototype.destroy = function () {
	timeDeath = time;
	explodeX = this.x;
	explodeY = this.y;
	enemies.splice(enemies.indexOf(this), 1);
}



// Класс Obstacle
function Obstacle() {
	this.width = 100;
	this.height = 100;
	this.x = gameWidth + this.width + Math.random() * this.width * k;
	this.y = Math.random() * (gameHeight - this.height);
	this.speed = 3;
	this.health = 5;
}

Obstacle.prototype.draw = function () {
	context.drawImage (imgObstacle, this.x, this.y, this.width, this.height);
}

Obstacle.prototype.update = function () {
	this.x -= this.speed;
	if(this.x + this.width < 0 || this.health == 0){
		this.destroy();
	}
}

Obstacle.prototype.destroy = function () {
	timeDeath = time;
	explodeX = this.x;
	explodeY = this.y;
	obstacles.splice(obstacles.indexOf(this), 1);
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
		case 'Space':
			player.isFire = true;
			e.preventDefault();
			break;
		default:
			e.preventDefault();
			break;
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
		case 'Space':
			player.isFire = false;
			e.preventDefault();
			break;
		default:
			e.preventDefault();
			break;
	}
}

function clear() {
	context.clearRect(0, 0, gameWidth, gameHeight);
}

function drawExplosion () {
	context.drawImage(imgExplosion, explodeX, explodeY, 100, 100);
}

function drawBackground() {
	clear();
	context.drawImage(background, 0, 0, gameWidth, gameHeight);
}