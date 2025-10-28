// =================================
// Const
// =================================
/** 円周率Math.PI */
const PI = Math.PI;
/** 2π（完全な円の計算用） */
const PI_2 = PI * 2;

// =================================
// Types
// =================================
/**
 * 花火アニメーションのパラメータ設定インターフェース
 */
interface FireworkConfig {
	/** 花火アニメーションの持続時間（ミリ秒） */
	duration: number;
	/** アニメーション開始前の遅延時間（ミリ秒） */
	delay: number;
	/** 各パーティクルの半径（ピクセル） */
	radius: number;
	/** 生成するパーティクルの数 */
	amount: number;
	/** パーティクル移動の速度倍率 */
	speed: number;
	/** パーティクルに適用する重力 */
	gravity: number;
	/** 摩擦係数（フレームごとの速度乗数） */
	friction: number;
	/** フレームごとのサイズ縮小率 */
	reduction: number;
	/** X位置（キャンバス幅の割合 0-1） */
	X: number;
	/** Y位置（キャンバス高さの割合 0-1） */
	Y: number;
	/** 打ち上げ速度（負の値 = 上向き） */
	launchspeed: number;
	/** 打ち上げフェーズの持続時間（ミリ秒） */
	launchduration: number;
	/** パーティクルの色（CSSカラー文字列） */
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
/**
 * 打ち上げと爆発フェーズを持つ単一の花火を表すクラス
 */
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
		for (const key in defaultConfig) {
			if (config[key as keyof FireworkConfig] === undefined) {
				(this as any)[key] = defaultConfig[key as keyof FireworkConfig];
			} else {
				(this as any)[key] = config[key as keyof FireworkConfig];
			}
		}
	}

	/**
	 * 開始位置で打ち上げパーティクルを初期化
	 */
	initlaunch(): void {
		const x = this.canvas.width * this.X;
		const y = this.canvas.height * this.Y;
		const vx = 0;
		const vy = this.launchspeed;
		this.launchparticle = new Launch(x, y, vx, vy);
	}

	/**
	 * 時間に基づいて打ち上げと爆発の状態を切り替える
	 * @param passed - 開始からの経過時間（ミリ秒）
	 */
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

	/**
	 * 打ち上げフェーズのアニメーションを更新
	 * @param passed - 開始からの経過時間（ミリ秒）
	 */
	launchupdate(passed: number): void {
		if (this.isActive === false || this.started(passed) === false) return;
		this.launchmove();
		this.launchrender();
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
	 * 打ち上げパーティクルの物理演算を更新（位置と速度）
	 */
	launchmove(): void {
		const particle = this.launchparticle;
		particle.vx = 0;
		particle.vy = particle.vy * this.friction + this.gravity + this.launchspeed;
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
	launchrender(): void {
		this.launchrenderParticles();
	}

	/**
	 * 打ち上げパーティクルをキャンバスに描画
	 */
	launchrenderParticles(): void {
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
		this.context.globalAlpha = 0.5;
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
		return this.launchduration + this.delay > passed;
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
/**
 * 単一の爆発パーティクルを表すクラス
 */
class Particle {
	/** X座標（ピクセル） */
	x: number;
	/** Y座標（ピクセル） */
	y: number;
	/** X方向の速度（ピクセル/フレーム） */
	vx: number;
	/** Y方向の速度（ピクセル/フレーム） */
	vy: number;

	/**
	 * 新しいパーティクルを作成
	 * @param x - 初期X座標
	 * @param y - 初期Y座標
	 * @param vx - 初期X方向速度
	 * @param vy - 初期Y方向速度
	 */
	constructor(x: number, y: number, vx: number, vy: number) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
	}
}

/**
 * 打ち上げフェーズのパーティクルを表すクラス
 */
class Launch {
	/** X座標（ピクセル） */
	x: number;
	/** Y座標（ピクセル） */
	y: number;
	/** X方向の速度（ピクセル/フレーム） */
	vx: number;
	/** Y方向の速度（ピクセル/フレーム） */
	vy: number;

	/**
	 * 新しい打ち上げパーティクルを作成
	 * @param x - 初期X座標
	 * @param y - 初期Y座標
	 * @param vx - 初期X方向速度
	 * @param vy - 初期Y方向速度
	 */
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
/**
 * すべての花火を管理するキャンバスマネージャーのインターフェース
 */
interface CanvasManager {
	/** キャンバスのHTML要素 */
	canvas: HTMLCanvasElement;
	/** 2D描画コンテキスト */
	context: CanvasRenderingContext2D;
	/** すべての花火インスタンスの配列 */
	fireworks: Firework[];
	/** アニメーション開始タイムスタンプ */
	startTime: number;
	/** 花火をアニメーションに追加 */
	add(firework: Firework): void;
	/** アニメーションループを開始 */
	start(): void;
	/** キャンバスを半透明の黒で塗りつぶし */
	fill(): void;
	/** メインアニメーション更新ループ */
	update(): void;
	/** キャンバスをフェードアウト */
	fadeout(count: number): void;
}

/**
 * 花火表示を制御するキャンバスマネージャーシングルトン
 */
const Canvas: CanvasManager = {
	canvas: null as any,
	context: null as any,
	fireworks: [],
	startTime: 0,

	/**
	 * 花火をキャンバスに追加して初期化
	 * @param firework - 追加する花火インスタンス
	 */
	add(firework: Firework): void {
		firework.canvas = this.canvas;
		firework.context = this.context;
		firework.initlaunch();

		this.fireworks.push(firework);
	},

	/**
	 * 開始時刻を記録してアニメーションループを開始
	 */
	start(): void {
		this.startTime = Date.now();
		this.update();
	},

	/**
	 * 軌跡効果のためキャンバスを半透明の黒で塗りつぶし
	 */
	fill(): void {
		this.context.globalAlpha = 0.3;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	},

	/**
	 * メインアニメーションループ - すべてのアクティブな花火を更新して描画
	 */
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

	/**
	 * キャンバスを黒に徐々にフェードアウト
	 * @param count - 残りのフェードステップ数
	 */
	fadeout(count: number): void {
		if (count < 0) return;    // アニメーション終了
		this.context.globalAlpha = 1;
		this.context.fillStyle = "rgba(0, 0, 0, 0.2)";
		this.fill();
		requestAnimationFrame(this.fadeout.bind(this, count - 1));
	}
};


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
	//return canvas

	const particle = new Image();
	particle.src = canvas.toDataURL();
	return particle;
}









