import { CANVAS_FILL_OPACITY, FADEOUT_STEPS } from './constants';
import type { CanvasManager, FireworkInstance } from './types';

/**
 * 花火表示を制御するキャンバスマネージャーシングルトン
 */
export const Canvas: CanvasManager = {
	canvas: undefined as unknown as HTMLCanvasElement,
	context: undefined as unknown as CanvasRenderingContext2D,
	fireworks: [],
	startTime: 0,

	/**
	 * 花火をキャンバスに追加して初期化
	 * @param firework - 追加する花火インスタンス
	 */
	add(firework: FireworkInstance): void {
		firework.canvas = this.canvas;
		firework.context = this.context;
		firework.initLaunch();

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
		this.context.globalAlpha = CANVAS_FILL_OPACITY;
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
				firework.switchState(passed);
				activeFireworkCount++;
			}
		});

		if (0 < activeFireworkCount) {
			requestAnimationFrame(this.update.bind(this));
		} else {
			requestAnimationFrame(this.fadeout.bind(this, FADEOUT_STEPS));
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
