// =================================
// Const
// =================================
var PI = Math.PI;
var PI_2 = PI * 2;

// =================================
// Config
// =================================
var defaultConfig = {
	duration: 2000,         // ms
	delay: 0,               // ms
	radius: 5,              // px
	amount: 100,            // particle number
	speed: 12,
	gravity: 0.03,
	friction: 0.96,
	reduction: 0.98,
	X: 0.5,
	Y: 0.3,
	launchspeed: -1,
	launchduration: 500,
	color: "#ff0000",

};

// =================================
// Main
// =================================
window.addEventListener("load", function () {
	Canvas.canvas = document.querySelector("canvas");
	Canvas.canvas.width = document.documentElement.clientWidth;
	Canvas.canvas.height = document.documentElement.clientHeight;
	if (Canvas.canvas.width > 980) {
		Canvas.canvas.height = Canvas.canvas.height * 0.85;

	} else {
		Canvas.canvas.height = Canvas.canvas.height * 0.5;
	}
	Canvas.context = Canvas.canvas.getContext("2d");
	Canvas.context.fillStyle = "rgba(0, 0, 0, 0.15)";

	for (var i = 0; i < 1000; i++) {
		var firework = new Firework({
			duration: 5000,
			X: Math.random() * 0.8 + 0.1,
			Y: 1,
			amount: 400,
			delay: 3000 * i,
			radius: 4,
			reduction: 0.992,
			friction: 0.95,
			speed: 25,
			launchspeed: -0.65,
			launchduration: Math.random() * 100 + 400,
			color: "hsl(" + Math.random() * 360 + ", 100%, 50%)"
		});
		Canvas.add(firework);
	}

	Canvas.start();
}, false);

// =================================
// Firework
// =================================
function Firework(config) {
	this.setConfig(config || {});
	this.particleImage = createParticleImage(this.radius, this.color);
	this.diameter = this.radius * 2;
	this.isActive = true;
	this.fadeoutOpacity = 1;
	this.launched = false;
}

Firework.prototype = {
	setConfig: function (config) {
		for (var key in defaultConfig) {
			if (config[key] === undefined) {
				this[key] = defaultConfig[key];
			} else {
				this[key] = config[key];
			}
		}
	},

	initlaunch: function () {

		var x = this.canvas.width * this.X;
		var y = this.canvas.height * this.Y;
		var vx = 0;
		var vy = this.launchspeed;
		this.launchparticle = new Launch(x, y, vx, vy);

	},

	switchstate: function (passed) {
		var launchtime = this.launchduration + this.delay;
		if (launchtime > passed) {
			this.launchupdate(passed);
			return;
		} else {

			if (this.launched === false) {
				this.launched = true;
				this.initParticles();
			}
		}
		this.update(passed);

	},
	launchupdate: function (passed) {
		if (this.isActive === false ||
			this.started(passed) === false) return;

		this.launchmove();
		this.launchrender();

	},

	update: function (passed) {
		if (this.isActive === false ||
			this.started(passed) === false) return;


		if (this.ended(passed)) {
			this.fadeout();
			return;
		}
		this.move();
		this.render();

	},

	initParticles: function () {
		this.particles = [];
		var l;
		l = this.launchparticle;
		var maxSpeed = (this.speed / 2) * (this.speed / 2);

		while (this.particles.length < this.amount) {
			var vx = (Math.random() - 0.5) * this.speed;
			var vy = (Math.random() - 0.5) * this.speed;
			if (vx * vx + vy * vy <= maxSpeed) {
				this.particles.push(new Particle(l.x, l.y, vx, vy));
			}
		}
	},

	launchmove: function () {
		var particles;
		var particle;
		particle = this.launchparticle;
		particle.vx = 0;
		particle.vy = particle.vy * this.friction + this.gravity + this.launchspeed;
		particle.x += particle.vx;
		particle.y += particle.vy;
	},


	move: function () {
		var particles = this.particles;
		var particle;
		for (var i = 0, len = particles.length; i < len; i++) {
			particle = particles[i];
			particle.vx *= this.friction;
			particle.vy = particle.vy * this.friction + this.gravity;
			particle.x += particle.vx;
			particle.y += particle.vy;
		}
	},

	launchrender: function () {
		this.launchrenderParticles();
	},

	launchrenderParticles: function () {
		var diameter = this.diameter *= this.reduction;
		var context = this.context;
		var launchtime = this.launchduration + this.delay;
		var particleImage = this.particleImage;
		var p;
		p = this.launchparticle;
		context.drawImage(particleImage, p.x, p.y, diameter, diameter);
	},

	render: function () {
		this.context.globalAlpha = 0.5;
		this.renderParticles();
	},

	renderParticles: function () {
		var diameter = this.diameter *= this.reduction;
		var context = this.context;
		var particles = this.particles;
		var particleImage = this.particleImage;
		var p;
		for (var i = 0, len = particles.length; i < len; i++) {
			p = particles[i];
			context.drawImage(particleImage, p.x, p.y, diameter, diameter);
		}
	},




	started: function (passed) {
		return this.delay < passed;
	},

	launched: function (passed) {
		return this.launchduration + this.delay > passed;
	},

	ended: function (passed) {
		return this.duration + this.delay < passed;
	},

	fadeout: function () {
		this.fadeoutOpacity -= 0.1;
		if (this.fadeoutOpacity <= 0) {
			this.isActive = false;
			return;
		}
		this.move();
		this.context.globalAlpha = this.fadeoutOpacity;
		this.renderParticles();
	}
};



// =================================
// Particle
// =================================
function Particle(x, y, vx, vy) {
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
}
function Launch(x, y, vx, vy) {
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
}

// =================================
// Canvas
// =================================
var Canvas = {
	fireworks: [],

	add: function (firework) {
		firework.canvas = this.canvas;
		firework.context = this.context;
		firework.initlaunch();

		this.fireworks.push(firework);
	},

	start: function () {
		this.startTime = Number(new Date());
		this.update();
	},

	fill: function () {
		this.context.globalAlpha = 0.3;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	},


	// main loop
	update: function () {
		this.fill();
		var passed = new Date() - this.startTime;
		var activeFireworkCount = 0;

		this.fireworks.forEach(function (firework) {

			if (firework.isActive) {

				firework.switchstate(passed);
				activeFireworkCount++;
			}

		}.bind(this));

		if (0 < activeFireworkCount) {

			setTimeout(this.update.bind(this), 0);
		} else {
			setTimeout(this.fadeout.bind(this, 100), 0);
		}
	},

	fadeout: function (count) {
		if (count < 0) return;    // animation end
		this.context.globalAlpha = 1;
		this.context.fillStyle = "rgba(0, 0, 0, 0.2)";
		this.fill();
		setTimeout(this.fadeout.bind(this, count - 1), 0);
	}
};


// =================================
// Utils
// =================================
if (Function.prototype.bind === undefined) {
	Function.prototype.bind = function (obj) {
		var slice = [].slice,
			args = slice.call(arguments, 1),
			self = this,
			bound = function () {
				return self.apply(obj || window, args.concat(slice.call(arguments)));
			};
		bound.prototype = this.prototype;
		return bound;
	};
}

function createParticleImage(radius, color) {
	var size = radius * 2;
	var canvas = document.createElement("canvas");
	canvas.width = canvas.height = size;
	var context = canvas.getContext("2d");

	var gradient = context.createRadialGradient(radius, radius, 0, radius, radius, size);
	gradient.addColorStop(0, "white");
	gradient.addColorStop(0.1, "white");
	gradient.addColorStop(0.3, color);
	gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

	context.fillStyle = gradient;
	context.beginPath();
	context.arc(radius, radius, radius, 0, PI_2, true);
	context.fill();
	//return canvas

	var particle = new Image();
	particle.src = canvas.toDataURL();
	return particle;
}

//set window.requestAnimationFrame
(function (w, r) {
	w['r' + r] = w['r' + r] || w['webkitR' + r] || w['mozR' + r] || w['msR' + r] || w['oR' + r] || function (c) { w.setTimeout(c, 1000 / 60); };
})(window, 'requestAnimationFrame');








