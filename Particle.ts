// =================================
// Particle
// =================================
/**
 * 単一の爆発パーティクルを表すクラス
 */
export class Particle {
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
