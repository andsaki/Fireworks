import { PI_2, FADEOUT_OPACITY_STEP, PARTICLE_RENDER_OPACITY } from './constants';
import type { FireworkConfig } from './types';
import { Particle } from './Particle';
import { Launch } from './Launch';

// =================================
// Config
// =================================
const defaultConfig: FireworkConfig = {
	duration: 2000,         // ms
	delay: 0,               // ms
	radius: 5,              // px
	amount: 100,            // particle number
	speed: 12,
	gravity: 0.08,
	friction: 0.96,
	airResistance: 0.98,
	reduction: 0.98,
	X: 0.5,
	Y: 0.3,
	startY: 1.0,
	launchSpeed: -1,
	launchDuration: 500,
	color: "#ff0000",
	type: 'chrysanthemum',
};

// =================================
// Firework
// =================================
/**
 * 打ち上げと爆発フェーズを持つ単一の花火を表すクラス
 */
export class Firework {
	duration!: number;
	delay!: number;
	radius!: number;
	amount!: number;
	speed!: number;
	gravity!: number;
	friction!: number;
	airResistance!: number;
	reduction!: number;
	X!: number;
	Y!: number;
	startY!: number;
	launchSpeed!: number;
	launchDuration!: number;
	color!: string;
	type!: FireworkConfig['type'];
	particleImage!: HTMLImageElement;
	diameter!: number;
	isActive!: boolean;
	fadeoutOpacity!: number;
	isLaunched: boolean = false;
	particles: Particle[] = [];
	launchparticle!: Launch;
	canvas!: HTMLCanvasElement;
	context!: CanvasRenderingContext2D;

	/**
	 * 新しい花火インスタンスを作成
	 * @param config - デフォルト設定を上書きする部分設定
	 */
	constructor(config: Partial<FireworkConfig>) {
		this.setConfig(config || {});
		this.particleImage = createParticleImage(this.radius, this.color);
		this.diameter = this.radius * 2;
		this.isActive = true;
		this.fadeoutOpacity = 1;
		this.isLaunched = false;
	}

	/**
	 * 設定を適用し、デフォルト値とマージする
	 * @param config - 適用する設定オブジェクト
	 */
	setConfig(config: Partial<FireworkConfig>): void {
		this.duration = config.duration ?? defaultConfig.duration;
		this.delay = config.delay ?? defaultConfig.delay;
		this.radius = config.radius ?? defaultConfig.radius;
		this.amount = config.amount ?? defaultConfig.amount;
		this.speed = config.speed ?? defaultConfig.speed;
		this.gravity = config.gravity ?? defaultConfig.gravity;
		this.friction = config.friction ?? defaultConfig.friction;
		this.airResistance = config.airResistance ?? defaultConfig.airResistance;
		this.reduction = config.reduction ?? defaultConfig.reduction;
		this.X = config.X ?? defaultConfig.X;
		this.Y = config.Y ?? defaultConfig.Y;
		this.startY = config.startY ?? defaultConfig.startY;
		this.launchSpeed = config.launchSpeed ?? defaultConfig.launchSpeed;
		this.launchDuration = config.launchDuration ?? defaultConfig.launchDuration;
		this.color = config.color ?? defaultConfig.color;
		this.type = config.type ?? defaultConfig.type;
	}

	/**
	 * 開始位置で打ち上げパーティクルを初期化
	 */
	initLaunch(): void {
		const x = this.canvas.width * this.X;
		const y = this.canvas.height * this.startY;
		const vx = (Math.random() - 0.5) * 2.5;
		const vy = this.launchSpeed;
		this.launchparticle = new Launch(x, y, vx, vy);
	}

	/**
	 * 時間に基づいて打ち上げと爆発の状態を切り替える
	 * @param passed - 開始からの経過時間（ミリ秒）
	 */
	switchState(passed: number): void {
		if (this.isLaunched === false) {
			const targetY = this.canvas.height * this.Y;
			if (this.launchparticle && this.launchparticle.y <= targetY) {
				this.isLaunched = true;
				this.initParticles();
			} else {
				this.launchUpdate(passed);
				return;
			}
		}
		this.update(passed);
	}

	/**
	 * 打ち上げフェーズのアニメーションを更新
	 * @param passed - 開始からの経過時間（ミリ秒）
	 */
	launchUpdate(passed: number): void {
		if (this.isActive === false || this.started(passed) === false) return;
		this.launchMove();
		this.launchRender();
	}

	/**
	 * 爆発フェーズのアニメーションを更新
	 * @param passed - 開始からの経過時間（ミリ秒）
	 */
	update(passed: number): void {
		if (this.isActive === false || this.started(passed) === false) return;

		if (this.ended(passed)) {
			this.fadeout();
			return;
		}
		this.move();
		this.render();
	}

	/**
	 * 球状パターンですべての爆発パーティクルを初期化
	 */
	initParticles(): void {
		this.particles = [];
		const l = this.launchparticle;

		switch (this.type) {
			case 'chrysanthemum':
				this.initChrysanthemum(l);
				break;
			case 'willow':
				this.initWillow(l);
				break;
			case 'peony':
				this.initPeony(l);
				break;
			case 'star':
				this.initStar(l);
				break;
			case 'palm':
				this.initPalm(l);
				break;
		}
	}

	/**
	 * 菊花火パターン（球状に均等に広がる）
	 */
	private initChrysanthemum(l: Launch): void {
		const maxSpeed = (this.speed / 2) * (this.speed / 2);
		while (this.particles.length < this.amount) {
			const vx = (Math.random() - 0.5) * this.speed;
			const vy = (Math.random() - 0.5) * this.speed;
			if (vx * vx + vy * vy <= maxSpeed) {
				this.particles.push(new Particle(l.x, l.y, vx, vy));
			}
		}
	}

	/**
	 * 柳花火パターン（垂れ下がる）
	 */
	private initWillow(l: Launch): void {
		for (let i = 0; i < this.amount; i++) {
			const angle = (Math.PI * 2 * i) / this.amount;
			const speed = Math.random() * this.speed * 0.5 + this.speed * 0.3;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed * 0.3 - Math.random() * 2;
			this.particles.push(new Particle(l.x, l.y, vx, vy));
		}
	}

	/**
	 * 牡丹花火パターン（大きく広がる）
	 */
	private initPeony(l: Launch): void {
		for (let i = 0; i < this.amount; i++) {
			const angle = (Math.PI * 2 * i) / this.amount + Math.random() * 0.5;
			const speed = Math.random() * this.speed * 0.4 + this.speed * 0.8;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed;
			this.particles.push(new Particle(l.x, l.y, vx, vy));
		}
	}

	/**
	 * 星花火パターン（キラキラ）
	 */
	private initStar(l: Launch): void {
		const points = 5;
		const particlesPerPoint = Math.floor(this.amount / points);
		for (let p = 0; p < points; p++) {
			const angle = (Math.PI * 2 * p) / points - Math.PI / 2;
			for (let i = 0; i < particlesPerPoint; i++) {
				const spread = (Math.random() - 0.5) * 0.4;
				const speed = Math.random() * this.speed * 0.3 + this.speed * 0.6;
				const vx = Math.cos(angle + spread) * speed;
				const vy = Math.sin(angle + spread) * speed;
				this.particles.push(new Particle(l.x, l.y, vx, vy));
			}
		}
	}

	/**
	 * 椰子花火パターン（上に広がる）
	 */
	private initPalm(l: Launch): void {
		for (let i = 0; i < this.amount; i++) {
			const angle = (Math.PI * 2 * i) / this.amount;
			const speed = Math.random() * this.speed * 0.4 + this.speed * 0.4;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed * 0.5 - this.speed * 0.3;
			this.particles.push(new Particle(l.x, l.y, vx, vy));
		}
	}

	/**
	 * 打ち上げパーティクルの物理演算を更新（位置と速度）
	 */
	launchMove(): void {
		const particle = this.launchparticle;
		particle.vx += (Math.random() - 0.5) * 0.6;
		particle.vx *= 0.96;
		particle.vy = particle.vy * this.friction + this.gravity + this.launchSpeed;
		particle.x += particle.vx;
		particle.y += particle.vy;
	}

	/**
	 * すべての爆発パーティクルの物理演算を更新（位置と速度）
	 */
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

	/**
	 * 打ち上げパーティクルをレンダリング
	 */
	launchRender(): void {
		this.launchRenderParticles();
	}

	/**
	 * 打ち上げパーティクルをキャンバスに描画
	 */
	launchRenderParticles(): void {
		const diameter = this.diameter *= this.reduction;
		const context = this.context;
		const particleImage = this.particleImage;
		const p = this.launchparticle;
		context.drawImage(particleImage, p.x, p.y, diameter, diameter);
	}

	/**
	 * すべての爆発パーティクルをレンダリング
	 */
	render(): void {
		this.context.globalAlpha = PARTICLE_RENDER_OPACITY;
		this.renderParticles();
	}

	/**
	 * すべての爆発パーティクルをキャンバスに描画
	 */
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

	/**
	 * 花火が開始したかチェック（遅延時間が経過したか）
	 * @param passed - 開始からの経過時間（ミリ秒）
	 * @returns 開始している場合はtrue
	 */
	started(passed: number): boolean {
		return this.delay < passed;
	}

	/**
	 * 花火がまだ打ち上げフェーズかチェック
	 * @param passed - 開始からの経過時間（ミリ秒）
	 * @returns まだ打ち上げ中の場合はtrue
	 */
	hasLaunched(passed: number): boolean {
		return this.launchDuration + this.delay > passed;
	}

	/**
	 * 花火アニメーションが終了したかチェック
	 * @param passed - 開始からの経過時間（ミリ秒）
	 * @returns 終了している場合はtrue
	 */
	ended(passed: number): boolean {
		return this.duration + this.delay < passed;
	}

	/**
	 * 花火を徐々にフェードアウトして無効化
	 */
	fadeout(): void {
		this.fadeoutOpacity -= FADEOUT_OPACITY_STEP;
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
// Utils
// =================================

/**
 * レンダリング用の放射状グラデーションパーティクル画像を作成
 * @param radius - パーティクルの半径（ピクセル）
 * @param color - パーティクルの色（CSSカラー文字列）
 * @returns パーティクルグラデーション付きのHTML Image要素
 */
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

	const particle = new Image();
	particle.src = canvas.toDataURL();
	return particle;
}
