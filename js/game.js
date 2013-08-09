
/**
 * ゲームのフェーズが変わった時に呼び出されるイベント.
 */
hokug.phaseChanged = function () {
	switch (hokug.state.phase) {
		case hokug.Phase.UNSTART:
			break;
		case hokug.Phase.READY:
			break;
		case hokug.Phase.GO:
			break;
		case hokug.Phase.RUN:
			break;
		case hokug.Phase.FINISH:
			break;
		case hokug.Phase.GAMEOVER:
			break;
	}
};

/**
 * KeyDownされた時に呼び出されるイベント.
 *
 * @param {object} event キーイベント
 */
hokug.keyDown = function(keyEvent) {
	switch (keyEvent.keyCode) {
		case 37: break; // left
		case 38: break; // up
		case 39: break; // right
		case 40: break; // down
	}
}

/**
 * TouchDownされた時に呼び出されるイベント.
 *
 * @param {number} x 座標X(px)
 * @param {number} y 座標Y(px)
 */
hokug.touchDown = function (x, y) {
};

/**
 * TouchMoveされた時に呼び出されるイベント.
 *
 * @param {number} x 座標X(px)
 * @param {number} y 座標Y(px)
 * @param {number} prevX 前回TouchMove時の座標X(px)
 * @param {number} prevY 前回TouchMove時の座標Y(px)
 */
hokug.touchMove = function (x, y, prevX, prevY) {
};

/**
 * TouchUpされた時に呼び出されるイベント.
 *
 * @param {number} x 座標X(px)
 * @param {number} y 座標Y(px)
 */
hokug.touchUp = function (x, y) {
};

/**
 * 定期的に呼び出されるタイマーイベント.
 * (hokug.state.phase が hokug.Phase.RUN の時に限る)
 */
hokug.timer = function () {
};
