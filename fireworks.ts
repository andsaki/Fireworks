// =================================
// Const
// =================================
const PI = Math.PI;
const PI_2 = PI * 2;

// =================================
// Types
// =================================
interface FireworkConfig {
	duration: number;
	delay: number;
	radius: number;
	amount: number;
	speed: number;
	gravity: number;
	friction: number;
	reduction: number;
	X: number;
	Y: number;
	launchspeed: number;
	launchduration: number;
	color: string;
}

// =================================
// Config
// =================================
const defaultConfig: FireworkConfig = {
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
	const canvas = document.querySelector("canvas");
	if (!canvas) throw new Error("Canvas element not found");

	Canvas.canvas = canvas;
	Canvas.canvas.width = document.documentElement.clientWidth;
	Canvas.canvas.height = document.documentElement.clientHeight;
	if (Canvas.canvas.width > 980) {
		Canvas.canvas.height = Canvas.canvas.height * 0.85;

	} else {
		Canvas.canvas.height = Canvas.canvas.height * 0.5;
	}
	const context = Canvas.canvas.getContext("2d");
	if (!context) throw new Error("Could not get 2d context");
	Canvas.context = context;
	Canvas.context.fillStyle = "rgba(0, 0, 0, 0.15)";

	for (let i = 0; i < 1000; i++) {
		const firework = new Firework({
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
class Firework {
	duration!: number;
	delay!: number;
	radius!: number;
	amount!: number;
	speed!: number;
	gravity!: number;
	friction!: number;
	reduction!: number;
	X!: number;
	Y!: number;
	launchspeed!: number;
	launchduration!: number;
	color!: string;
	particleImage!: HTMLImageElement;
	diameter!: number;
	isActive!: boolean;
	fadeoutOpacity!: number;
	isLaunched: boolean = false;
	particles: Particle[] = [];
	launchparticle!: Launch;
	canvas!: HTMLCanvasElement;
	context!: CanvasRenderingContext2D;

	constructor(config: Partial<FireworkConfig>) {
		this.setConfig(config || {});
		this.particleImage = createParticleImage(this.radius, this.color);
		this.diameter = this.radius * 2;
		this.isActive = true;
		this.fadeoutOpacity = 1;
		this.isLaunched = false;
	}

	setConfig(config: Partial<FireworkConfig>): void {
		for (const key in defaultConfig) {
			if (config[key as keyof FireworkConfig] === undefined) {
				(this as any)[key] = defaultConfig[key as keyof FireworkConfig];
			} else {
				(this as any)[key] = config[key as keyof FireworkConfig];
			}
		}
	}

	initlaunch(): void {
		const x = this.canvas.width * this.X;
		const y = this.canvas.height * this.Y;
		const vx = 0;
		const vy = this.launchspeed;
		this.launchparticle = new Launch(x, y, vx, vy);
	}

	switchstate(passed: number): void {
		const launchtime = this.launchduration + this.delay;
		if (launchtime > passed) {
			this.launchupdate(passed);
			return;
		} else {
			if (this.isLaunched === false) {
				this.isLaunched = true;
				this.initParticles();
			}
		}
		this.update(passed);
	}

	launchupdate(passed: number): void {
		if (this.isActive === false || this.started(passed) === false) return;
		this.launchmove();
		this.launchrender();
	}

	update(passed: number): void {
		if (this.isActive === false || this.started(passed) === false) return;

		if (this.ended(passed)) {
			this.fadeout();
			return;
		}
		this.move();
		this.render();
	}

	initParticles(): void {
		this.particles = [];
		const l = this.launchparticle;
		const maxSpeed = (this.speed / 2) * (this.speed / 2);

		while (this.particles.length < this.amount) {
			const vx = (Math.random() - 0.5) * this.speed;
			const vy = (Math.random() - 0.5) * this.speed;
			if (vx * vx + vy * vy <= maxSpeed) {
				this.particles.push(new Particle(l.x, l.y, vx, vy));
			}
		}
	}

	launchmove(): void {
		const particle = this.launchparticle;
		particle.vx = 0;
		particle.vy = particle.vy * this.friction + this.gravity + this.launchspeed;
		particle.x += particle.vx;
		particle.y += particle.vy;
	}

	move(): void {
		const particles = this.particles;
		for (let i = 0, len = particles.length; i < len; i++) {
			const particle = particles[i];
			particle.vx *= this.friction;
			particle.vy = particle.vy * this.friction + this.gravity;
			particle.x += particle.vx;
			particle.y += particle.vy;
		}
	}

	launchrender(): void {
		this.launchrenderParticles();
	}

	launchrenderParticles(): void {
		const diameter = this.diameter *= this.reduction;
		const context = this.context;
		const particleImage = this.particleImage;
		const p = this.launchparticle;
		context.drawImage(particleImage, p.x, p.y, diameter, diameter);
	}

	render(): void {
		this.context.globalAlpha = 0.5;
		this.renderParticles();
	}

	renderParticles(): void {
		const diameter = this.diameter *= this.reduction;
		const context = this.context;
		const particles = this.particles;
		const particleImage = this.particleImage;
		for (let i = 0, len = particles.length; i < len; i++) {
			const p = particles[i];
			context.drawImage(particleImage, p.x, p.y, diameter, diameter);
		}
	}

	started(passed: number): boolean {
		return this.delay < passed;
	}

	hasLaunched(passed: number): boolean {
		return this.launchduration + this.delay > passed;
	}

	ended(passed: number): boolean {
		return this.duration + this.delay < passed;
	}

	fadeout(): void {
		this.fadeoutOpacity -= 0.1;
		if (this.fadeoutOpacity <= 0) {
			this.isActive = false;
			return;
		}
		this.move();
		this.context.globalAlpha = this.fadeoutOpacity;
		this.renderParticles();
	}
}



// =================================
// Particle
// =================================
class Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;

	constructor(x: number, y: number, vx: number, vy: number) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
	}
}

class Launch {
	x: number;
	y: number;
	vx: number;
	vy: number;

	constructor(x: number, y: number, vx: number, vy: number) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
	}
}

// =================================
// Canvas
// =================================
interface CanvasManager {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	fireworks: Firework[];
	startTime: number;
	add(firework: Firework): void;
	start(): void;
	fill(): void;
	update(): void;
	fadeout(count: number): void;
}

const Canvas: CanvasManager = {
	canvas: null as any,
	context: null as any,
	fireworks: [],
	startTime: 0,

	add(firework: Firework): void {
		firework.canvas = this.canvas;
		firework.context = this.context;
		firework.initlaunch();

		this.fireworks.push(firework);
	},

	start(): void {
		this.startTime = Date.now();
		this.update();
	},

	fill(): void {
		this.context.globalAlpha = 0.3;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	},

	// main loop
	update(): void {
		this.fill();
		const passed = Date.now() - this.startTime;
		let activeFireworkCount = 0;

		this.fireworks.forEach((firework) => {
			if (firework.isActive) {
				firework.switchstate(passed);
				activeFireworkCount++;
			}
		});

		if (0 < activeFireworkCount) {
			requestAnimationFrame(this.update.bind(this));
		} else {
			requestAnimationFrame(this.fadeout.bind(this, 100));
		}
	},

	fadeout(count: number): void {
		if (count < 0) return;    // animation end
		this.context.globalAlpha = 1;
		this.context.fillStyle = "rgba(0, 0, 0, 0.2)";
		this.fill();
		requestAnimationFrame(this.fadeout.bind(this, count - 1));
	}
};


// =================================
// Utils
// =================================

function createParticleImage(radius: number, color: string): HTMLImageElement {
	const size = radius * 2;
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = size;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Could not get 2d context");

	const gradient = context.createRadialGradient(radius, radius, 0, radius, radius, size);
	gradient.addColorStop(0, "white");
	gradient.addColorStop(0.1, "white");
	gradient.addColorStop(0.3, color);
	gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

	context.fillStyle = gradient;
	context.beginPath();
	context.arc(radius, radius, radius, 0, PI_2, true);
	context.fill();
	//return canvas

	const particle = new Image();
	particle.src = canvas.toDataURL();
	return particle;
}









