import {
	DESKTOP_WIDTH_THRESHOLD,
	DESKTOP_HEIGHT_RATIO,
	MOBILE_HEIGHT_RATIO,
	TOTAL_FIREWORKS,
	FIREWORK_DELAY_MS
} from './constants';
import { Canvas } from './Canvas';
import { Firework } from './Firework';
import type { FireworkType } from './types';

// =================================
// Main
// =================================
window.addEventListener("load", () => {
	const canvas = document.querySelector("canvas");
	if (!canvas) throw new Error("Canvas element not found");

	Canvas.canvas = canvas;
	Canvas.canvas.width = document.documentElement.clientWidth;
	Canvas.canvas.height = document.documentElement.clientHeight;
	if (Canvas.canvas.width > DESKTOP_WIDTH_THRESHOLD) {
		Canvas.canvas.height = Canvas.canvas.height * DESKTOP_HEIGHT_RATIO;

	} else {
		Canvas.canvas.height = Canvas.canvas.height * MOBILE_HEIGHT_RATIO;
	}
	const context = Canvas.canvas.getContext("2d");
	if (!context) throw new Error("Could not get 2d context");
	Canvas.context = context;
	Canvas.context.fillStyle = "rgba(0, 0, 0, 0.15)";

	// 花火のタイプをランダムに選択するヘルパー関数
	const getRandomFireworkType = (): FireworkType => {
		const types: FireworkType[] = ['chrysanthemum', 'willow', 'peony', 'star', 'palm'];
		return types[Math.floor(Math.random() * types.length)];
	};

	for (let i = 0; i < TOTAL_FIREWORKS; i++) {
		const isMobile = Canvas.canvas.width <= DESKTOP_WIDTH_THRESHOLD;
		const baseY = isMobile ? 0.2 : 0.3;
		const randomOffset = (Math.random() - 0.5) * 0.1;
		const startY = isMobile ? 1.0 : 1.0;
		const type = getRandomFireworkType();

		// タイプに応じて設定を調整（パーティクル数を削減）
		let amount = 200;
		let speed = 25;
		if (type === 'willow') {
			amount = 150;
			speed = 20;
		} else if (type === 'star') {
			amount = 120;
			speed = 22;
		} else if (type === 'palm') {
			amount = 180;
			speed = 23;
		}

		const firework = new Firework({
			duration: isMobile ? 6000 : 7000,
			X: Math.random() * 0.8 + 0.1,
			Y: baseY + randomOffset,
			startY: startY,
			amount: isMobile ? amount : amount * 1.5,
			delay: FIREWORK_DELAY_MS * i,
			radius: isMobile ? 4 : 3,
			reduction: 0.998,
			friction: 0.985,
			gravity: isMobile ? 0.025 : 0.03,
			speed: speed * (isMobile ? 0.4 : 0.5),
			launchSpeed: isMobile ? -3.5 : -5.0,
			launchDuration: isMobile ? Math.random() * 800 + 1600 : Math.random() * 600 + 1200,
			color: `hsl(${Math.random() * 360}, 100%, 50%)`,
			type: type
		});
		Canvas.add(firework);
	}

	Canvas.start();
});









