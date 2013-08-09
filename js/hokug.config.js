
/**
 * 描画対象のスクリーン.
 * 0=スマホ 1=PC
 *
 * @type {number}
 */
hokug.screenMode = 1;

/**
 * ゲームのCanvas幅(px).
 *
 * @type {number}
 */
hokug.width = 320;

/**
 * ゲームのCanvas高さ(px).
 *
 * @type {number}
 */
hokug.height = 400;

/**
 * Canvas領域以外の背景色.
 *
 * @type {string}
 */
hokug.outsideColor = "#444";

/**
 * タイマーイベント(hokug.timer)が呼ばれる間隔(ms).
 * 0にすると、タイマーイベント無し.
 *
 * @type {number}
 */
hokug.timerInterval = 50;

/**
 * Readyフェーズの時間(ms).
 *
 * @type {number}
 */
hokug.readyTime = 2000;

/**
 * Goフェーズの時間(ms).
 *
 * @type {number}
 */
hokug.goTime = 1000;

/**
 * Runフェーズの時間(ms).
 * -1にすると、無制限になる.
 *
 * @type {number}
 */
hokug.gameTime = 10000;

/**
 * Finishフェーズの時間(ms).
 *
 * @type {number}
 */
hokug.finishTime = 3000;

/**
 * リソースファイルが格納されているディレクトリの相対パス.
 *
 * @type {string}
 */
hokug.resDirPath = "img";

/**
 * リソースディレクトリから事前に読み込んでおく画像.
 *
 * @type {Array.<string>}
 */
hokug.preLoad = new Array();
