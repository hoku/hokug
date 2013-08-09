/**
 * hokug v0.1.0
 * http://hoku.in/
 *
 * Copyright 2013 hoku.
 * Released under the MIT License.
 */

////////////////////////////////////////////////////////////

//// core ////

// hokugクラス
var hokug = function () {};


////////////////////////////////////////////////////////////

//// 定数 ////

// アニメーション種別定数
hokug.AnimType = function () {};
hokug.AnimType.Up   = 0; // スケールアップ
hokug.AnimType.Down = 1; // スケールダウン

// 方向定数
hokug.Vector = function () {};
hokug.Vector.Top    = 0; // 上向き
hokug.Vector.Right  = 1; // 右向き
hokug.Vector.Bottom = 2; // 下向き
hokug.Vector.Left   = 3; // 左向き

// ゲームのフェーズ定数
hokug.Phase = function() {};
hokug.Phase.UNLOAD   = 0;		// 未ロード
hokug.Phase.UNSTART  = 10;		// 未スタート
hokug.Phase.READY    = 20;		// レディ
hokug.Phase.GO       = 30;		// GO
hokug.Phase.RUN      = 40;		// ゲーム中
hokug.Phase.FINISH   = 50;		// ゲームフィニッシュ
hokug.Phase.GAMEOVER = 60;		// ゲームオーバー


////////////////////////////////////////////////////////////

//// クラス ////

// クラス格納クラス
hokug.Class = function () {};

// アニメーションクラス
hokug.Class.Anim = function () {
	this.x = 0; // X座標
	this.y = 0; // Y座標
	this.width  = 0; // 幅
	this.height = 0; // 高さ
	this.startTime = 0; // アニメーション開始時刻
	this.img  = null;   // アニメーションする画像
	this.type = hokug.AnimType.Up; // アニメーション種別
};

// ブロッククラス
hokug.Class.Block = function () {
	this.x = 0; // X座標
	this.y = 0; // Y座標
	this.width  = 0; // 幅
	this.height = 0; // 高さ
	this.topImgs    = []; // 上向きの時の画像
	this.rightImgs  = []; // 右向きの時の画像
	this.bottomImgs = []; // 下向きの時の画像
	this.leftImgs   = []; // 左向きの時の画像
	this.startTime  = 0;  // アニメーション開始時刻
	this.vector     = hokug.Vector.Top; // 今向いている方向

	// XY座標上にこのブロックが存在するか
	this.hitTest = function (x, y) {
		var left = this.x - (this.width / 2);
		var right = this.x + (this.width / 2);
		var top = this.y - (this.height / 2);
		var bottom = this.y + (this.height / 2);
		if (left <= x && x <= right) {
			if (top <= y && y <= bottom) {
				return true;
			}
		}
		return false;
	};

	// ブロック同士がある程度ふれあっているか
	this.crashTest = function (block) {
		var blockLeft = block.x - (block.width / 4);
		var blockRight = blockLeft + (block.width / 2);
		var blockTop = block.y - (block.height / 4);
		var blockBottom = blockTop + (block.height / 2);
		if (this.hitTest(blockLeft, blockTop)) { return true; }
		if (this.hitTest(blockRight, blockTop)) { return true; }
		if (this.hitTest(blockLeft, blockBottom)) { return true; }
		if (this.hitTest(blockRight, blockBottom)) { return true; }
		return false;
	};
};

// 色クラス
hokug.Class.Color = function (red, green, blue, alpha) {
	this.r = red;
	this.g = green;
	this.b = blue;
	this.a = alpha;
};


////////////////////////////////////////////////////////////

//// ゲームステータス ////

// ゲームのステータス
hokug.state = function() {};

// フェーズがRUNになった時刻
hokug.state.start = 0;
// フェーズがRUNになってからの経過時刻
hokug.state.remaining = 0;
// 現在のゲームフェーズ
hokug.state.phase = hokug.Phase.UNLOAD;
// 現在のゲームフレーム番号
hokug.state.frame = 0;


////////////////////////////////////////////////////////////

//// リソース ////

// プレロードした画像
hokug.res = [];

// canvas
hokug.cvs = null;
// canvasの2Dコンテキスト
hokug.ctx = null;


////////////////////////////////////////////////////////////

//// hokugの処理用領域 ////

// 作業用
hokug.work = function() {};

// タイマー用のハンドラ
hokug.work.timerHandler = null;
// アニメーション描画キュー
hokug.work.anims = [];
// 前回タッチ位置X
hokug.work.touchPrevX = 0;
// 前回タッチ位置Y
hokug.work.touchPrevY = 0;


////////////////////////////////////////////////////////////

//// イベント ////

// 初期化処理
hokug.load = function () {
	// canvas生成
	var newCanvas = document.createElement("canvas");
	newCanvas.setAttribute("id"    , "hokugCanvas");
	newCanvas.setAttribute("width" , hokug.width);
	newCanvas.setAttribute("height", hokug.height);
	newCanvas.setAttribute("style" , "width:" + hokug.width + "px;height:" + hokug.height + "px;");
	// touchイベントを設定
	var touchStart = ("ontouchstart" in window.document.documentElement) ? "touchstart" : "mousedown";
	var touchMove  = ("ontouchmove"  in window.document.documentElement) ? "touchmove"  : "mousemove";
	var touchUp    = ("ontouchend"   in window.document.documentElement) ? "touchend"   : "mouseup";
	hokugUtil.addEventListener(newCanvas, touchStart, hokug.touchDownBase);
	hokugUtil.addEventListener(newCanvas, touchMove , hokug.touchMoveBase);
	hokugUtil.addEventListener(newCanvas, touchUp   , hokug.touchUpBase);
	// keydownイベントを設定
	if ("onkeydown" in window.document) {
		hokugUtil.addEventListener(window.document, "keydown" , hokug.keyDownBase);
	}
	// bodyにキャンバスを追加
	window.document.body.appendChild(newCanvas);
	hokug.cvs = newCanvas;
	hokug.ctx = hokug.cvs.getContext('2d');
	// 背景色設定
	window.document.body.style.backgroundColor = hokug.outsideColor;

	if (hokug.preLoad.length > 0) {
		// ロード中を描画
		var textColor = new hokug.Class.Color(255, 255, 255, 1.0);
		hokug.drawText(20, 30, "loading...", textColor, 20);
		// 画像の事前読み込みを開始する
		hokug.res = [];
		hokugUtil.resLoad(
			hokug.preLoad,
			hokug.res,
			function () {
				hokug.changePhase(hokug.Phase.UNSTART);
			}
		);
	}
	else {
		hokug.changePhase(hokug.Phase.UNSTART);
	}

	// スマホモードなら、画面を液晶ぴったりにする
	if (hokug.screenMode === 0) {
		document.lastChild.style.zoom = hokugUtil.getBrowserWidth() / hokug.width;
	} else {
		document.lastChild.style.zoom = 1;
	}
};

// キー押下処理
hokug.keyDownBase = function (event) {
	if (hokug.state.phase != hokug.Phase.RUN) {
		return false;
	}

	if (hokug.keyDown) {
		hokug.keyDown(event);
	}
	event.preventDefault();
	return false;
};

// touchdown処理
hokug.touchDownBase = function (event) {
	switch (hokug.state.phase) {
		// これらフェーズ時はイベントを無視する
		case hokug.Phase.UNLOAD:
		case hokug.Phase.READY:
		case hokug.Phase.GO:
		case hokug.Phase.FINISH:
			event.preventDefault();
			return false;
		// UNSTARTフェーズ時はREADYフェーズに移行して、イベントを無視する
		case hokug.Phase.UNSTART:
			hokug.changePhase(hokug.Phase.READY);
			event.preventDefault();
			return false;
		// RUN時とGAMEOSER時はイベント処理を行う
		case hokug.Phase.RUN:
		case hokug.Phase.GAMEOVER:
			break;
	}

	if (hokug.touchDown) {
		var x, y;
		if (event.touches && event.touches.length > 0) {
			x = event.touches[0].pageX;
			y = event.touches[0].pageY;
		} else {
			x = event.x;
			y = event.y;
		}
		x = parseInt(x / document.lastChild.style.zoom, 10);
		y = parseInt(y / document.lastChild.style.zoom, 10);
		hokug.work.touchPrevX = x;
		hokug.work.touchPrevY = y;
		hokug.touchDown(x, y);
	}
	event.preventDefault();
	return false;
};

// toucemove処理
hokug.touchMoveBase = function (event) {
	// RUNフェーズ時のみ実行する
	if (hokug.state.phase != hokug.Phase.RUN) {
		return false;
	}

	if (hokug.touchMove) {
		var x, y;
		if (event.touches && event.touches.length > 0) {
			x = event.touches[0].pageX;
			y = event.touches[0].pageY;
		} else {
			x = event.x;
			y = event.y;
		}
		x = parseInt(x / document.lastChild.style.zoom, 10);
		y = parseInt(y / document.lastChild.style.zoom, 10);
		hokug.touchMove(x, y, hokug.work.touchPrevX, hokug.work.touchPrevY);
		hokug.work.touchPrevX = x;
		hokug.work.touchPrevY = y;
	}
	event.preventDefault();
	return false;
};

// touchup処理
hokug.touchUpBase = function (event) {
	// RUNフェーズ時のみ実行する
	if (hokug.state.phase != hokug.Phase.RUN) {
		return false;
	}

	if (hokug.touchUp) {
		var x, y;
		if (event.changedTouches && event.changedTouches.length > 0) {
			x = event.changedTouches[0].pageX;
			y = event.changedTouches[0].pageY;
		} else {
			x = event.x;
			y = event.y;
		}
		x = parseInt(x / document.lastChild.style.zoom, 10);
		y = parseInt(y / document.lastChild.style.zoom, 10);
		hokug.touchUp(x, y);
	}
	event.preventDefault();
	return false;
};

// タイマー処理
hokug.timerBase = function (event) {
	// RUNフェーズ時のみ実行する
	if (hokug.state.phase != hokug.Phase.RUN) {
		return false;
	}

	// 残り時間を算出
	var remTime = hokug.gameTime - ((new Date()).getTime() - hokug.state.start);
	hokug.state.remaining = Math.max(0, remTime);
	// 残り時間が無くなっていたら、FINISHフェーズに移行する
	if (hokug.gameTime != -1 && hokug.state.remaining <= 0) {
		hokug.changePhase(hokug.Phase.FINISH);
		return false;
	}

	if (hokug.timer) {
		hokug.timer();
	}

	// 登録されているアニメーションを描画する
	hokugUtil.refreshAnim(hokug.ctx, hokug.work.anims);

	hokug.state.frame++;
};


////////////////////////////////////////////////////////////

//// メソッド ////

// フェーズを移行する
hokug.changePhase = function (newPhase) {

	if (newPhase == hokug.Phase.READY) {
		setTimeout("hokug.changePhase(hokug.Phase.GO)", hokug.readyTime);
	}

	if (newPhase == hokug.Phase.GO) {
		setTimeout("hokug.changePhase(hokug.Phase.RUN)", hokug.goTime);
	}

	// タイマーを開始する
	if (newPhase == hokug.Phase.RUN) {
		hokug.state.start = (new Date()).getTime();
		hokug.state.remaining = hokug.gameTime;
		if (hokug.timerInterval > 0 && hokug.timer) {
			hokug.work.timerHandler = setInterval("hokug.timerBase()", hokug.timerInterval);
		}
	}

	if (newPhase == hokug.Phase.FINISH) {
		if (hokug.work.timerHandler != null) {
			clearInterval(hokug.work.timerHandler);
		}
		setTimeout("hokug.changePhase(hokug.Phase.GAMEOVER)", hokug.finishTime);
	}

	hokug.state.phase = newPhase;
	if (hokug.phaseChanged) {
		hokug.phaseChanged();
	}
};

// FINISHフェーズに移行する
hokug.finish = function () {
	hokug.changePhase(hokug.Phase.FINISH);
};

// ゲームをリスタートする(UNSTARTフェーズに移行する)
hokug.restart = function () {
	hokug.changePhase(hokug.Phase.UNSTART);
};

// Blockを描画する
hokug.drawBlock = function (block) {
	var targetImages = [];
	switch (block.vector) {
		case hokug.Vector.Top   : targetImages = block.topImgs;    break;
		case hokug.Vector.Right : targetImages = block.rightImgs;  break;
		case hokug.Vector.Bottom: targetImages = block.bottomImgs; break;
		case hokug.Vector.Left  : targetImages = block.leftImgs;   break;
	}
	if (targetImages.length === 0) { return; }

	var ago = ((new Date()).getTime() - block.startTime) / 200;
	ago = parseInt(ago % targetImages.length, 10);
	var x = block.x - (block.width / 2);
	var y = block.y - (block.height / 2);
	hokug.ctx.drawImage(targetImages[ago], x, y, block.width, block.height);
};

// 画像を画面の中心に描画する
hokug.drawCenter = function (img, width, height) {
	var x = (hokug.width - width) / 2;
	var y = (hokug.height - height) / 2;
	hokug.ctx.drawImage(img, x, y, width, height);
};

// 画面全体にfitするように画像を描画する
hokug.drawFillImage = function (img) {
	hokug.ctx.drawImage(img, 0, 0, hokug.width, hokug.height);
};

// 画面全体にfitするように色を描画する
hokug.drawFillRGBA = function (r, g, b, a) {
	hokug.ctx.beginPath();
	hokug.ctx.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
	hokug.ctx.fillRect(0, 0, hokug.width, hokug.height);
};

// 画面全体にfitするように色を描画する
hokug.drawFillColor = function (color) {
	hokug.ctx.beginPath();
	hokug.ctx.fillStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a + ")";
	hokug.ctx.fillRect(0, 0, hokug.width, hokug.height);
};

// 矩形を描画する
hokug.drawRect = function (x, y, w, h, color) {
	hokug.ctx.beginPath();
	hokug.ctx.fillStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a + ")";
	hokug.ctx.fillRect(x, y, w, h);
};

// 文字列を描画する
hokug.drawText = function(x, y, text, color, size) {
	var a = color.a;
	// 文字色
	var r = color.r;
	var g = color.g;
	var b = color.b;
	// 文字の影の色
	var sr = Math.floor(r / 2);
	var sg = Math.floor(g / 2);
	var sb = Math.floor(b / 2);
	// テキストを描画
	hokug.ctx.font          = "" + size + "px Arial";
	hokug.ctx.fillStyle     = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
	hokug.ctx.shadowColor   = "rgba(" + sr + ", " + sg + ", " + sb + ", " + a + ")";
	hokug.ctx.shadowOffsetX = 1;
	hokug.ctx.shadowOffsetY = 1;
	hokug.ctx.fillText(text, x, y);
	hokug.ctx.shadowColor   = "rgba(0, 0, 0, 0)";
};

// アニメーションを開始する
hokug.startAnimation = function (img, x, y, width, height, scaleType) {
	var newAnim = new hokug.Class.Anim();
	newAnim.x = x;
	newAnim.y = y;
	newAnim.width = width;
	newAnim.height = height;
	newAnim.img = img;
	newAnim.startTime = (new Date()).getTime();
	newAnim.type = scaleType;
	hokug.work.anims.push(newAnim);
};

// 線を描画する
hokug.drawLine = function (x1, y1, x2, y2, width, color) {
	var prevW = hokug.ctx.lineWidth;
	var prevS = hokug.ctx.strokeStyle;
	hokug.ctx.beginPath();
	hokug.ctx.lineWidth = width;
	hokug.ctx.strokeStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a + ")";
	hokug.ctx.moveTo(x1, y1);
	hokug.ctx.lineTo(x2, y2);
	hokug.ctx.stroke();
	// rollback
	hokug.ctx.lineWidth = prevW;
	hokug.ctx.strokeStyle = prevS;
};

// シンプルなフェースメッセージを描画する
hokug.drawSimpleMask = function (bgImg, maskColor, centerImg, w, h) {
	if (bgImg != null) {
		hokug.drawFillImage(bgImg);
	}
	if (maskColor == null) {
		maskColor = new hokug.Class.Color(255, 255, 255, 0.5);
	}
	hokug.drawFillColor(maskColor);
	if (centerImg != null) {
		hokug.drawCenter(centerImg, w, h);
	}
};

// Blockが画面外にいる場合、画面内に移動する
hokug.moveInner = function (block, margin) {
	block.x = Math.max(margin, block.x);
	block.y = Math.max(margin, block.y);
	block.x = Math.min(block.x, hokug.width - margin);
	block.y = Math.min(block.y, hokug.height - margin);
};

// Blockを生成する
hokug.createBasicBlock = function (x, y, w, h, images) {
	var newBlock = new hokug.Class.Block();
	newBlock.x = x;
	newBlock.y = y;
	newBlock.width  = w;
	newBlock.height = h;
	for (var i = 0; i < images.length; i++) {
		newBlock.topImgs.push(hokug.res[images[i]]);
	}
	return newBlock;
};

// ランダムな位置でBlockを生成する
hokug.createRandomBlock = function (x1, y1, x2, y2) {
	var newBlock = new hokug.Class.Block();
	newBlock.vector = Math.floor(Math.random() * 4);
	newBlock.x = x1 + Math.floor(Math.random() * (x2 - x1));
	newBlock.y = y1 + Math.floor(Math.random() * (y2 - y1));
	return newBlock;
};


////////////////////////////////////////////////////////////

//// ユーティリティ ////

// hokug用のユーティリティ
var hokugUtil = function () {};

// 画面の幅を取得する(px)
hokugUtil.getBrowserWidth = function () {
	if (window.innerWidth) {
		return window.innerWidth;
	} else if (document.documentElement && document.documentElement.clientWidth !== 0) {
		return document.documentElement.clientWidth;
	} else if (document.body) {
		return document.body.clientWidth;
	}
	return 0;
}

// イベントを追加する
hokugUtil.addEventListener = function (element, name, callback) {
	if (element.addEventListener) {
		element.addEventListener(name, callback, false);
	} else if (element.attachEvent) {
		element.attachEvent("on" + name, callback);
	}
}

// アニメーションを描画する
hokugUtil.refreshAnim = function (ctx, anims) {
	for (var i = 0; i < anims.length; i++) {
		var anim = anims[i];
		var nowTime = (new Date()).getTime();
		var scale = ((nowTime - anim.startTime) / 1000) * 2;
		if (anim.type == hokug.AnimType.Down) {
			scale = 1 - scale;
		}
		if (scale < 0 || 1 < scale) {
			anims.splice(i, 1);
			i--;
		} else {
			var w = anim.width * scale;
			var h = anim.height * scale;
			var x = anim.x - w / 2;
			var y = anim.y - h / 2;
			ctx.drawImage(anim.img, x, y, w, h);
		}
	}
};

// 画像をプレロードする
hokugUtil.resLoad = function (preLoad, res, callback) {
	if (preLoad.length === 0) { return; }

	var loadedCount = 0;
	for (var i = 0; i < preLoad.length; i++) {
		var newImg = new Image();
		newImg.src = hokug.resDirPath + "/" + preLoad[i];
		newImg.onload = function() {
			loadedCount++;
			if (loadedCount == preLoad.length) {
				if (callback) {
					callback();
				}
			}
		};
		res[preLoad[i]] = newImg;
	}
};


////////////////////////////////////////////////////////////

//// 即時実行処理 ////

// 画面読み込み時のロードイベントを設定
hokugUtil.addEventListener(window, "load", hokug.load);
