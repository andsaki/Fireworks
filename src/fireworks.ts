import {
	DESKTOP_WIDTH_THRESHOLD,
	DESKTOP_HEIGHT_RATIO,
	MOBILE_HEIGHT_RATIO,
	TOTAL_FIREWORKS,
	FIREWORK_DELAY_MS
} from './constants';
import { Canvas } from './Canvas';
import { Firework } from './Firework';

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

	for (let i = 0; i < TOTAL_FIREWORKS; i++) {
		const isMobile = Canvas.canvas.width <= DESKTOP_WIDTH_THRESHOLD;
		const baseY = isMobile ? 0.2 : 0.25;
		const randomOffset = (Math.random() - 0.5) * 0.1;
		const firework = new Firework({
			duration: 5000,
			X: Math.random() * 0.8 + 0.1,
			Y: baseY + randomOffset,
			startY: 1.0,
			amount: 400,
			delay: FIREWORK_DELAY_MS * i,
			radius: 4,
			reduction: 0.992,
			friction: 0.95,
			speed: 25,
			launchSpeed: isMobile ? -0.4 : -0.5,
			launchDuration: Math.random() * 100 + 400,
			color: `hsl(${Math.random() * 360}, 100%, 50%)`
		});
		Canvas.add(firework);
	}

	Canvas.start();
});









