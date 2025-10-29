// =================================
// Types
// =================================

/**
 * 花火アニメーションのパラメータ設定インターフェース
 */
export interface FireworkConfig {
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
	/** 開花Y位置（キャンバス高さの割合 0-1） */
	Y: number;
	/** 打ち上げ開始Y位置（キャンバス高さの割合 0-1） */
	startY: number;
	/** 打ち上げ速度（負の値 = 上向き） */
	launchSpeed: number;
	/** 打ち上げフェーズの持続時間（ミリ秒） */
	launchDuration: number;
	/** パーティクルの色（CSSカラー文字列） */
	color: string;
}

/**
 * 花火インスタンスの型（循環参照を避けるため）
 */
export interface FireworkInstance {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	isActive: boolean;
	initLaunch(): void;
	switchState(passed: number): void;
}

/**
 * すべての花火を管理するキャンバスマネージャーのインターフェース
 */
export interface CanvasManager {
	/** キャンバスのHTML要素 */
	canvas: HTMLCanvasElement;
	/** 2D描画コンテキスト */
	context: CanvasRenderingContext2D;
	/** すべての花火インスタンスの配列 */
	fireworks: FireworkInstance[];
	/** アニメーション開始タイムスタンプ */
	startTime: number;
	/** 花火をアニメーションに追加 */
	add(firework: FireworkInstance): void;
	/** アニメーションループを開始 */
	start(): void;
	/** キャンバスを半透明の黒で塗りつぶし */
	fill(): void;
	/** メインアニメーション更新ループ */
	update(): void;
	/** キャンバスをフェードアウト */
	fadeout(count: number): void;
}
