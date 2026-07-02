/**
 * Neon Flappy Bird - Core Game Engine
 */

// Web Audio API Synthesizer for Retro Arcade Sound Effects
class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      console.log('Audio Context Initialized Successfully');
    } catch (e) {
      console.error('Web Audio API not supported in this browser', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playJump() {
    if (this.muted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle'; // Retro, slightly soft sound
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    // Exponential frequency sweep up
    osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playScore() {
    if (this.muted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    
    // Play a dual-tone arpeggio (C5 -> E5)
    const playNote = (freq, startTime, duration, vol) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.linearRampToValueAtTime(0.01, startTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Note 1: C5 (523 Hz)
    playNote(523.25, time, 0.08, 0.12);
    // Note 2: E5 (659 Hz)
    playNote(659.25, time + 0.06, 0.15, 0.12);
  }

  playCrash() {
    if (this.muted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const time = this.ctx.currentTime;

    // Noise Generator for explosion effect
    const bufferSize = this.ctx.sampleRate * 0.35; // 0.35 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Bandpass Filter to make the crash sound more rumbly
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, time);
    filter.frequency.exponentialRampToValueAtTime(50, time + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseNode.start(time);
    noiseNode.stop(time + 0.35);

    // Add a secondary low frequency synth thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(100, time);
    subOsc.frequency.linearRampToValueAtTime(30, time + 0.25);
    
    subGain.gain.setValueAtTime(0.2, time);
    subGain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    
    subOsc.start(time);
    subOsc.stop(time + 0.25);
  }

  playReboot() {
    if (this.muted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playCoin() {
    if (this.muted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, time);
    osc.frequency.setValueAtTime(1318.51, time + 0.08);

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.linearRampToValueAtTime(0.01, time + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  playLevelUp() {
    if (this.muted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    const playNote = (freq, startTime, duration, type = 'square') => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.linearRampToValueAtTime(0.01, startTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    playNote(523.25, time, 0.12, 'square');
    playNote(659.25, time + 0.08, 0.12, 'square');
    playNote(783.99, time + 0.16, 0.12, 'square');
    playNote(1046.50, time + 0.24, 0.3, 'square');
  }
}

// Particle System for game aesthetics
class Particle {
  constructor(x, y, color, size, speedX, speedY, life) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.speedX = speedX;
    this.speedY = speedY;
    this.maxLife = life;
    this.life = life;
    this.alpha = 1;
  }

  update(dt) {
    this.x += this.speedX * dt;
    this.y += this.speedY * dt;
    
    // Smooth friction decay scaled by dt
    this.speedX *= Math.pow(0.96, dt);
    this.speedY *= Math.pow(0.96, dt);
    
    if (this.isPlasmaRing) {
      this.size += 0.8 * dt;
    }
    
    this.life -= dt;
    this.alpha = Math.max(0, this.life / this.maxLife);
  }

  draw(ctx) {
    if (this.isPlasmaRing) {
      ctx.save();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = this.alpha;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.save();
    
    // 1. Draw outer colored glow halo (much faster than shadowBlur)
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha * 0.22;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. Draw hot white core
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

// Main Game Controller
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Audio synthesizer
    this.audio = new AudioSynthesizer();
    
    // HTML elements
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.liveScoreEl = document.getElementById('live-score');
    this.bestScoreEl = document.getElementById('best-score');
    this.finalScoreEl = document.getElementById('final-score');
    this.gameOverBestEl = document.getElementById('game-over-best');
    this.restartBtn = document.getElementById('restart-btn');
    this.soundBtn = document.getElementById('sound-btn');
    this.soundPath = document.getElementById('sound-icon-path');
    
    // Settings elements
    this.settingsOverlay = document.getElementById('settings-overlay');
    this.settingsBtn = document.getElementById('settings-btn');
    this.settingsCloseBtn = document.getElementById('settings-close-btn');
    this.diffEasyBtn = document.getElementById('diff-easy-btn');
    this.diffNormalBtn = document.getElementById('diff-normal-btn');
    this.colorBubbles = document.querySelectorAll('.color-bubble');

    // Settings Configuration
    this.difficulty = localStorage.getItem('neon_flappy_difficulty') || 'NORMAL';
    this.birdColor = localStorage.getItem('neon_flappy_bird_color') || 'RED';
    this.isPaused = false;

    // Login & Tutorial states
    this.currentUser = null;
    this.tutorialSeen = false;
    this.tutorialStep = 0;
    this.currentUserFriends = [];
    this.currentUserPaymentCard = null;
    this.tutorialLang = localStorage.getItem('neon_flappy_tut_lang') || 'SI';
    this.tutorialSteps = {
      EN: [
        "Welcome! Use D-PAD arrows (bottom-left) or keyboard Arrow Keys to steer and dive. Let's fly!",
        "Configuration! Click the ⚙️ CONFIG OPTIONS button to open settings.",
        "Difficulty! Choose EASY mode for wide gaps and slower speed, or NORMAL mode for the retro snake challenge.",
        "Slow-Mo! Enable 'Chrono Slow-Mo' to slow down time when needed. Click FINISH to start!"
      ],
      SI: [
        "සාදරයෙන් පිළිගනිමු! පියාසර කිරීමට D-PAD ඊතල හෝ කීබෝඩ් Arrow Keys භාවිතා කරන්න.",
        "සැකසුම්! සැකසුම් පුවරුව විවෘත කිරීමට ⚙️ CONFIG OPTIONS ක්ලික් කරන්න.",
        "අපහසුතාව! EASY ප්‍රකාරයෙන් මන්දගාමී වේගයක්ද, NORMAL ප්‍රකාරයෙන් සර්ප අභියෝගයද ලැබේ.",
        "මන්දගාමී කාලය! බාධක මඟහැරීමට Chrono Slow-Mo සක්‍රීය කරන්න. පියාසර කිරීමට FINISH ක්ලික් කරන්න!"
      ],
      ZH: [
        "欢迎！使用左下角 D-PAD 方向键或键盘方向键控制飞行与俯冲。开始吧！",
        "系统配置！点击 ⚙️ CONFIG OPTIONS 按钮打开设置菜单。",
        "难度选择！选择 EASY 模式可享受较慢速度，选择 NORMAL 模式体验复古毒蛇挑战。",
        "慢动作！在设置中开启 Chrono Slow-Mo 以减慢时间。点击 FINISH 开始飞行！"
      ],
      JA: [
        "ようこそ！左下のD-PAD矢印キーまたはキーボードの矢印キーで飛行と急降下を操作します。",
        "システム設定！⚙️ CONFIG OPTIONS ボタンをクリックして設定を開きます。",
        "難易度！EASYモードは低速で広い隙間、NORMALモードはヘビが出現する挑戦です。",
        "スローモーション！設定で Chrono Slow-Mo を有効にすると時間を遅くできます。FINISHでスタート！"
      ]
    };

    // Load background images
    this.easyBgImage = new Image();
    this.easyBgImage.src = 'cartoon_bg.png';

    this.normalBgImage = new Image();
    this.normalBgImage.src = 'fire_mountain_bg.png';

    this.bgOffset = 0;

    // Coin & Shop System
    this.coinsCollected = parseInt(localStorage.getItem('neon_flappy_coins')) || 0;
    this.upgradeLevel = parseInt(localStorage.getItem('neon_flappy_upgrade_level')) || 0;
    this.coins = [];
    this.coinsThisRun = 0;

    // Breeding System State
    this.feedCount = parseInt(localStorage.getItem('neon_flappy_feed_count')) || 0;
    try {
      this.breedingEggs = JSON.parse(localStorage.getItem('neon_flappy_breeding_eggs')) || [];
    } catch (e) {
      this.breedingEggs = [];
    }

    this.activeTutorialMode = 'MAIN';
    this.loginTutorialSeen = localStorage.getItem('neon_flappy_login_tut_seen') === 'true';
    this.loginTutorialStep = 0;
    this.loginTutorialSteps = {
      EN: [
        "Welcome Coordinator! Enter Coordinator ID & Passcode, then click CONNECT SYSTEM to register or login. Or click PLAY NOW as guest."
      ],
      SI: [
        "සාදරයෙන් පිළිගනිමු Coordinator! Coordinator ID සහ Passcode ඇතුළත් කර CONNECT SYSTEM තෝරන්න. නැතහොත් guest ලෙස සම්බන්ධ වීමට PLAY NOW තෝරන්න."
      ],
      ZH: [
        "欢迎，协作者！输入协调员 ID 和访问密码，然后点击 CONNECT SYSTEM 进行注册或登录。或者点击 PLAY NOW 作为访客登录。"
      ],
      JA: [
        "コーディネーターへようこそ！ユーザー名与パスワードを入力し、CONNECT SYSTEM をタップしてログイン/登録します。または、PLAY NOW をタップしてゲストとしてログインします。"
      ]
    };
    this.homeTutorialSeen = localStorage.getItem('neon_flappy_home_tut_seen') === 'true';
    this.homeTutorialStep = 0;
    this.homeTutorialSteps = {
      EN: [
        "Welcome to the Bird Home! See your owned birds perched in the roost above. Let's explore!",
        "Inventory! View your owned birds and equipped stability jetpacks. Select any to equip instantly.",
        "Breeding! Select two parent birds and spend 100 coins to breed a new cyber egg.",
        "Nursery & Feed! Incubate eggs here. Buy Cyber Seeds from Feed tab to hatch them 30s faster!"
      ],
      SI: [
        "Bird Home එකට සාදරයෙන් පිළිගනිමු! ඔබ සතු කුරුල්ලන් ඉහළ කූඩුවේ පියාසලමින් සිටිනු දැකිය හැක.",
        "තොගය! ඔබ සතු කුරුල්ලන් සහ jetpacks මෙතැනින් පහසුවෙන්ම equip කරගත හැක.",
        "බෝ කිරීම! කුරුල්ලන් දෙදෙනෙකු තෝරා කාසි 100ක් වැය කර අලුත් බිත්තරයක් සාදා ගන්න.",
        "මෙහි බිත්තර රකිනු ලබයි. Feed ටැබ් එකෙන් Cyber Seeds ගෙන Hatch කිරීම තත්පර 30කින් වේගවත් කරන්න."
      ],
      ZH: [
        "欢迎来到小鸟家园！在上方栖息处可看到您拥有的所有小鸟。让我们探索吧！",
        "仓库！查看拥有的所有小鸟和已装备的喷气背包。点击即可装备。",
        "孵化！选择两只鸟作为双亲，花费 100 金币即可孵化出一颗电子鸟蛋。",
        "孵化室与喂食！在此处孵化鸟蛋。从 FEED 购买饲料可使孵化速度加快 30 秒！"
      ],
      JA: [
        "バードホームへようこそ！上部の止まり木にあなたが所有している鳥たちがいます。探索しましょう！",
        "インベントリ！所有している鳥と装備中のジェットパックを表示し、タップで即装備できます。",
        "ブリーディング！2羽の親鳥を選択し、100コインを使って新しいサイバーエッグを産みます。",
        "育雛室与エサ！ここで卵を孵化させます。FEEDタブでエサを買うと孵化が30秒早くなります！"
      ]
    };

    // Level progression
    this.level = 1;
    this.levelUpTimer = 0;
    this.gameWon = false;
    this.levelConfigs = [
      {
        name: "NEON GATEWAY",
        trailName: "CYAN GLOW",
        outlineColor: '#00f0ff',
        shadowColor: 'rgba(0, 240, 255, 0.6)',
        capColor: '#ff007f',
        capShadow: '#ff007f',
        shape: 'tapered',
        bodyColors: ['#001a1a', '#004d4d', '#b3f9ff', '#00f0ff', '#008080', '#002633'],
        capColors: ['#1a000d', '#4d0026', '#ffb3d9', '#ff007f', '#800040', '#33001a'],
        particleStyle: 'sparks',
        particleColor: '#00f0ff'
      },
      {
        name: "HELLFIRE ABYSS",
        trailName: "HELLFIRE",
        outlineColor: '#ff3300',
        shadowColor: 'rgba(255, 51, 0, 0.6)',
        capColor: '#ffea00',
        capShadow: '#ffea00',
        shape: 'inverse-tapered',
        bodyColors: ['#1a0500', '#4d1000', '#ffb399', '#ff3300', '#801a00', '#330a00'],
        capColors: ['#1a1500', '#4d3d00', '#fffae6', '#ffea00', '#807500', '#332f00'],
        particleStyle: 'fire',
        particleColor: '#ff3300'
      },
      {
        name: "TOXIC WASTE",
        trailName: "TOXIC FUMES",
        outlineColor: '#39ff14',
        shadowColor: 'rgba(57, 255, 20, 0.6)',
        capColor: '#cc00ff',
        capShadow: '#cc00ff',
        shape: 'hourglass',
        bodyColors: ['#051a00', '#104d00', '#bbfeb3', '#39ff14', '#1c8000', '#0b3300'],
        capColors: ['#14001a', '#3c004d', '#f6e6ff', '#cc00ff', '#660080', '#290033'],
        particleStyle: 'sparks',
        particleColor: '#39ff14'
      },
      {
        name: "ROYAL PLASMA",
        trailName: "PLASMA RINGS",
        outlineColor: '#ffea00',
        shadowColor: 'rgba(255, 234, 0, 0.6)',
        capColor: '#ff007f',
        capShadow: '#ff007f',
        shape: 'double-hourglass',
        bodyColors: ['#332600', '#806000', '#fff2cc', '#ffcc00', '#4d3d00', '#1a1400'],
        capColors: ['#33001a', '#800040', '#ffb3d9', '#ff007f', '#4d0026', '#1a000d'],
        particleStyle: 'plasma',
        particleColor: '#ff00ff'
      },
      {
        name: "CYBER JADE",
        trailName: "JADE SPARK",
        outlineColor: '#00ffcc',
        shadowColor: 'rgba(0, 255, 204, 0.6)',
        capColor: '#0066ff',
        capShadow: '#0066ff',
        shape: 'square',
        bodyColors: ['#001a14', '#004d3d', '#b3fff0', '#00ffcc', '#008066', '#003329'],
        capColors: ['#000a1a', '#001f4d', '#e6f0ff', '#0066ff', '#003380', '#001433'],
        particleStyle: 'sparks',
        particleColor: '#00ffcc'
      },
      {
        name: "SYNTHWAVE SUNSET",
        trailName: "NEON WAVE",
        outlineColor: '#ff00ff',
        shadowColor: 'rgba(255, 0, 255, 0.6)',
        capColor: '#ffff00',
        capShadow: '#ffff00',
        shape: 'tapered',
        bodyColors: ['#1a001a', '#4d004d', '#ffe6ff', '#ff00ff', '#800080', '#330033'],
        capColors: ['#1a1a00', '#4d4d00', '#ffffe6', '#ffff00', '#808000', '#333300'],
        particleStyle: 'fire',
        particleColor: '#ff00ff'
      },
      {
        name: "BLIZZARD STORM",
        trailName: "FROST TRAIL",
        outlineColor: '#00bfff',
        shadowColor: 'rgba(0, 191, 255, 0.6)',
        capColor: '#ffffff',
        capShadow: '#ffffff',
        shape: 'inverse-tapered',
        bodyColors: ['#00141a', '#003a4d', '#b3edff', '#00bfff', '#006080', '#002633'],
        capColors: ['#171717', '#3c3c3c', '#ffffff', '#e0e0e0', '#6e6e6e', '#2b2b2b'],
        particleStyle: 'sparks',
        particleColor: '#00bfff'
      },
      {
        name: "MATRIX CHIP",
        trailName: "CYBER CORE",
        outlineColor: '#00ff00',
        shadowColor: 'rgba(0, 255, 0, 0.6)',
        capColor: '#333333',
        capShadow: '#333333',
        shape: 'hourglass',
        bodyColors: ['#001a00', '#004d00', '#b3ffb3', '#00ff00', '#008000', '#003300'],
        capColors: ['#0a0a0a', '#1a1a1a', '#cccccc', '#666666', '#333333', '#111111'],
        particleStyle: 'sparks',
        particleColor: '#00ff00'
      },
      {
        name: "BUBBLEGUM DREAM",
        trailName: "SWEET GLOW",
        outlineColor: '#ff66cc',
        shadowColor: 'rgba(255, 102, 204, 0.6)',
        capColor: '#33ccff',
        capShadow: '#33ccff',
        shape: 'double-hourglass',
        bodyColors: ['#1a0a14', '#4d1f3d', '#ffe6f7', '#ff66cc', '#803366', '#331429'],
        capColors: ['#0a1a1a', '#1f4d4d', '#e6faff', '#33ccff', '#1a6680', '#0a2933'],
        particleStyle: 'fire',
        particleColor: '#ff66cc'
      },
      {
        name: "MONOCHROME ZERO",
        trailName: "SILVER STREAK",
        outlineColor: '#e0e0e0',
        shadowColor: 'rgba(224, 224, 224, 0.6)',
        capColor: '#00ffff',
        capShadow: '#00ffff',
        shape: 'square',
        bodyColors: ['#171717', '#3c3c3c', '#ffffff', '#e0e0e0', '#6e6e6e', '#2b2b2b'],
        capColors: ['#001a1a', '#004d4d', '#b3f9ff', '#00f0ff', '#008080', '#002633'],
        particleStyle: 'sparks',
        particleColor: '#ffffff'
      },
      {
        name: "SHADOW AMBER",
        trailName: "AMBER FLAME",
        outlineColor: '#ff9900',
        shadowColor: 'rgba(255, 153, 0, 0.6)',
        capColor: '#6600cc',
        capShadow: '#6600cc',
        shape: 'tapered',
        bodyColors: ['#1a0f00', '#4d2e00', '#ffe0b3', '#ff9900', '#804c00', '#331e00'],
        capColors: ['#0a001a', '#1f004d', '#e6ccff', '#6600cc', '#330066', '#140029'],
        particleStyle: 'fire',
        particleColor: '#ff9900'
      },
      {
        name: "POLICE BEAT",
        trailName: "SIREN PULSE",
        outlineColor: '#ff0033',
        shadowColor: 'rgba(255, 0, 51, 0.6)',
        capColor: '#0055ff',
        capShadow: '#0055ff',
        shape: 'inverse-tapered',
        bodyColors: ['#1a0005', '#4d000f', '#ffb3bf', '#ff0033', '#80001a', '#33000a'],
        capColors: ['#00091a', '#001a4d', '#b3ccff', '#0055ff', '#002b80', '#001133'],
        particleStyle: 'fire',
        particleColor: '#ff0033'
      },
      {
        name: "GALAXY MINT",
        trailName: "NEBULA DRIFT",
        outlineColor: '#98ff98',
        shadowColor: 'rgba(152, 255, 152, 0.6)',
        capColor: '#8a2be2',
        capShadow: '#8a2be2',
        shape: 'hourglass',
        bodyColors: ['#0f1a0f', '#2d4d2d', '#ebffeb', '#98ff98', '#4c804c', '#1e331e'],
        capColors: ['#0d041a', '#290c4d', '#f0e6ff', '#8a2be2', '#451580', '#1c0833'],
        particleStyle: 'rainbow',
        particleColor: '#98ff98'
      },
      {
        name: "STEAM COG",
        trailName: "BRONZE STEAM",
        outlineColor: '#cd7f32',
        shadowColor: 'rgba(205, 127, 50, 0.6)',
        capColor: '#00ff88',
        capShadow: '#00ff88',
        shape: 'double-hourglass',
        bodyColors: ['#1a1006', '#4d3013', '#ffebcc', '#cd7f32', '#804f1f', '#33200c'],
        capColors: ['#001a0e', '#004d29', '#b3ffd8', '#00ff88', '#008044', '#00331b'],
        particleStyle: 'sparks',
        particleColor: '#cd7f32'
      },
      {
        name: "CORAL DEEP",
        trailName: "CORAL REEF",
        outlineColor: '#ff7f50',
        shadowColor: 'rgba(255, 127, 80, 0.6)',
        capColor: '#120a8f',
        capShadow: '#120a8f',
        shape: 'square',
        bodyColors: ['#1a0d08', '#4d2618', '#ffe5cc', '#ff7f50', '#803f28', '#331910'],
        capColors: ['#010014', '#05023c', '#d6d3ff', '#120a8f', '#090547', '#03021c'],
        particleStyle: 'fire',
        particleColor: '#ff7f50'
      },
      {
        name: "ELVEN FOREST",
        trailName: "FOREST WIND",
        outlineColor: '#b76e79',
        shadowColor: 'rgba(183, 110, 121, 0.6)',
        capColor: '#50c878',
        capShadow: '#50c878',
        shape: 'tapered',
        bodyColors: ['#1a0f11', '#4d2d32', '#ffd9df', '#b76e79', '#804d55', '#331e22'],
        capColors: ['#081a0f', '#184d2d', '#ccffe1', '#50c878', '#28804c', '#10331e'],
        particleStyle: 'plasma',
        particleColor: '#50c878'
      },
      {
        name: "CHRONO PORTAL",
        trailName: "CHRONO SPEED",
        outlineColor: '#00ffff',
        shadowColor: 'rgba(0, 255, 255, 0.6)',
        capColor: '#ffaa00',
        capShadow: '#ffaa00',
        shape: 'inverse-tapered',
        bodyColors: ['#001a1a', '#004d4d', '#b3f9ff', '#00f0ff', '#008080', '#002633'],
        capColors: ['#1a1100', '#4d3300', '#ffeeb3', '#ffaa00', '#805500', '#332200'],
        particleStyle: 'sparks',
        particleColor: '#00ffff'
      },
      {
        name: "CELESTIAL VIOLET",
        trailName: "STAR DUST",
        outlineColor: '#e6e6fa',
        shadowColor: 'rgba(230, 230, 250, 0.6)',
        capColor: '#ffd700',
        capShadow: '#ffd700',
        shape: 'hourglass',
        bodyColors: ['#17171a', '#3e3e4d', '#ffffff', '#e6e6fa', '#737380', '#2e2e33'],
        capColors: ['#1a1500', '#4d3f00', '#fff5b3', '#ffd700', '#806c00', '#332b00'],
        particleStyle: 'rainbow',
        particleColor: '#e6e6fa'
      },
      {
        name: "RUBY LUXURY",
        trailName: "RUBY SHARDS",
        outlineColor: '#e0115f',
        shadowColor: 'rgba(224, 17, 95, 0.6)',
        capColor: '#b9f2ff',
        capShadow: '#b9f2ff',
        shape: 'double-hourglass',
        bodyColors: ['#1a020b', '#4d0520', '#ffb3cc', '#e0115f', '#800a36', '#330416'],
        capColors: ['#12191a', '#374b4d', '#ffffff', '#b9f2ff', '#5c7980', '#253033'],
        particleStyle: 'plasma',
        particleColor: '#e0115f'
      },
      {
        name: "OMNI CHROME",
        trailName: "RAINBOW ARCHITECT",
        outlineColor: '#ffffff',
        shadowColor: 'rgba(255, 255, 255, 0.8)',
        capColor: '#ffffff',
        capShadow: '#ffffff',
        shape: 'square',
        bodyColors: [],
        capColors: [],
        particleStyle: 'rainbow_fast',
        particleColor: '#ffffff'
      }
    ];

    // Hearts & Invincibility Extra Lives System
    this.hearts = 0;
    this.invincibleTimer = 0;

    // Heart Continue Overlay elements
    this.continueOverlay = document.getElementById('continue-overlay');
    this.continueYesBtn = document.getElementById('continue-yes-btn');
    this.continueNoBtn = document.getElementById('continue-no-btn');
    this.liveHeartsEl = document.getElementById('live-hearts');

    // Slow-Mo Option
    this.slowMoActive = localStorage.getItem('neon_flappy_slow_mo') === 'true';

    // Premium Birds definitions
    this.premiumBirds = [
      { id: 'EAGLE', name: 'Eagle Commander', price: 80, color: '#cc9966', description: 'Tactical avian. Pure golden-brown gradient.' },
      { id: 'CANARY', name: 'Chrono Canary', price: 150, color: '#ccff33', description: 'Cyber marking gear. Lime-yellow gradient.' },
      { id: 'PHOENIX', name: 'Shadow Phoenix', price: 300, color: '#990033', description: 'Volcanic flame master. Magenta-purple gradient.' }
    ];

    // Jetpacks definitions
    this.jetpacks = [
      { id: 'rusty', name: 'Rusty Thruster', price: 10, stability: 0.03, color: '#a05a2c', description: 'Leaky fuel tank. -3% gravity.' },
      { id: 'neon', name: 'Neon Booster', price: 30, stability: 0.06, color: '#00f0ff', description: 'Standard cyber booster. -6% gravity.' },
      { id: 'flap', name: 'Flap Assist', price: 60, stability: 0.10, color: '#ffea00', description: 'Electric wing assistant. -10% gravity.' },
      { id: 'plasma', name: 'Plasma Injector', price: 100, stability: 0.14, color: '#ff00ff', description: 'Pressurized plasma. -14% gravity.' },
      { id: 'sonic', name: 'Sonic Glide', price: 150, stability: 0.18, color: '#80c0ff', description: 'Sonic wave stability. -18% gravity.' },
      { id: 'cosmic', name: 'Cosmic Cruiser', price: 200, stability: 0.22, color: '#9400d3', description: 'Stardust powered engine. -22% gravity.' },
      { id: 'crimson', name: 'Crimson Overdrive', price: 250, stability: 0.26, color: '#ff3300', description: 'Volcanic turbine flow. -26% gravity.' },
      { id: 'quantum', name: 'Quantum Warp', price: 320, stability: 0.30, color: '#00ff66', description: 'Sub-atomic micro-glides. -30% gravity.' },
      { id: 'hyper', name: 'Hyper Drive', price: 400, stability: 0.35, color: '#ff007f', description: 'Overclocked vector force. -35% gravity.' },
      { id: 'darkmatter', name: 'Dark Matter', price: 500, stability: 0.40, color: '#4b0082', description: 'Void gravity disruptor. -40% gravity.' }
    ];

    // Premium Birds and Jetpacks unlocked state
    try {
      this.unlockedBirds = JSON.parse(localStorage.getItem('neon_flappy_unlocked_birds')) || [];
    } catch (e) {
      this.unlockedBirds = [];
    }
    try {
      this.unlockedJetpacks = JSON.parse(localStorage.getItem('neon_flappy_unlocked_jetpacks')) || [];
    } catch (e) {
      this.unlockedJetpacks = [];
    }
    this.equippedJetpack = localStorage.getItem('neon_flappy_equipped_jetpack') || 'none';

    try {
      this.isPremium = localStorage.getItem('neon_flappy_is_premium') === 'true';
    } catch (e) {
      this.isPremium = false;
    }
    try {
      this.deathCount = parseInt(localStorage.getItem('neon_flappy_death_count')) || 0;
    } catch (e) {
      this.deathCount = 0;
    }

    // Snakes and Guard Shield System initialization
    this.snakes = [];
    this.guardActive = false;
    this.guardTimer = 0;
    this.snakeSpawnTimer = 180;

    try {
      this.jetpackUpgrades = JSON.parse(localStorage.getItem('neon_flappy_jetpack_upgrades')) || {};
    } catch (e) {
      this.jetpackUpgrades = {};
    }

    // Logical Dimensions (9:16 Aspect Ratio)
    this.width = 360;
    this.height = 640;
    
    // States: 'START', 'PLAYING', 'GAMEOVER'
    this.state = 'START';
    
    // Physics parameters
    this.gravity = 0.38;
    this.jumpForce = -7.2;
    this.maxFallSpeed = 9.0;
    
    // Game entities
    this.bird = {
      x: 100,
      y: 300,
      radius: 14,
      velocity: 0,
      vx: 0,
      facingRight: true,
      angle: 0,
      targetAngle: 0,
      wingTimer: 0
    };
    
    this.pipes = [];
    this.particles = [];
    
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('neon_flappy_high_score')) || 0;
    
    // Game pacing
    this.scrollSpeed = 2.4;
    this.distanceTraveled = 0;
    this.trailTimer = 0;
    this.targetDistance = 240;
    this.animationTime = 0;
    this.frameCount = 0;
    
    // Grid alignment for futuristic background fallback
    this.gridOffset = 0;
    
    this.initEvents();
    this.resizeCanvas();
    this.reset();
    
    // Start Game Loop
    this.lastTime = performance.now();
    this.loop(this.lastTime);

    if (!this.loginTutorialSeen) {
      setTimeout(() => this.startLoginTutorial(), 300);
    }
  }

  // Set high-DPI resolution for clean canvas graphics
  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    
    // Calculate the size matching the CSS layout
    const rect = this.canvas.parentNode.getBoundingClientRect();
    
    // Standardize coordinates
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    
    // Scale Context once
    this.ctx.scale(dpr, dpr);
    
    console.log(`Canvas Scaled to: ${this.canvas.width}x${this.canvas.height} (DPR: ${dpr})`);
  }

  initEvents() {
    // Resize listener
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
    // Prevent menu overlays and interactive buttons from bubbling pointerdown events to deviceFrame (which triggers jumps/game starts)
    const stopBubbleIds = [
      'login-overlay', 'tutorial-overlay', 'tutorial-bubble-container', 
      'settings-overlay', 'account-overlay', 'admin-overlay', 'continue-overlay', 
      'game-over-screen', 'hud', 'start-settings-btn', 'start-account-btn', 
      'guard-btn', 'dpad-container', 'announcement-overlay', 'announcement-close-btn',
      'home-overlay', 'start-home-btn', 'home-close-btn'
    ];
    stopBubbleIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
        });
      }
    });

    // Tap/Click Action
    const triggerJump = (e) => {
      // Prevent standard browser zoom/scrolling
      if (e.cancelable) e.preventDefault();
      
      // Do not jump if login overlay or settings panel is open
      const loginOverlay = document.getElementById('login-overlay');
      if (loginOverlay && !loginOverlay.classList.contains('hide')) return;

      if (this.isPaused) return;
      
      // Calculate relative X on the device Frame to determine left/right tap
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const dir = relativeX < rect.width / 2 ? 'left' : 'right';
      
      this.handleInput(dir);
    };

    // Bind touch/mouse events to active viewport wrapper
    const container = document.getElementById('deviceFrame');
    container.addEventListener('pointerdown', triggerJump);

    // Keyboard support (Enhanced for full D-pad steering controls)
    window.addEventListener('keydown', (e) => {
      // If login screen is active, do not allow keyboard game starts
      const loginOverlay = document.getElementById('login-overlay');
      if (loginOverlay && !loginOverlay.classList.contains('hide')) {
        return;
      }

      if (this.isPaused || this.state !== 'PLAYING') {
        // Space / Enter starts the game if on start screen
        if (this.state === 'START' && (e.code === 'Space' || e.code === 'Enter')) {
          e.preventDefault();
          this.handleInput('right');
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        this.handleInput(this.bird.facingRight ? 'right' : 'left');
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        this.audio.init();
        this.bird.velocity = this.jumpForce;
        this.audio.playJump();
        this.createJumpParticles();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        this.bird.velocity = 5.0; // Fast dive
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.audio.init();
        this.bird.facingRight = false;
        this.bird.vx = -3.2;
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.audio.init();
        this.bird.facingRight = true;
        this.bird.vx = 3.2;
      }
    });

    // On-screen touch D-pad event listeners (with propagation & default prevention)
    const dpadUp = document.getElementById('dpad-up');
    const dpadDown = document.getElementById('dpad-down');
    const dpadLeft = document.getElementById('dpad-left');
    const dpadRight = document.getElementById('dpad-right');

    if (dpadUp) {
      dpadUp.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.isPaused || this.state !== 'PLAYING') return;
        this.audio.init();
        this.bird.velocity = this.jumpForce;
        this.audio.playJump();
        this.createJumpParticles();
      });
    }

    if (dpadDown) {
      dpadDown.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.isPaused || this.state !== 'PLAYING') return;
        this.bird.velocity = 5.0; // Fast dive
      });
    }

    if (dpadLeft) {
      dpadLeft.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.isPaused || this.state !== 'PLAYING') return;
        this.audio.init();
        this.bird.facingRight = false;
        this.bird.vx = -3.2;
      });
    }

    if (dpadRight) {
      dpadRight.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.isPaused || this.state !== 'PLAYING') return;
        this.audio.init();
        this.bird.facingRight = true;
        this.bird.vx = 3.2;
      });
    }

    // Sound toggle listener
    this.soundBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid triggering jump
      this.toggleSound();
    });

    // Snake Guard button click listener
    const guardBtn = document.getElementById('guard-btn');
    if (guardBtn) {
      guardBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid triggering jump
        if (this.state === 'PLAYING' && !this.guardActive && this.coinsCollected >= 15) {
          this.coinsCollected -= 15;
          this.saveProgress();
          this.guardActive = true;
          this.guardTimer = 10.0;
          this.audio.playLevelUp(); // Shield activation sound
          this.updateUpgradeUI();
          this.updateGuardUI();
        } else if (this.state === 'PLAYING' && !this.guardActive && this.coinsCollected < 15) {
          this.audio.playCrash(); // Fail sound
        }
      });
    }

    // Settings panel gear toggle
    this.settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.init();
      this.isPaused = true;
      this.showOverlay(this.settingsOverlay);
      this.updateDpadVisibility();
    });

    // Settings close apply button
    this.settingsCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.playReboot();
      this.isPaused = false;
      this.hideOverlay(this.settingsOverlay);
      this.updateDpadVisibility();
    });

    // Announcement close button
    const annCloseBtn = document.getElementById('announcement-close-btn');
    if (annCloseBtn) {
      annCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playJump();
        this.hideOverlay(document.getElementById('announcement-overlay'));
        this.isPaused = false;
        
        if (this.gameWon) {
          this.gameWon = false;
          this.reset();
          this.state = 'START';
          this.showOverlay(this.startScreen);
        }
        
        this.updateDpadVisibility();
      });
    }

    // Tabbed settings menu navigation
    const tabBtns = document.querySelectorAll('.settings-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playJump();
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tc => tc.classList.add('hide'));
        
        const targetId = btn.getAttribute('data-tab');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.remove('hide');
        }
      });
    });

    // Slow-Mo Toggle button event listener
    const slowmoBtn = document.getElementById('slowmo-toggle-btn');
    if (slowmoBtn) {
      slowmoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.slowMoActive = !this.slowMoActive;
        localStorage.setItem('neon_flappy_slow_mo', this.slowMoActive ? 'true' : 'false');
        this.audio.playReboot();
        this.updateSlowMoUI();
      });
    }

    // Difficulty toggle selectors
    const selectDifficulty = (diff) => {
      this.difficulty = diff;
      localStorage.setItem('neon_flappy_difficulty', diff);
      
      if (diff === 'EASY') {
        this.diffEasyBtn.classList.add('active');
        this.diffEasyBtn.style.borderColor = 'var(--neon-cyan)';
        this.diffEasyBtn.style.background = 'rgba(0, 240, 255, 0.15)';
        this.diffEasyBtn.style.color = '#fff';
        
        this.diffNormalBtn.classList.remove('active');
        this.diffNormalBtn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        this.diffNormalBtn.style.background = 'transparent';
        this.diffNormalBtn.style.color = '#fff';
      } else {
        this.diffNormalBtn.classList.add('active');
        this.diffNormalBtn.style.borderColor = 'var(--neon-cyan)';
        this.diffNormalBtn.style.background = 'rgba(0, 240, 255, 0.15)';
        this.diffNormalBtn.style.color = '#fff';
        
        this.diffEasyBtn.classList.remove('active');
        this.diffEasyBtn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        this.diffEasyBtn.style.background = 'transparent';
        this.diffEasyBtn.style.color = '#fff';
      }
      this.reset();
    };

    this.diffEasyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectDifficulty('EASY');
    });

    this.diffNormalBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectDifficulty('NORMAL');
    });

    // Color Bubble selection
    this.colorBubbles.forEach((bubble) => {
      bubble.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = bubble.getAttribute('data-color');
        this.birdColor = color;
        
        this.colorBubbles.forEach((b) => {
          b.classList.remove('active');
          b.style.borderColor = 'transparent';
        });
        bubble.classList.add('active');
        bubble.style.borderColor = '#ffffff';
        
        this.saveProgress();
        
        // Refresh premium shops to show "EQUIP" instead of "EQUIPPED"
        this.updateUpgradeUI();
      });
    });

    // Bird Home Open button
    const startHomeBtn = document.getElementById('start-home-btn');
    if (startHomeBtn) {
      startHomeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playJump();
        this.showOverlay(document.getElementById('home-overlay'));
        this.updateHomeUI();
        if (!this.homeTimer) {
          this.homeTimer = setInterval(() => this.updateHomeUI(), 1000);
        }
        if (!this.homeTutorialSeen) {
          this.startHomeTutorial();
        }
      });
    }

    // Bird Home Close button
    const homeCloseBtn = document.getElementById('home-close-btn');
    if (homeCloseBtn) {
      homeCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playReboot();
        this.hideOverlay(document.getElementById('home-overlay'));
        if (this.homeTimer) {
          clearInterval(this.homeTimer);
          this.homeTimer = null;
        }
      });
    }

    // Bird Home tab navigation
    const homeTabBtns = document.querySelectorAll('.home-tab-btn');
    homeTabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playJump();
        homeTabBtns.forEach(b => {
          b.classList.remove('active');
          b.style.borderBottomColor = 'transparent';
          b.style.color = '#8fa0dd';
          b.style.textShadow = 'none';
        });
        btn.classList.add('active');
        btn.style.borderBottomColor = 'var(--neon-yellow)';
        btn.style.color = 'var(--neon-yellow)';
        btn.style.textShadow = 'var(--glow-yellow)';

        const homeTabContents = document.querySelectorAll('.home-tab-content');
        homeTabContents.forEach(tc => tc.classList.add('hide'));

        const targetId = btn.getAttribute('data-tab');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.remove('hide');
        }
      });
    });

    // Parent select dropdown change previews
    const parentASelect = document.getElementById('breed-parent-a-select');
    const parentBSelect = document.getElementById('breed-parent-b-select');
    const parentAPreview = document.getElementById('breed-parent-a-preview');
    const parentBPreview = document.getElementById('breed-parent-b-preview');

    const updateParentPreview = (selectEl, previewEl) => {
      const val = selectEl.value;
      if (!val) {
        previewEl.innerHTML = '<span style="font-size: 1.2rem;">❓</span>';
        previewEl.style.borderColor = selectEl.id.includes('a') ? 'rgba(0,240,255,0.3)' : 'rgba(255,0,127,0.3)';
        previewEl.style.background = 'rgba(0,0,0,0.3)';
        return;
      }
      let color = '#fff';
      if (val === 'RED') color = '#ff3333';
      else if (val === 'CYAN') color = '#00f0ff';
      else if (val === 'YELLOW') color = '#ffea00';
      else if (val === 'PINK') color = '#ff007f';
      else if (val === 'EAGLE') color = '#cc9966';
      else if (val === 'CANARY') color = '#ccff33';
      else if (val === 'PHOENIX') color = '#ff007f';
      else if (val === 'CHICK') color = '#ffff00';

      previewEl.innerHTML = `<div style="width: 25px; height: 25px; border-radius: 50%; background: ${color}; box-shadow: 0 0 10px ${color};"></div>`;
      previewEl.style.borderColor = color;
      previewEl.style.background = 'rgba(255,255,255,0.05)';
    };

    if (parentASelect) {
      parentASelect.addEventListener('change', () => updateParentPreview(parentASelect, parentAPreview));
    }
    if (parentBSelect) {
      parentBSelect.addEventListener('change', () => updateParentPreview(parentBSelect, parentBPreview));
    }

    // Breed birds button click
    const breedBtn = document.getElementById('breed-action-btn');
    if (breedBtn) {
      breedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const parentA = parentASelect ? parentASelect.value : '';
        const parentB = parentBSelect ? parentBSelect.value : '';
        const errMsg = document.getElementById('breed-error-msg');

        if (!parentA || !parentB) {
          this.audio.playReboot();
          if (errMsg) errMsg.textContent = 'PLEASE SELECT BOTH PARENT BIRDS!';
          return;
        }
        if (this.coinsCollected < 100) {
          this.audio.playReboot();
          if (errMsg) errMsg.textContent = 'INSUFFICIENT COINS! NEED 100 🪙';
          return;
        }
        const activeEggs = this.breedingEggs.filter(egg => !egg.claimed);
        if (activeEggs.length >= 3) {
          this.audio.playReboot();
          if (errMsg) errMsg.textContent = 'HATCHERY IS FULL! MAX 3 EGGS ALLOWED.';
          return;
        }

        this.coinsCollected -= 100;
        this.audio.playJump();
        if (errMsg) errMsg.textContent = '';

        this.breedingEggs.push({
          id: Date.now() + Math.random().toString(36).substr(2, 5),
          parentA: parentA,
          parentB: parentB,
          startTime: Date.now(),
          hatchDuration: 240,
          claimed: false
        });

        this.saveProgress();
        
        if (parentASelect) parentASelect.value = '';
        if (parentBSelect) parentBSelect.value = '';
        if (parentASelect && parentAPreview) updateParentPreview(parentASelect, parentAPreview);
        if (parentBSelect && parentBPreview) updateParentPreview(parentBSelect, parentBPreview);

        const nurseryTabBtn = document.querySelector('[data-tab="tab-home-nursery"]');
        if (nurseryTabBtn) nurseryTabBtn.click();
      });
    }

    // Buy Cyber Seed feed button click
    const buyFeedBtn = document.getElementById('buy-feed-btn');
    if (buyFeedBtn) {
      buyFeedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.coinsCollected < 50) {
          this.audio.playReboot();
          alert('INSUFFICIENT COINS! SEED BAG COSTS 50 🪙.');
          return;
        }
        this.coinsCollected -= 50;
        this.feedCount++;
        this.audio.playCoin();
        this.saveProgress();
        this.updateHomeUI();
      });
    }

    // Inventory Event Delegation
    const invList = document.getElementById('home-inventory-list');
    if (invList) {
      invList.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.classList.contains('equip-bird-btn')) {
          const birdId = e.target.getAttribute('data-bird-id');
          this.birdColor = birdId;
          this.audio.playJump();
          this.saveProgress();
          this.updateHomeUI();
        }
        if (e.target.classList.contains('unlock-hawk-btn')) {
          const unlockAction = () => {
            this.unlockedBirds.push('HAWK');
            this.birdColor = 'HAWK';
            this.saveProgress();
            this.audio.playLevelUp();
            this.updateHomeUI();
          };
          if (this.isPremium) {
            unlockAction();
          } else {
            this.showRewardedAd('HAWK', unlockAction);
          }
        }
        if (e.target.classList.contains('equip-jp-btn')) {
          const jpId = e.target.getAttribute('data-jp-id');
          this.equippedJetpack = jpId;
          this.audio.playJump();
          this.saveProgress();
          this.updateHomeUI();
        }
      });
      invList.addEventListener('pointerdown', (e) => e.stopPropagation());
    }

    // Nursery Event Delegation
    const nurseryList = document.getElementById('home-nursery-list');
    if (nurseryList) {
      nurseryList.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Feed Seed
        if (e.target.classList.contains('feed-seed-btn')) {
          const eggId = e.target.getAttribute('data-egg-id');
          const egg = this.breedingEggs.find(g => g.id === eggId);
          if (egg && this.feedCount > 0) {
            this.feedCount--;
            egg.hatchDuration = Math.max(0, egg.hatchDuration - 30);
            this.audio.playJump();
            this.saveProgress();
            this.updateHomeUI();
          }
        }
        
        // Hatch Egg
        if (e.target.classList.contains('hatch-egg-btn')) {
          const eggId = e.target.getAttribute('data-egg-id');
          const eggIndex = this.breedingEggs.findIndex(g => g.id === eggId);
          if (eggIndex !== -1) {
            const egg = this.breedingEggs[eggIndex];
            this.breedingEggs.splice(eggIndex, 1);
            
            let rewardMsg = '';
            if (!this.unlockedBirds.includes('CHICK')) {
              this.unlockedBirds.push('CHICK');
              rewardMsg = 'CONGRATULATIONS!\n\nYou hatched the exclusive ROBO CHICK skin!\n\nCheck your Inventory to equip it.';
            } else {
              let lockedBirds = this.premiumBirds.filter(b => !this.unlockedBirds.includes(b.id));
              if (lockedBirds.length > 0) {
                const randomBird = lockedBirds[Math.floor(Math.random() * lockedBirds.length)];
                this.unlockedBirds.push(randomBird.id);
                rewardMsg = `CONGRATULATIONS!\n\nYour egg hatched and grew into the premium ${randomBird.name} skin!\n\nCheck your Inventory to equip it.`;
              } else {
                this.coinsCollected += 100;
                rewardMsg = 'CONGRATULATIONS!\n\nYou have unlocked all skins!\n\nYour hatched egg grants you a Jackpot of 100 Coins! 🪙';
              }
            }
            
            this.audio.playUpgrade();
            this.saveProgress();
            this.updateHomeUI();
            
            const annOverlay = document.getElementById('announcement-overlay');
            const annTitle = document.getElementById('announcement-title');
            const annMsg = document.getElementById('announcement-message');
            if (annOverlay && annTitle && annMsg) {
              annTitle.textContent = 'EGG HATCHED!';
              annTitle.style.color = 'var(--neon-yellow)';
              annTitle.style.textShadow = 'var(--glow-yellow)';
              annMsg.textContent = rewardMsg;
              annOverlay.classList.remove('hide');
              this.isPaused = true;
            }
          }
        }
      });
      nurseryList.addEventListener('pointerdown', (e) => e.stopPropagation());
    }

    // Restart button
    this.restartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.playReboot();
      this.reset();
      this.state = 'PLAYING';
      this.hideOverlay(this.gameOverScreen);
    });

    // Game over rewarded ad button click (+50 coins)
    const gameOverAdBtn = document.getElementById('game-over-ad-btn');
    if (gameOverAdBtn) {
      gameOverAdBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playJump();
        
        const grantReward = () => {
          this.coinsCollected += 50;
          this.saveProgress();
          
          const gameOverCoinsEl = document.getElementById('game-over-coins');
          if (gameOverCoinsEl) {
            gameOverCoinsEl.textContent = `+${this.coinsThisRun} (+50 🪙)`;
          }
          
          gameOverAdBtn.disabled = true;
          gameOverAdBtn.style.borderColor = '#555566';
          gameOverAdBtn.style.color = '#8888aa';
          gameOverAdBtn.style.boxShadow = 'none';
          gameOverAdBtn.textContent = {
            EN: 'CLAIMED',
            SI: 'ලබාගත්තා',
            ZH: '已领取',
            JA: '獲得済み'
          }[this.tutorialLang] || 'CLAIMED';
        };
        
        if (this.isPremium) {
          grantReward();
        } else {
          this.showRewardedAd('coins', grantReward);
        }
      });
    }

    // Continue rewarded ad button click (reboot free)
    const continueAdBtn = document.getElementById('continue-ad-btn');
    if (continueAdBtn) {
      continueAdBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playJump();
        
        if (this.isPremium) {
          this.rebootGameFree();
        } else {
          this.showRewardedAd('reboot', () => {
            this.rebootGameFree();
          });
        }
      });
    }

    // Start Screen Settings button
    const startSettingsBtn = document.getElementById('start-settings-btn');
    if (startSettingsBtn) {
      startSettingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.init();
        if (this.state === 'START' && !this.tutorialSeen && this.tutorialStep === 1) {
          this.nextTutorialStep();
          return;
        }
        this.isPaused = true;
        this.updateUpgradeUI();
        this.showOverlay(this.settingsOverlay);
      });
    }

    // Profile Button Click
    const startAccountBtn = document.getElementById('start-account-btn');
    const accountOverlay = document.getElementById('account-overlay');
    if (startAccountBtn && accountOverlay) {
      startAccountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.init();
        this.showOverlay(accountOverlay);
        this.isPaused = true;
        this.initAccountOverlay();
      });
    }

    // Account Close Button Click
    const accountCloseBtn = document.getElementById('account-close-btn');
    if (accountCloseBtn && accountOverlay) {
      accountCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playReboot();
        this.hideOverlay(accountOverlay);
        this.isPaused = false;
      });
    }

    // Guest Register redirect button Click
    const guestLoginRedirectBtn = document.getElementById('account-guest-login-btn');
    if (guestLoginRedirectBtn && accountOverlay) {
      guestLoginRedirectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playReboot();
        this.hideOverlay(accountOverlay);
        this.isPaused = false;
        
        // Open login overlay
        const loginOverlay = document.getElementById('login-overlay');
        const startScreen = document.getElementById('start-screen');
        if (loginOverlay) {
          loginOverlay.classList.remove('hide');
        }
        if (startScreen) {
          startScreen.classList.add('hide');
        }
      });
    }

    // Account Tab Switchers
    const accountTabBtns = document.querySelectorAll('.account-tab-btn');
    const accountTabContents = document.querySelectorAll('.account-tab-content');
    
    accountTabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playJump();
        
        const targetTab = btn.getAttribute('data-tab');
        
        // Remove active class from all buttons
        accountTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Hide all contents
        accountTabContents.forEach(content => content.classList.add('hide'));
        
        // Show target content
        const targetContentEl = document.getElementById(targetTab);
        if (targetContentEl) {
          targetContentEl.classList.remove('hide');
        }
        
        if (targetTab === 'tab-store') {
          this.updateStoreUI();
        }
      });
    });

    // Friend module addition logic
    const addFriendBtn = document.getElementById('add-friend-btn');
    const friendInput = document.getElementById('friend-username-input');
    const friendError = document.getElementById('friend-error-msg');
    
    if (addFriendBtn) {
      addFriendBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playLevelUp();
        
        const friendName = friendInput.value.trim().toUpperCase();
        if (!friendName) {
          if (friendError) friendError.textContent = 'ENTER FRIEND USERNAME';
          return;
        }
        
        if (friendName === this.currentUser) {
          if (friendError) friendError.textContent = 'CANNOT ADD YOUR OWN ACCOUNT';
          return;
        }
        
        if (this.currentUserFriends.includes(friendName)) {
          if (friendError) friendError.textContent = 'ALREADY CONNECTED';
          return;
        }
        
        this.currentUserFriends.push(friendName);
        this.saveProgress();
        
        friendInput.value = '';
        if (friendError) {
          friendError.style.color = '#00ff66';
          friendError.style.textShadow = '0 0 5px rgba(0,255,102,0.4)';
          friendError.textContent = 'FRIEND ADDED';
          setTimeout(() => {
            friendError.textContent = '';
            friendError.style.color = 'var(--neon-pink)';
            friendError.style.textShadow = 'var(--glow-pink)';
          }, 2000);
        }
        
        this.renderFriendsList();
      });
    }

    // Card inputs formatting and dynamics
    const holderInput = document.getElementById('card-holder-input');
    const numberInput = document.getElementById('card-number-input');
    const expiryInput = document.getElementById('card-expiry-input');
    const cvvInput = document.getElementById('card-cvv-input');
    
    const previewHolder = document.getElementById('card-preview-holder');
    const previewNumber = document.getElementById('card-preview-number');
    const previewExpiry = document.getElementById('card-preview-expiry');
    
    if (holderInput) {
      holderInput.addEventListener('input', (e) => {
        const val = holderInput.value.toUpperCase();
        if (previewHolder) previewHolder.textContent = val || 'CARDHOLDER NAME';
      });
    }
    
    if (numberInput) {
      numberInput.addEventListener('input', (e) => {
        let val = numberInput.value.replace(/\D/g, '');
        let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
        numberInput.value = formatted;
        if (previewNumber) previewNumber.textContent = formatted || '•••• •••• •••• ••••';
      });
    }
    
    if (expiryInput) {
      expiryInput.addEventListener('input', (e) => {
        let val = expiryInput.value.replace(/\D/g, '');
        if (val.length > 2) {
          val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        expiryInput.value = val;
        if (previewExpiry) previewExpiry.textContent = val || 'MM/YY';
      });
    }
    
    // Save Card Button Click
    const saveCardBtn = document.getElementById('save-card-btn');
    const cardError = document.getElementById('card-error-msg');
    
    if (saveCardBtn) {
      saveCardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playLevelUp();
        
        const holder = holderInput.value.trim().toUpperCase();
        const number = numberInput.value.replace(/\s+/g, '');
        const expiry = expiryInput.value.trim();
        const cvv = cvvInput.value.trim();
        
        if (!holder || number.length < 16 || expiry.length < 5 || cvv.length < 3) {
          if (cardError) cardError.textContent = 'INVALID DETAILS. FILL ALL FIELDS.';
          return;
        }
        
        if (cardError) cardError.textContent = '';
        
        this.currentUserPaymentCard = {
          holder: holder,
          number: number,
          expiry: expiry,
          cvv: cvv
        };
        
        this.saveProgress();
        if (cardError) {
          cardError.style.color = '#00ff66';
          cardError.style.textShadow = '0 0 5px rgba(0,255,102,0.4)';
          cardError.textContent = 'CARD SYSTEM SAVED SUCCESSFULLY.';
          setTimeout(() => {
            cardError.textContent = '';
            cardError.style.color = 'var(--neon-pink)';
            cardError.style.textShadow = 'var(--glow-pink)';
          }, 3000);
        }
      });
    }

    // Engine Flap Boost upgrade button
    const upgradeSpeedBtn = document.getElementById('upgrade-speed-btn');
    if (upgradeSpeedBtn) {
      upgradeSpeedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cost = 15 * (this.upgradeLevel + 1);
        if (this.coinsCollected >= cost && this.upgradeLevel < 5) {
          this.coinsCollected -= cost;
          this.upgradeLevel++;
          this.saveProgress();
          this.audio.playScore();
          this.updateUpgradeUI();
          // Adjust jump force immediately
          const baseJump = (this.difficulty === 'EASY') ? -5.8 : -7.2;
          this.jumpForce = baseJump * (1 + this.upgradeLevel * 0.04);
        }
      });
    }

    // Sync active settings UI on init
    selectDifficulty(this.difficulty);
    this.colorBubbles.forEach((b) => {
      if (b.getAttribute('data-color') === this.birdColor) {
        b.classList.add('active');
        b.style.borderColor = '#ffffff';
      } else {
        b.classList.remove('active');
        b.style.borderColor = 'transparent';
      }
    });

    this.updateUpgradeUI();

    // Game Over Settings Button
    const gameOverSettingsBtn = document.getElementById('game-over-settings-btn');
    if (gameOverSettingsBtn) {
      gameOverSettingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.init();
        this.isPaused = true;
        this.updateUpgradeUI();
        this.showOverlay(this.settingsOverlay);
      });
    }

    // Game Over Bird Home Button
    const gameOverHomeBtn = document.getElementById('game-over-home-btn');
    if (gameOverHomeBtn) {
      gameOverHomeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playJump();
        this.showOverlay(document.getElementById('home-overlay'));
        this.updateHomeUI();
        if (!this.homeTimer) {
          this.homeTimer = setInterval(() => this.updateHomeUI(), 1000);
        }
        if (!this.homeTutorialSeen) {
          this.startHomeTutorial();
        }
      });
    }

    // Continue YES reboot button click
    if (this.continueYesBtn) {
      this.continueYesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.hearts > 0) {
          this.hearts--;
          if (this.liveHeartsEl) this.liveHeartsEl.textContent = `❤️ ${this.hearts}`;
          this.hideOverlay(this.continueOverlay);
          this.isPaused = false;
          this.updateDpadVisibility();
          
          // Clear pipes that are too close to the bird to avoid instant death
          this.pipes = this.pipes.filter(p => p.x > this.bird.x + 160 || p.x + p.width < this.bird.x - 50);
          this.coins = this.coins.filter(c => c.x > this.bird.x + 160 || c.x < this.bird.x - 50);
          
          // Hover hop bird slightly
          this.bird.velocity = -4.5;
          this.bird.angle = -0.25;
          
          // 2 seconds invincibility (120 frames at 60Hz)
          this.invincibleTimer = 120;
          this.audio.playReboot();
        }
      });
    }

    // Continue NO abort button click
    if (this.continueNoBtn) {
      this.continueNoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideOverlay(this.continueOverlay);
        this.triggerRealGameOver();
      });
    }

    // Render local scores
    this.bestScoreEl.textContent = this.highScore;

    // Login Overlay Event Handlers
    const loginBtn = document.getElementById('login-btn');
    const guestBtn = document.getElementById('guest-btn');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const loginError = document.getElementById('login-error-msg');
    const loginOverlay = document.getElementById('login-overlay');

    if (loginBtn) {
      loginBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const username = usernameInput.value.trim().toUpperCase();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
          loginError.textContent = 'ENTER USERNAME & PASSWORD';
          return;
        }

        window.gameDB.open().then(() => {
          window.gameDB.getUser(username).then(user => {
            if (user) {
              if (user.password === password) {
                this.loadUserData(user);
                loginOverlay.classList.add('hide');
                this.startScreen.classList.remove('hide');
                this.audio.playLevelUp();
                
                if (!this.tutorialSeen) {
                  this.showTutorial();
                }
              } else {
                loginError.textContent = 'INVALID PASSCODE';
              }
            } else {
              const newUser = {
                username: username,
                password: password,
                highScore: 0,
                coins: 0,
                upgradeLevel: 0,
                unlockedBirds: [],
                unlockedJetpacks: [],
                equippedJetpack: 'none',
                jetpackUpgrades: {},
                tutorialSeen: false,
                birdColor: 'RED',
                isPremium: false,
                deathCount: 0,
                friends: [],
                paymentCard: null,
                feedCount: 0,
                breedingEggs: [],
                homeTutorialSeen: false
              };
              window.gameDB.saveUser(newUser).then(() => {
                this.loadUserData(newUser);
                loginOverlay.classList.add('hide');
                this.startScreen.classList.remove('hide');
                this.audio.playLevelUp();
                this.showTutorial();
              });
            }
          });
        }).catch(err => {
          loginError.textContent = 'DATABASE ERROR';
        });
      });
    }

    if (guestBtn) {
      guestBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentUser = null;
        this.tutorialSeen = localStorage.getItem('neon_flappy_tutorial_seen') === 'true';
        
        try {
          this.currentUserFriends = JSON.parse(localStorage.getItem('neon_flappy_friends')) || [];
        } catch(err) {
          this.currentUserFriends = [];
        }
        
        try {
          this.currentUserPaymentCard = JSON.parse(localStorage.getItem('neon_flappy_payment_card')) || null;
        } catch(err) {
          this.currentUserPaymentCard = null;
        }

        loginOverlay.classList.add('hide');
        this.startScreen.classList.remove('hide');
        this.audio.playReboot();
        
        const greetingEl = document.getElementById('user-greeting');
        if (greetingEl) {
          greetingEl.textContent = 'HELLO GUEST';
          greetingEl.style.display = 'block';
          const birdEl = document.getElementById('greeting-bird');
          if (birdEl) birdEl.classList.remove('hide');
        }
        
        if (!this.tutorialSeen) {
          this.showTutorial();
        }
      });
    }

    // Cosmo Speech Bubble Tutorial Buttons
    const tutNext = document.getElementById('tutorial-next');
    const tutPrev = document.getElementById('tutorial-prev');
    const tutSkip = document.getElementById('tutorial-skip');
    const tutLangSelect = document.getElementById('tutorial-lang-select');

    if (tutLangSelect) {
      tutLangSelect.value = this.tutorialLang;
      tutLangSelect.addEventListener('change', (e) => {
        this.tutorialLang = e.target.value;
        localStorage.setItem('neon_flappy_tut_lang', this.tutorialLang);
        if (this.activeTutorialMode === 'LOGIN') {
          this.updateLoginTutorialStep();
        } else if (this.activeTutorialMode === 'HOME') {
          this.updateHomeTutorialStep();
        } else {
          this.updateTutorialStep();
        }
      });
    }

    if (tutNext) {
      tutNext.addEventListener('click', (e) => {
        e.stopPropagation();
        this.nextTutorialStep();
      });
    }

    if (tutPrev) {
      tutPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        this.prevTutorialStep();
      });
    }

    if (tutSkip) {
      tutSkip.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTutorial();
      });
    }

    // Owner Admin Panel Trigger and Dashboard
    const adminKeyBtn = document.getElementById('admin-key-btn');
    const adminOverlay = document.getElementById('admin-overlay');
    const adminLockScreen = document.getElementById('admin-lock-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    const adminPassInput = document.getElementById('admin-pass-input');
    const adminUnlockBtn = document.getElementById('admin-unlock-btn');
    const adminCloseLockBtn = document.getElementById('admin-close-lock-btn');
    const adminExitBtn = document.getElementById('admin-exit-btn');
    const adminLockError = document.getElementById('admin-lock-error');

    if (adminKeyBtn) {
      adminKeyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.init();
        adminOverlay.classList.remove('hide');
        adminLockScreen.classList.remove('hide');
        adminDashboard.classList.add('hide');
        adminPassInput.value = '';
        adminLockError.textContent = '';
      });
    }

    if (adminCloseLockBtn) {
      adminCloseLockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        adminOverlay.classList.add('hide');
      });
    }

    if (adminUnlockBtn) {
      adminUnlockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = adminPassInput.value.trim();
        if (code === '8788') {
          adminLockScreen.classList.add('hide');
          adminDashboard.classList.remove('hide');
          
          // Reset admin tabs to default active (USERS)
          const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
          const adminTabContents = document.querySelectorAll('.admin-tab-content');
          adminTabBtns.forEach(b => {
            b.classList.remove('active');
            b.style.color = '#8fa0dd';
            b.style.borderBottomColor = 'transparent';
          });
          if (adminTabBtns[0]) {
            adminTabBtns[0].classList.add('active');
            adminTabBtns[0].style.color = '#00ff66';
            adminTabBtns[0].style.borderBottomColor = '#00ff66';
          }
          adminTabContents.forEach(c => c.classList.add('hide'));
          const usersTab = document.getElementById('admin-tab-users');
          if (usersTab) usersTab.classList.remove('hide');
          
          this.loadAdminUsersList();
          this.updateAdminDbUI();
        } else {
          adminLockError.textContent = 'ACCESS CODE DENIED';
          this.audio.playCrash();
        }
      });
    }

    if (adminExitBtn) {
      adminExitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        adminOverlay.classList.add('hide');
      });
    }

    // Admin Tab Switchers
    const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');
    
    adminTabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playJump();
        
        const targetTab = btn.getAttribute('data-tab');
        
        // Remove active class from all buttons
        adminTabBtns.forEach(b => {
          b.classList.remove('active');
          b.style.color = '#8fa0dd';
          b.style.borderBottomColor = 'transparent';
        });
        btn.classList.add('active');
        btn.style.color = '#00ff66';
        btn.style.borderBottomColor = '#00ff66';
        
        // Hide all contents
        adminTabContents.forEach(content => content.classList.add('hide'));
        
        // Show target content
        const targetContentEl = document.getElementById(targetTab);
        if (targetContentEl) {
          targetContentEl.classList.remove('hide');
        }
        
        if (targetTab === 'admin-tab-users') {
          this.loadAdminUsersList();
        } else if (targetTab === 'admin-tab-db') {
          this.updateAdminDbUI();
        }
      });
    });

    // Database Sync Buttons Wire-Up
    const dbConnectBtn = document.getElementById('admin-db-connect-btn');
    const dbDisconnectBtn = document.getElementById('admin-db-disconnect-btn');
    const dbConfigInput = document.getElementById('firebase-config-input');
    const dbError = document.getElementById('admin-db-error');
    
    if (dbConnectBtn) {
      dbConnectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playJump();
        if (dbError) {
          dbError.style.color = 'var(--neon-pink)';
          dbError.textContent = '';
        }
        
        const configStr = dbConfigInput.value.trim();
        if (!configStr) {
          if (dbError) dbError.textContent = 'PASTE CONFIGURATION JSON FIRST';
          this.audio.playCrash();
          return;
        }
        
        let config;
        try {
          // Try parsing standard JSON first
          config = JSON.parse(configStr);
        } catch (err) {
          try {
            // Fallback: Parse copied JavaScript object format directly from Firebase Console
            // Strip out "const firebaseConfig = " variable declaration prefix and trailing semicolons
            let cleaned = configStr.replace(/const\s+\w+\s*=\s*/g, '').replace(/;\s*$/g, '').trim();
            const fn = new Function('return (' + cleaned + ');');
            config = fn();
          } catch (jsErr) {
            if (dbError) dbError.textContent = 'INVALID CONFIGURATION FORMAT';
            this.audio.playCrash();
            return;
          }
        }
        
        if (!config.apiKey || !config.projectId) {
          if (dbError) dbError.textContent = 'API KEY OR PROJECT ID MISSING';
          this.audio.playCrash();
          return;
        }
        
        // Connect to Firestore
        const success = window.gameDB.initFirestore(config);
        if (success) {
          this.audio.playLevelUp();
          if (dbError) {
            dbError.style.color = '#00ff66';
            dbError.textContent = 'CLOUD DB CONNECTED! SYNCING...';
          }
          
          // Sync all local accounts to Cloud Firestore
          window.gameDB.syncLocalToFirestore().then(() => {
            if (dbError) dbError.textContent = 'SYNC COMPLETED SUCCESSFULLY!';
            this.updateAdminDbUI();
            this.loadAdminUsersList();
          }).catch(syncErr => {
            console.error("Migration to Cloud Firestore failed:", syncErr);
            if (dbError) {
              dbError.style.color = 'var(--neon-pink)';
              dbError.textContent = 'CLOUD CONNECTED, BUT SYNC FAILED';
            }
            this.updateAdminDbUI();
          });
        } else {
          if (dbError) dbError.textContent = 'FIRESTORE INITIALIZATION FAILED';
          this.audio.playCrash();
        }
      });
    }
    
    if (dbDisconnectBtn) {
      dbDisconnectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audio.playReboot();
        window.gameDB.disconnectFirestore();
        this.updateAdminDbUI();
        this.loadAdminUsersList();
      });
    }

    // Remove white background from the uploaded parrot image
    this.cleanParrotBackground();
  }

  cleanParrotBackground() {
    const parrotBg = document.getElementById('start-screen-parrot-bg');
    if (!parrotBg) return;

    const processImage = () => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const w = canvas.width;
        const h = canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        
        const getIdx = (x, y) => (y * w + x) * 4;
        
        const visited = new Uint8Array(w * h);
        const queue = [];
        
        // Seed corners
        const corners = [
          [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]
        ];
        
        for (const [cx, cy] of corners) {
          const idx = getIdx(cx, cy);
          const r = data[idx];
          const g = data[idx+1];
          const b = data[idx+2];
          if (r > 230 && g > 230 && b > 230) {
            queue.push(cx, cy);
            visited[cy * w + cx] = 1;
          }
        }
        
        let qIdx = 0;
        while (qIdx < queue.length) {
          const x = queue[qIdx++];
          const y = queue[qIdx++];
          
          const idx = getIdx(x, y);
          data[idx + 3] = 0; // Set transparent
          
          const neighbors = [
            [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
          ];
          
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nVisIdx = ny * w + nx;
              if (!visited[nVisIdx]) {
                const nIdx = getIdx(nx, ny);
                const nr = data[nIdx];
                const ng = data[nIdx+1];
                const nb = data[nIdx+2];
                if (nr > 230 && ng > 230 && nb > 230) {
                  visited[nVisIdx] = 1;
                  queue.push(nx, ny);
                }
              }
            }
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        parrotBg.src = canvas.toDataURL('image/png');
      };
      img.src = parrotBg.src;
    };

    if (parrotBg.complete) {
      processImage();
    } else {
      parrotBg.addEventListener('load', processImage);
    }
  }

  updateHomeUI() {
    const homeCoins = document.getElementById('home-coins');
    const homeFeedCount = document.getElementById('home-feed-count');
    
    if (homeCoins) homeCoins.textContent = `${this.coinsCollected} 🪙`;
    if (homeFeedCount) homeFeedCount.textContent = `${this.feedCount} 🌾`;
    
    this.populateBreedSelects();
    this.updateParentPreview('breed-parent-a-select', 'breed-parent-a-preview');
    this.updateParentPreview('breed-parent-b-select', 'breed-parent-b-preview');

    const roost = document.getElementById('home-aviary-roost');
    if (roost) {
      let roostHtml = `<div style="position: absolute; bottom: 8px; left: 10px; right: 10px; height: 3px; background: #ffaa00; box-shadow: 0 0 5px #ffaa00; border-radius: 2px;"></div>`;
      
      const ownedBirds = ['RED', 'CYAN', 'YELLOW', 'PINK'];
      this.premiumBirds.forEach(b => {
        if (this.unlockedBirds.includes(b.id)) {
          ownedBirds.push(b.id);
        }
      });
      if (this.unlockedBirds.includes('CHICK')) {
        ownedBirds.push('CHICK');
      }
      if (this.unlockedBirds.includes('WINGS')) {
        ownedBirds.push('WINGS');
      }
      if (this.unlockedBirds.includes('HAWK')) {
        ownedBirds.push('HAWK');
      }
      if (this.unlockedBirds.includes('COORDINATOR')) {
        ownedBirds.push('COORDINATOR');
      }

      ownedBirds.forEach(birdId => {
        const svg = this.getBirdSvg(birdId, 36);
        const isEquipped = this.birdColor === birdId;
        const highlightStyle = isEquipped ? 'box-shadow: 0 0 8px #ffea00; border: 1px solid #ffea00; border-radius: 6px; background: rgba(255, 234, 0, 0.1);' : '';
        roostHtml += `
          <div style="display: inline-block; position: relative; width: 36px; height: 36px; margin-top: auto; margin-bottom: 9px; z-index: 2; cursor: pointer; transition: transform 0.2s; padding: 1px; ${highlightStyle}" 
               class="roost-bird-card" 
               data-bird-id="${birdId}"
               title="Equip ${birdId}">
            ${svg}
          </div>
        `;
      });
      roost.innerHTML = roostHtml;

      const roostBirdCards = roost.querySelectorAll('.roost-bird-card');
      roostBirdCards.forEach(card => {
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          const birdId = card.getAttribute('data-bird-id');
          this.birdColor = birdId;
          this.saveProgress();
          this.updateHomeUI();
          this.audio.playJump();
        });
      });
    }
    
    const invList = document.getElementById('home-inventory-list');
    if (invList) {
      const birdsList = [
        { id: 'RED', name: 'Cyber Red', color: '#ff3333', desc: 'Classic retro bird.', owned: true },
        { id: 'CYAN', name: 'Neon Parrot', color: '#00f0ff', desc: 'Glowing green-blue parrot mascot.', owned: true },
        { id: 'YELLOW', name: 'Yellow Bird', color: '#ffea00', desc: 'Fast yellow cylinder flyer.', owned: true },
        { id: 'PINK', name: 'Pink Bird', color: '#ff007f', desc: 'High-visibility pink glider.', owned: true }
      ];
      this.premiumBirds.forEach(b => {
        if (this.unlockedBirds.includes(b.id)) {
          birdsList.push({ id: b.id, name: b.name, color: b.color, desc: b.description, owned: true });
        }
      });
      if (this.unlockedBirds.includes('CHICK')) {
        birdsList.push({ id: 'CHICK', name: 'Robo Chick', color: '#ffff00', desc: 'Bred cyber chick with an eggshell helmet.', owned: true });
      }
      if (this.unlockedBirds.includes('WINGS')) {
        birdsList.push({ id: 'WINGS', name: 'Cyber Wings', color: '#00f0ff', desc: 'Sleek cyber-wings skin with cyan glow.', owned: true });
      }
      if (this.unlockedBirds.includes('COORDINATOR')) {
        birdsList.push({ id: 'COORDINATOR', name: 'Cyber Coordinator', color: '#ff007f', desc: 'Premium Cyber Coordinator helmet skin.', owned: true });
      }
      if (this.unlockedBirds.includes('HAWK')) {
        birdsList.push({ id: 'HAWK', name: 'Neon Hawk', color: '#ffcc00', desc: 'Sleek retro hawk with sharp crest spikes.', owned: true });
      } else {
        birdsList.push({ id: 'HAWK', name: 'Neon Hawk', color: '#ffcc00', desc: 'Sleek retro hawk with sharp crest spikes.', owned: false, source: 'ad' });
      }
      
      let listHtml = '';
      birdsList.forEach(bird => {
        const isEquipped = this.birdColor === bird.id;
        listHtml += `
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: ${bird.color}; box-shadow: 0 0 8px ${bird.color}; flex-shrink: 0;"></div>
            <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px; padding-left: 6px;">
              <span style="font-family: var(--font-arcade); font-size: 0.6rem; color: #fff;">${bird.name}</span>
              <span style="font-family: var(--font-main); font-size: 0.55rem; color: #8fa0dd;">${bird.desc}</span>
            </div>
            ${isEquipped ? `
              <span style="font-family: var(--font-arcade); font-size: 0.55rem; color: var(--neon-yellow); text-shadow: var(--glow-yellow); padding: 4px 8px; border: 1px solid var(--neon-yellow); border-radius: 4px; background: rgba(255, 234, 0, 0.05);">EQUIPPED</span>
            ` : `
              <button class="equip-bird-btn pwa-btn" data-bird-id="${bird.id}" style="margin-top: 0; padding: 4px 10px; font-size: 0.55rem; border-color: var(--neon-cyan); color: var(--neon-cyan);">EQUIP</button>
            `}
          </div>
        `;
      });
      
      const jpsList = [
        { id: 'none', name: 'No Jetpack', color: '#888888', desc: 'Traditional flapping wings only.' }
      ];
      this.jetpacks.forEach(jp => {
        if (this.unlockedJetpacks.includes(jp.id)) {
          const upgrades = this.jetpackUpgrades || {};
          const level = upgrades[jp.id] || 0;
          const extraStability = level * 0.02;
          const totalStability = Math.round((jp.stability + extraStability) * 100);
          jpsList.push({
            id: jp.id,
            name: jp.name,
            color: jp.color,
            desc: `STABILITY: +${totalStability}% (Level ${level}/5). ${jp.description}`
          });
        }
      });
      
      let jpHtml = '<span class="high-score-label" style="margin-top: 12px; margin-bottom: 6px; font-size: 0.62rem; display: block;">MY JETPACK EQUIPMENT</span>';
      jpsList.forEach(jp => {
        const isEquipped = this.equippedJetpack === jp.id;
        jpHtml += `
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <div style="width: 12px; height: 12px; border-radius: 3px; background: ${jp.color}; box-shadow: 0 0 6px ${jp.color}; flex-shrink: 0;"></div>
            <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px; padding-left: 6px;">
              <span style="font-family: var(--font-arcade); font-size: 0.6rem; color: #fff;">${jp.name}</span>
              <span style="font-family: var(--font-main); font-size: 0.55rem; color: #8fa0dd;">${jp.desc}</span>
            </div>
            ${isEquipped ? `
              <span style="font-family: var(--font-arcade); font-size: 0.55rem; color: var(--neon-yellow); text-shadow: var(--glow-yellow); padding: 4px 8px; border: 1px solid var(--neon-yellow); border-radius: 4px; background: rgba(255, 234, 0, 0.05);">EQUIPPED</span>
            ` : `
              <button class="equip-jp-btn pwa-btn" data-jp-id="${jp.id}" style="margin-top: 0; padding: 4px 10px; font-size: 0.55rem; border-color: var(--neon-cyan); color: var(--neon-cyan);">EQUIP</button>
            `}
          </div>
        `;
      });
      
      invList.innerHTML = listHtml + jpHtml;
    }
    
    const nurseryList = document.getElementById('home-nursery-list');
    if (nurseryList) {
      if (this.breedingEggs.length === 0) {
        nurseryList.innerHTML = `
          <div style="text-align: center; color: #8fa0dd; font-family: var(--font-main); font-size: 0.7rem; padding: 25px 0; line-height: 1.4;">
            Hatchery is currently empty.<br>Go to BREEDING to start incubating eggs!
          </div>
        `;
      } else {
        let listHtml = '';
        this.breedingEggs.forEach(egg => {
          const elapsed = Math.floor((Date.now() - egg.startTime) / 1000);
          const remaining = Math.max(0, egg.hatchDuration - elapsed);
          
          let parentAName = egg.parentA === 'RED' ? 'Cyber Red' : (egg.parentA === 'CYAN' ? 'Neon Parrot' : (egg.parentA === 'YELLOW' ? 'Yellow Bird' : (egg.parentA === 'PINK' ? 'Pink Bird' : (egg.parentA === 'CHICK' ? 'Robo Chick' : egg.parentA))));
          let parentBName = egg.parentB === 'RED' ? 'Cyber Red' : (egg.parentB === 'CYAN' ? 'Neon Parrot' : (egg.parentB === 'YELLOW' ? 'Yellow Bird' : (egg.parentB === 'PINK' ? 'Pink Bird' : (egg.parentB === 'CHICK' ? 'Robo Chick' : egg.parentB))));
          
          if (remaining > 0) {
            const progressPercent = Math.min(100, (elapsed / egg.hatchDuration) * 100);
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            listHtml += `
              <div style="background: rgba(0, 240, 255, 0.03); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
                <div style="font-size: 1.8rem; filter: drop-shadow(0 0 4px var(--neon-cyan)); animation: pulse 0.8s infinite alternate;">🥚</div>
                <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px; padding-left: 6px;">
                  <span style="font-family: var(--font-arcade); font-size: 0.6rem; color: #fff;">EGG #${egg.id.substr(0,4).toUpperCase()}</span>
                  <span style="font-family: var(--font-main); font-size: 0.55rem; color: #8fa0dd;">Lineage: ${parentAName} + ${parentBName}</span>
                  <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; margin: 3px 0;">
                    <div style="width: ${progressPercent}%; height: 100%; background: var(--neon-cyan); box-shadow: var(--glow-cyan);"></div>
                  </div>
                  <span style="font-family: var(--font-arcade); font-size: 0.58rem; color: var(--neon-cyan);">HATCHING: ${timeStr}</span>
                </div>
                <button class="feed-seed-btn pwa-btn" data-egg-id="${egg.id}" style="margin-top: 0; padding: 4px 6px; font-size: 0.52rem; border-color: var(--neon-cyan); color: var(--neon-cyan); flex-shrink: 0;" ${this.feedCount <= 0 ? 'disabled style="opacity: 0.3; border-color: rgba(255,255,255,0.1); color: #888;"' : ''}>FEED SEED</button>
              </div>
            `;
          } else {
            listHtml += `
              <div style="background: rgba(255, 0, 127, 0.05); border: 1px solid rgba(255, 0, 127, 0.25); border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
                <div style="font-size: 1.8rem; filter: drop-shadow(0 0 6px var(--neon-pink)); animation: float 1.5s ease-in-out infinite;">🐣</div>
                <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px; padding-left: 6px;">
                  <span style="font-family: var(--font-arcade); font-size: 0.65rem; color: var(--neon-pink); text-shadow: var(--glow-pink);">READY TO HATCH!</span>
                  <span style="font-family: var(--font-main); font-size: 0.55rem; color: #8fa0dd;">Lineage: ${parentAName} × ${parentBName}</span>
                </div>
                <button class="hatch-egg-btn action-btn" data-egg-id="${egg.id}" style="margin-top: 0; padding: 6px 10px; font-size: 0.6rem; border-color: var(--neon-pink); background: rgba(255, 0, 127, 0.15); color: #fff; box-shadow: var(--glow-pink); flex-shrink: 0;">HATCH!</button>
              </div>
            `;
          }
        });
        nurseryList.innerHTML = listHtml;
      }
    }
  }

  populateBreedSelects() {
    const parentASelect = document.getElementById('breed-parent-a-select');
    const parentBSelect = document.getElementById('breed-parent-b-select');
    if (!parentASelect || !parentBSelect) return;
    
    let totalUnlockedCount = 4;
    this.premiumBirds.forEach(b => {
      if (this.unlockedBirds.includes(b.id)) totalUnlockedCount++;
    });
    if (this.unlockedBirds.includes('CHICK')) totalUnlockedCount++;
    
    if (parentASelect.options.length - 1 === totalUnlockedCount) return;
    
    const valA = parentASelect.value;
    const valB = parentBSelect.value;
    
    let optionsHtml = '<option value="">Choose...</option>';
    optionsHtml += '<option value="RED">Cyber Red</option>';
    optionsHtml += '<option value="CYAN">Neon Parrot</option>';
    optionsHtml += '<option value="YELLOW">Yellow Bird</option>';
    optionsHtml += '<option value="PINK">Pink Bird</option>';
    
    this.premiumBirds.forEach(b => {
      if (this.unlockedBirds.includes(b.id)) {
        optionsHtml += `<option value="${b.id}">${b.name}</option>`;
      }
    });
    if (this.unlockedBirds.includes('CHICK')) {
      optionsHtml += '<option value="CHICK">Robo Chick</option>';
    }
    
    parentASelect.innerHTML = optionsHtml;
    parentBSelect.innerHTML = optionsHtml;
    
    parentASelect.value = valA;
    parentBSelect.value = valB;
  }

  updateUpgradeUI() {
    const descEl = document.getElementById('speed-upgrade-desc');
    const btnEl = document.getElementById('upgrade-speed-btn');
    const coinsEl = document.getElementById('settings-coins');
    const liveCoinsEl = document.getElementById('live-coins');
    
    if (coinsEl) coinsEl.textContent = this.coinsCollected + ' 🪙';
    if (liveCoinsEl) liveCoinsEl.textContent = this.coinsCollected;
    
    if (descEl) {
      descEl.textContent = `Level ${this.upgradeLevel} (+${this.upgradeLevel * 4}% lift)`;
    }
    if (btnEl) {
      if (this.upgradeLevel >= 5) {
        btnEl.textContent = 'MAX LEVEL';
        btnEl.style.borderColor = '#8fa0dd';
        btnEl.style.color = '#8fa0dd';
        btnEl.disabled = true;
      } else {
        const cost = 15 * (this.upgradeLevel + 1);
        btnEl.textContent = `Upgrade: ${cost} 🪙`;
        btnEl.style.borderColor = '#ff9900';
        btnEl.style.color = '#ff9900';
        btnEl.disabled = false;
      }
    }

    // Refresh dynamically built premium shops & slowmo
    this.buildBirdsShop();
    this.buildJetpacksShop();
    this.updateSlowMoUI();
  }

  toggleSound() {
    this.audio.muted = !this.audio.muted;
    if (this.audio.muted) {
      // Mute Icon Path
      this.soundPath.setAttribute('d', 'M3,9H7L12,4V20L7,15H3V9M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23Z M19.5,12c0,-4.5 -3.5,-8.18 -8,-8.9V5.1C15,5.8 18,8.5 18,12c0,3.5 -3,6.2 -6.5,6.9v2C16,20.18 19.5,16.5 19.5,12z');
      this.soundBtn.style.color = '#ff007f';
      this.soundBtn.style.borderColor = 'rgba(255, 0, 127, 0.2)';
    } else {
      // Unmute Icon Path
      this.soundPath.setAttribute('d', 'M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z');
      this.soundBtn.style.color = '#00f0ff';
      this.soundBtn.style.borderColor = 'rgba(0, 240, 255, 0.2)';
      
      this.audio.init();
      this.audio.playJump();
    }
  }

  handleInput(dir = 'right') {
    this.audio.init();
    
    if (this.state === 'START') {
      this.audio.playJump();
      this.state = 'PLAYING';
      this.hideOverlay(this.startScreen);
      this.bird.facingRight = true;
      this.bird.vx = 0;
      this.updateDpadVisibility();
    } else if (this.state === 'PLAYING') {
      this.bird.velocity = this.jumpForce;
      this.audio.playJump();
      
      if (dir === 'left') {
        this.bird.facingRight = false;
        this.bird.vx = -3.2;
      } else {
        this.bird.facingRight = true;
        this.bird.vx = 3.2;
      }
      
      // Emit jet trail sparks on jump
      this.createJumpParticles();
    } else if (this.state === 'GAMEOVER') {
      // Let them hit system reboot button directly to restart
    }
  }

  hideOverlay(element) {
    element.classList.add('hide');
  }

  showOverlay(element) {
    element.classList.remove('hide');
  }

  reset() {
    this.gameWon = false;
    this.bird.x = 100;
    this.bird.y = 260;
    this.bird.velocity = 0;
    this.bird.vx = 0;
    this.bird.facingRight = true;
    this.bird.angle = 0;
    this.bird.targetAngle = 0;
    
    this.pipes = [];
    this.particles = [];
    this.coins = [];
    this.level = 1;
    this.levelUpTimer = 0;
    this.bgOffset = 0;
    this.hearts = 0;
    this.coinsThisRun = 0;
    this.invincibleTimer = 0;
    
    this.snakes = [];
    this.guardActive = false;
    this.guardTimer = 0;
    this.snakeSpawnTimer = 180;
    
    const heartsEl = document.getElementById('live-hearts');
    if (heartsEl) heartsEl.textContent = `❤️ ${this.hearts}`;

    const lvlEl = document.getElementById('live-level');
    if (lvlEl) lvlEl.textContent = this.level;

    this.score = 0;
    this.frameCount = 0;
    this.animationTime = 0;
    this.liveScoreEl.textContent = '0';
    
    if (this.difficulty === 'EASY') {
      this.targetDistance = 270;
    } else {
      this.targetDistance = 240;
    }
    this.updateDpadVisibility();
    this.recalculatePhysics();

    this.distanceTraveled = 0;
    this.trailTimer = 0;
  }

  createJumpParticles() {
    const xOffset = this.bird.facingRight ? -10 : 10;
    const speedXDir = this.bird.facingRight ? -1 : 1;
    
    for (let i = 0; i < 6; i++) {
      const p = new Particle(
        this.bird.x + xOffset,
        this.bird.y + (Math.random() * 10 - 5),
        '#ff007f', // Jet pink
        Math.random() * 3 + 2,
        speedXDir * (Math.random() * 3 + 2), // Fly backwards relative to bird facing
        (Math.random() * 3 - 1.5),
        Math.random() * 15 + 15
      );
      this.particles.push(p);
    }
  }

  createCoinParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 1;
      const p = new Particle(
        x,
        y,
        '#ffea00', // Gold color
        Math.random() * 2 + 1.5,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        Math.random() * 12 + 10
      );
      this.particles.push(p);
    }
  }

  emitTrailParticle() {
    const originalPush = this.particles.push;
    const facingRight = this.bird.facingRight;
    this.particles.push = (p) => {
      if (!facingRight) {
        p.x = 2 * this.bird.x - p.x;
        p.speedX = -p.speedX;
      }
      originalPush.call(this.particles, p);
    };

    if (this.equippedJetpack && this.equippedJetpack !== 'none') {
      // Custom Jetpack Trails
      const xPos = this.bird.x - 20; // Emit from nozzle
      const yPos = this.bird.y;
      
      switch (this.equippedJetpack) {
        case 'rusty': {
          const isSmoke = Math.random() < 0.5;
          const p = new Particle(
            xPos,
            yPos + (Math.random() * 6 - 3),
            isSmoke ? '#555555' : '#d27d2d',
            Math.random() * (isSmoke ? 3 : 1.5) + 1,
            -1.0 - Math.random() * 0.5,
            Math.random() * 0.8 - 0.4,
            Math.random() * 8 + 6
          );
          this.particles.push(p);
          break;
        }
        case 'neon': {
          const p = new Particle(
            xPos,
            yPos + (Math.random() * 6 - 3),
            '#00f0ff',
            Math.random() * 2 + 1,
            -1.5,
            Math.random() * 0.6 - 0.3,
            Math.random() * 10 + 10
          );
          this.particles.push(p);
          break;
        }
        case 'flap': {
          const p = new Particle(
            xPos,
            yPos + (Math.random() * 8 - 4),
            '#ffea00',
            Math.random() * 1.5 + 1,
            -2.0,
            Math.random() * 1.5 - 0.75,
            Math.random() * 6 + 6
          );
          this.particles.push(p);
          break;
        }
        case 'plasma': {
          const p = new Particle(
            xPos,
            yPos,
            '#ff00ff',
            1.8,
            -0.8,
            0,
            18
          );
          p.isPlasmaRing = true;
          this.particles.push(p);
          break;
        }
        case 'sonic': {
          const p = new Particle(
            xPos,
            yPos,
            '#80c0ff',
            2.2,
            -1.4,
            0,
            12
          );
          p.isPlasmaRing = true;
          this.particles.push(p);
          break;
        }
        case 'cosmic': {
          const hue = 260 + Math.random() * 60;
          const p = new Particle(
            xPos,
            yPos + (Math.random() * 8 - 4),
            `hsl(${hue}, 100%, 70%)`,
            Math.random() * 2 + 1,
            -1.2,
            Math.random() * 1.0 - 0.5,
            Math.random() * 15 + 8
          );
          this.particles.push(p);
          break;
        }
        case 'crimson': {
          const isRed = Math.random() < 0.6;
          const p = new Particle(
            xPos,
            yPos + (Math.random() * 8 - 4),
            isRed ? '#ff1a1a' : '#ffaa00',
            Math.random() * 3 + 2,
            -1.8,
            Math.random() * 0.8 - 0.4,
            Math.random() * 12 + 6
          );
          this.particles.push(p);
          break;
        }
        case 'quantum': {
          const p = new Particle(
            xPos,
            yPos + (Math.random() * 10 - 5),
            '#00ff66',
            Math.random() * 2.5 + 1.5,
            -1.6,
            Math.random() * 0.4 - 0.2,
            Math.random() * 10 + 6
          );
          this.particles.push(p);
          break;
        }
        case 'hyper': {
          const hue = (this.frameCount * 12) % 360;
          const p = new Particle(
            xPos,
            yPos + (Math.random() * 6 - 3),
            `hsl(${hue}, 100%, 60%)`,
            Math.random() * 2.5 + 1.5,
            -1.5,
            Math.random() * 0.6 - 0.3,
            Math.random() * 14 + 10
          );
          this.particles.push(p);
          break;
        }
        case 'darkmatter': {
          const isVoid = Math.random() < 0.4;
          if (isVoid) {
            const p = new Particle(
              xPos,
              yPos,
              '#4b0082',
              2.0,
              -0.7,
              0,
              20
            );
            p.isPlasmaRing = true;
            this.particles.push(p);
          } else {
            const p = new Particle(
              xPos,
              yPos + (Math.random() * 6 - 3),
              '#8a2be2',
              Math.random() * 2 + 1,
              -1.0,
              Math.random() * 0.4 - 0.2,
              Math.random() * 15 + 5
            );
            this.particles.push(p);
          }
          break;
        }
      }
      return;
    }

    const config = this.levelConfigs[Math.min(20, this.level) - 1];
    if (config) {
      const pStyle = config.particleStyle;
      const pColor = config.particleColor;
      const xPos = this.bird.x - 12;
      const yPos = this.bird.y;

      if (pStyle === 'sparks') {
        const p = new Particle(
          xPos,
          yPos + (Math.random() * 6 - 3),
          pColor,
          Math.random() * 2 + 1,
          -1.5,
          Math.random() * 0.6 - 0.3,
          Math.random() * 10 + 10
        );
        this.particles.push(p);
      } else if (pStyle === 'fire') {
        const isAlternate = Math.random() < 0.5;
        const flameColor = isAlternate ? config.capColor : pColor;
        const p = new Particle(
          xPos,
          yPos + (Math.random() * 8 - 4),
          flameColor,
          Math.random() * 3 + 1.5,
          -1.2,
          -(Math.random() * 1.2 + 0.3),
          Math.random() * 12 + 8
        );
        this.particles.push(p);
      } else if (pStyle === 'plasma') {
        const p = new Particle(
          xPos,
          yPos,
          pColor,
          2.0,
          -0.8,
          0,
          18
        );
        p.isPlasmaRing = true;
        this.particles.push(p);
      } else if (pStyle === 'rainbow') {
        const hue = (this.frameCount * 8) % 360;
        const p = new Particle(
          xPos,
          yPos + (Math.random() * 6 - 3),
          `hsl(${hue}, 100%, 60%)`,
          Math.random() * 2.5 + 1.5,
          -1.4,
          Math.random() * 0.8 - 0.4,
          Math.random() * 14 + 10
        );
        this.particles.push(p);
      } else if (pStyle === 'rainbow_fast') {
        const hue = (this.frameCount * 16) % 360;
        const p = new Particle(
          xPos,
          yPos + (Math.random() * 8 - 4),
          `hsl(${hue}, 100%, 65%)`,
          Math.random() * 3 + 1.5,
          -1.6,
          Math.random() * 1.0 - 0.5,
          Math.random() * 16 + 10
        );
        this.particles.push(p);
      }
    } else {
      const p = new Particle(
        this.bird.x - 12,
        this.bird.y + (Math.random() * 6 - 3),
        '#00f0ff',
        Math.random() * 2 + 1,
        -1.5,
        Math.random() * 0.6 - 0.3,
        Math.random() * 10 + 10
      );
      this.particles.push(p);
    }
    this.particles.push = originalPush;
  }

  createCrashParticles() {
    const colors = ['#00f0ff', '#ff007f', '#ffea00', '#ffffff'];
    for (let i = 0; i < 35; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 4 + 2;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      const p = new Particle(
        this.bird.x,
        this.bird.y,
        color,
        size,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        Math.random() * 30 + 30
      );
      this.particles.push(p);
    }
  }

  triggerGameOver() {
    // If player has Hearts and isn't currently invincible, prompt continue
    if (this.hearts > 0 && this.invincibleTimer <= 0) {
      this.isPaused = true;
      const heartsStatusEl = document.getElementById('continue-hearts-status');
      if (heartsStatusEl) heartsStatusEl.textContent = `Hearts Remaining: ❤️ ${this.hearts}`;
      this.showOverlay(this.continueOverlay);
      this.audio.playCrash();
      this.updateDpadVisibility();
    } else if (this.invincibleTimer > 0) {
      // Ignore crashes during invincibility frames
    } else {
      this.triggerRealGameOver();
    }
  }

  triggerRealGameOver() {
    this.state = 'GAMEOVER';
    this.audio.playCrash();
    this.createCrashParticles();
    this.updateDpadVisibility();
    
    // Save high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.bestScoreEl.textContent = this.highScore;
    }
    
    // Increment death count
    this.deathCount++;
    this.saveProgress();
    
    // Show game over overlay
    this.finalScoreEl.textContent = this.score;
    this.gameOverBestEl.textContent = this.highScore;
    
    const gameOverCoinsEl = document.getElementById('game-over-coins');
    if (gameOverCoinsEl) {
      gameOverCoinsEl.textContent = `+${this.coinsThisRun}`;
    }
    
    // Reset Game Over Ad Button status on each game over
    const gameOverAdBtn = document.getElementById('game-over-ad-btn');
    if (gameOverAdBtn) {
      gameOverAdBtn.disabled = false;
      gameOverAdBtn.style.borderColor = 'var(--neon-pink)';
      gameOverAdBtn.style.color = 'var(--neon-pink)';
      gameOverAdBtn.style.boxShadow = 'var(--glow-pink)';
      gameOverAdBtn.textContent = '📺 +50 🪙';
    }
    
    setTimeout(() => {
      if (!this.isPremium && this.deathCount % 5 === 0) {
        this.showInterstitialAd(() => {
          this.showOverlay(this.gameOverScreen);
        });
      } else {
        this.showOverlay(this.gameOverScreen);
      }
    }, 400);
  }

  triggerLevelUp() {
    // Grant +1 Heart on Level Up
    this.hearts++;
    if (this.liveHeartsEl) this.liveHeartsEl.textContent = `❤️ ${this.hearts}`;

    this.audio.playLevelUp();
    this.levelUpTimer = 90; // 1.5 seconds at 60fps
    
    const lvlEl = document.getElementById('live-level');
    if (lvlEl) {
      lvlEl.textContent = this.level;
      lvlEl.style.color = '#ffffff';
      lvlEl.style.textShadow = '0 0 15px #ffffff';
      setTimeout(() => {
        lvlEl.style.color = 'var(--neon-yellow)';
        lvlEl.style.textShadow = 'var(--glow-yellow)';
      }, 500);
    }

    // Level 15: Cancel slow-mo and pause game to show message
    if (this.level === 15) {
      this.slowMoActive = false;
      localStorage.setItem('neon_flappy_slow_mo', 'false');
      this.updateSlowMoUI();

      const annOverlay = document.getElementById('announcement-overlay');
      const annTitle = document.getElementById('announcement-title');
      const annMsg = document.getElementById('announcement-message');
      if (annOverlay && annTitle && annMsg) {
        annTitle.textContent = "CHRONO SLOW-MO CANCELLED";
        annTitle.style.color = "var(--neon-pink)";
        annTitle.style.textShadow = "var(--glow-pink)";
        annMsg.textContent = "Chrono Slow-Motion mode is disabled for the ultimate Level 15+ challenge!\n\nChrono Slow-Mo ප්‍රකාරය අක්‍රිය කරන ලදී! මින් ඉදිරියට ක්‍රීඩාවේ වේගය සාමාන්‍ය වේ.";
        this.isPaused = true;
        this.showOverlay(annOverlay);
      }
    }

    // Level 20: Victory complete and pause game to show win message
    if (this.level === 20) {
      const annOverlay = document.getElementById('announcement-overlay');
      const annTitle = document.getElementById('announcement-title');
      const annMsg = document.getElementById('announcement-message');
      if (annOverlay && annTitle && annMsg) {
        annTitle.textContent = "VICTORY / YOU WIN!";
        annTitle.style.color = "#00ff66";
        annTitle.style.textShadow = "0 0 10px rgba(0, 255, 102, 0.5)";
        annMsg.textContent = "Congratulations! You have conquered all 20 levels of Neon Gateway. You are a legendary pilot!\n\nක්‍රීඩාව සාර්ථකව නිම කරන ලදී! සුභ පැතුම්! ඔබ Neon Gateway හි levels 20 ම ජයගත් අතිවිශිෂ්ට නියමුවෙකි!";
        this.isPaused = true;
        this.showOverlay(annOverlay);
        this.gameWon = true;
      }
    }
  }

  getTrailName(level) {
    if (this.equippedJetpack && this.equippedJetpack !== 'none') {
      const jp = this.jetpacks.find(j => j.id === this.equippedJetpack);
      return jp ? jp.name.toUpperCase() : "CYAN GLOW";
    }
    const config = this.levelConfigs[Math.min(20, level) - 1];
    return config ? config.trailName : "CYAN GLOW";
  }

  spawnPipe() {
    // Gap config: gap height narrows slightly as score increases to ramp difficulty
    let gap = 130;
    if (this.difficulty === 'EASY') {
      gap = Math.max(140, 160 - Math.floor(this.score / 5) * 3);
    } else {
      gap = Math.max(112, 134 - Math.floor(this.score / 5) * 4);
    }
    
    const minPipeHeight = 60;
    const maxPipeHeight = this.height - gap - minPipeHeight;
    const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight)) + minPipeHeight;
    
    this.pipes.push({
      x: this.width,
      top: topHeight,
      bottom: this.height - topHeight - gap,
      gapY: topHeight,
      gapHeight: gap,
      width: 54,
      scored: false
    });

    // Spawn a gold coin in the gap
    const coinX = this.width + 54 / 2;
    const coinY = topHeight + gap / 2;
    this.coins.push({
      x: coinX,
      y: coinY,
      radius: 8,
      collected: false,
      pulseTimer: Math.random() * Math.PI
    });
  }

  update(dt) {
    this.frameCount++;
    this.animationTime += dt;
    
    // Background Scrolling Parallax scaled by dt
    if (this.state !== 'GAMEOVER') {
      this.bgOffset += this.scrollSpeed * 0.15 * dt;
      this.gridOffset = (this.gridOffset + this.scrollSpeed * 0.4 * dt) % 30;
    }

    // Bird Wing Animation Timer scaled by dt
    this.bird.wingTimer += 0.15 * dt;
    
    // Decay level up announcement timer
    if (this.levelUpTimer > 0) {
      this.levelUpTimer -= dt;
    }

    // Decay invincibility frames
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
    }
    
    // Update Particles scaled by dt
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.state === 'START') {
      // Floating motion for title screen using animationTime
      this.bird.y = 260 + Math.sin(this.animationTime * 0.05) * 10;
      this.bird.angle = Math.sin(this.animationTime * 0.05) * 0.1;
      return;
    }

    // Bird Physics (Play/GameOver states) scaled by dt
    this.bird.velocity += this.gravity * dt;
    // Clamp descent speed
    if (this.bird.velocity > this.maxFallSpeed) {
      this.bird.velocity = this.maxFallSpeed;
    }
    this.bird.y += this.bird.velocity * dt;

    // Horizontal Physics (Inertial slide left/right)
    this.bird.x += this.bird.vx * dt;
    this.bird.vx *= Math.pow(0.92, dt); // horizontal friction
    
    // Clamp bird x within boundaries
    this.bird.x = Math.max(this.bird.radius, Math.min(this.width - this.bird.radius, this.bird.x));
    
    // Interpolate Bird Rotation Angle scaled by dt (lerp using base formula)
    if (this.bird.velocity < 0) {
      // Heading up
      this.bird.targetAngle = -0.35;
    } else if (this.bird.velocity > 3) {
      // Dive down
      this.bird.targetAngle = Math.min(Math.PI / 2.5, this.bird.targetAngle + 0.08 * dt);
    } else {
      this.bird.targetAngle = 0.1;
    }
    this.bird.angle += (this.bird.targetAngle - this.bird.angle) * (1 - Math.pow(0.85, dt));
    
    // Floor/Ceiling crash checks
    if (this.bird.y - this.bird.radius < 0) {
      this.bird.y = this.bird.radius;
      this.bird.velocity = 0.5;
    }
    
    const floorLimit = this.height - 20; // 20px bottom glowing border
    if (this.bird.y + this.bird.radius > floorLimit) {
      this.bird.y = floorLimit - this.bird.radius;
      if (this.state === 'PLAYING' && this.invincibleTimer <= 0) {
        this.triggerGameOver();
      }
      this.bird.velocity = 0;
    }

    // Update Coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.x -= this.scrollSpeed * dt;
      coin.pulseTimer += 0.12 * dt;

      if (!coin.collected && this.state === 'PLAYING') {
        const dx = this.bird.x - coin.x;
        const dy = this.bird.y - coin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.bird.radius + coin.radius) {
          coin.collected = true;
          this.coinsCollected++;
          this.coinsThisRun++;
          this.saveProgress();
          this.updateUpgradeUI();
          this.audio.playCoin();
          this.createCoinParticles(coin.x, coin.y);
        }
      }

      if (coin.x + coin.radius < 0 || coin.collected) {
        this.coins.splice(i, 1);
      }
    }

    if (this.state === 'PLAYING') {
      // Spark trail particle emission using trailTimer
      this.trailTimer += dt;
      if (this.trailTimer >= 2.0) {
        this.trailTimer -= 2.0;
        this.emitTrailParticle();
      }

      // Pipe Spawning based on horizontal distance traveled rather than frames
      this.distanceTraveled += this.scrollSpeed * dt;
      if (this.distanceTraveled >= this.targetDistance) {
        this.distanceTraveled -= this.targetDistance;
        this.spawnPipe();
      }

      // Guard shield timer decay
      if (this.guardActive) {
        this.guardTimer -= dt / 60;
        if (this.guardTimer <= 0) {
          this.guardActive = false;
          this.guardTimer = 0;
          this.audio.playReboot(); // guard expiration sound
        }
      }
      this.updateGuardUI();

      // Snake Spawning & Movement in NORMAL difficulty
      if (this.difficulty === 'NORMAL') {
        this.snakeSpawnTimer -= dt;
        if (this.snakeSpawnTimer <= 0) {
          this.spawnSnake();
          this.snakeSpawnTimer = 300 + Math.random() * 200; // Reset to 5-8 seconds
        }

        for (let i = this.snakes.length - 1; i >= 0; i--) {
          const snake = this.snakes[i];
          snake.x -= snake.speed * dt;
          snake.timeActive += dt / 60; // time in seconds
          
          if (snake.level >= 2) {
            // Slithering wave vertical motion
            snake.y += Math.sin(this.animationTime * 0.15 + snake.sinOffset) * 1.5 * dt;
            snake.y = Math.max(80, Math.min(this.height - 100, snake.y));
          }

          // Collision check
          if (this.checkSnakeCollision(this.bird, snake)) {
            if (this.guardActive) {
              this.createSnakeExplosion(snake);
              this.snakes.splice(i, 1);
              this.audio.playReboot();
              continue;
            } else if (this.invincibleTimer <= 0) {
              this.triggerGameOver();
            }
          }

          // Remove snake if active for more than 3 seconds or offscreen
          if (snake.timeActive >= 3.0 || snake.x + 100 < 0) {
            this.snakes.splice(i, 1);
          }
        }
      } else {
        this.snakes = [];
        this.guardActive = false;
        this.guardTimer = 0;
        this.updateGuardUI();
      }

      // Speed scale with score based on difficulty
      if (this.difficulty === 'EASY') {
        this.scrollSpeed = Math.min(3.0, 1.8 + (this.score * 0.04));
        this.targetDistance = Math.max(220, 270 - (this.score * 1.5));
      } else {
        this.scrollSpeed = Math.min(4.2, 2.4 + (this.score * 0.06));
        this.targetDistance = Math.max(200, 240 - (this.score * 2.2));
      }

      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const pipe = this.pipes[i];
        pipe.x -= this.scrollSpeed * dt;
        
        // Collision AABB vs Circle (only check if not invincible)
        if (this.invincibleTimer <= 0 && this.checkCollision(this.bird, pipe)) {
          this.triggerGameOver();
        }
        
        // Check scoring threshold
        if (!pipe.scored && pipe.x + pipe.width / 2 < this.bird.x) {
          pipe.scored = true;
          this.score++;
          this.liveScoreEl.textContent = this.score;
          this.audio.playScore();
          
          // Flash HUD score neon cyan on scoring points
          this.liveScoreEl.style.color = '#ffffff';
          setTimeout(() => {
            this.liveScoreEl.style.color = 'var(--neon-cyan)';
          }, 150);

          // Level progression check
          let prevLevel = this.level;
          this.level = Math.min(20, Math.floor(this.score / 5) + 1);
          
          if (this.level > prevLevel) {
            this.triggerLevelUp();
          }
        }
        
        // Remove offscreen pipes
        if (pipe.x + pipe.width < 0) {
          this.pipes.splice(i, 1);
        }
      }
    }
  }

  // AABB - Circle collision math
  checkCollision(circle, rect) {
    // Top Pipe
    let topCollision = this.circleRectIntersect(
      circle.x, circle.y, circle.radius,
      rect.x, 0, rect.width, rect.top
    );
    
    // Bottom Pipe
    let bottomCollision = this.circleRectIntersect(
      circle.x, circle.y, circle.radius,
      rect.x, rect.gapY + rect.gapHeight, rect.width, rect.bottom
    );
    
    return topCollision || bottomCollision;
  }

  circleRectIntersect(cx, cy, radius, rx, ry, rw, rh) {
    // Closest point coordinates on rect
    let closestX = Math.max(rx, Math.min(cx, rx + rw));
    let closestY = Math.max(ry, Math.min(cy, ry + rh));
    
    // Distance between circle center and closest point on rect
    let distanceX = cx - closestX;
    let distanceY = cy - closestY;
    let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    
    return distanceSquared < (radius * radius);
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#080810';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw looping parallax background
    this.drawBackground();

    // Draw bottom ground line
    this.ctx.save();
    this.ctx.shadowColor = '#ff007f';
    this.ctx.shadowBlur = 10;
    this.ctx.strokeStyle = '#ff007f';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height - 20);
    this.ctx.lineTo(this.width, this.height - 20);
    this.ctx.stroke();
    
    this.ctx.fillStyle = 'rgba(255, 0, 127, 0.08)';
    this.ctx.fillRect(0, this.height - 20, this.width, 20);
    this.ctx.restore();

    // Draw Particles
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(this.ctx);
    }

    // Draw Coins
    for (let i = 0; i < this.coins.length; i++) {
      this.drawCoin(this.coins[i]);
    }

    // Draw Pipes
    for (let i = 0; i < this.pipes.length; i++) {
      this.drawPipe(this.pipes[i]);
    }

    // Draw Snakes in NORMAL difficulty
    if (this.difficulty === 'NORMAL') {
      for (let i = 0; i < this.snakes.length; i++) {
        this.drawSnake(this.snakes[i]);
      }
    }

    // Draw Bird Player
    this.drawBird();

    // Level up overlay text display
    if (this.levelUpTimer > 0) {
      this.ctx.save();
      this.ctx.font = '900 28px Orbitron';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      const alpha = Math.min(1, this.levelUpTimer / 15);
      this.ctx.globalAlpha = alpha;
      
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 15;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(`LEVEL ${this.level}`, this.width / 2, this.height / 2 - 40);
      
      this.ctx.font = '700 14px Orbitron';
      this.ctx.fillStyle = '#ffea00';
      this.ctx.shadowColor = '#ffea00';
      this.ctx.fillText(`TRAIL: ${this.getTrailName(this.level)}`, this.width / 2, this.height / 2 - 10);
      this.ctx.restore();
    }
  }

  drawBackground() {
    const bgImg = this.difficulty === 'EASY' ? this.easyBgImage : this.normalBgImage;
    if (bgImg.complete && bgImg.naturalWidth > 0) {
      const bgHeight = this.height - 20;
      const imgW = bgImg.naturalWidth;
      const imgH = bgImg.naturalHeight;
      const scale = bgHeight / imgH;
      const scaledWidth = imgW * scale;
      const xOffset = this.bgOffset % scaledWidth;
      
      this.ctx.drawImage(bgImg, -xOffset, 0, scaledWidth, bgHeight);
      this.ctx.drawImage(bgImg, scaledWidth - xOffset, 0, scaledWidth, bgHeight);
      if (scaledWidth - xOffset < this.width) {
        this.ctx.drawImage(bgImg, 2 * scaledWidth - xOffset, 0, scaledWidth, bgHeight);
      }
    } else {
      const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
      grad.addColorStop(0, '#06060c');
      grad.addColorStop(1, '#0d0d1e');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.drawGrid();
    }
  }

  drawCoin(coin) {
    this.ctx.save();
    const pulse = 1 + Math.sin(coin.pulseTimer) * 0.12;
    const r = coin.radius * pulse;
    
    this.ctx.shadowColor = '#ffaa00';
    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = '#ffcc00';
    this.ctx.strokeStyle = '#ff6600';
    this.ctx.lineWidth = 1.5;
    
    this.ctx.beginPath();
    this.ctx.arc(coin.x, coin.y, r, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(coin.x, coin.y, r * 0.5, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = '#15152a';
    this.ctx.lineWidth = 1.0;
    
    // Vertical lines scrolling
    const colWidth = 30;
    const scrollOffset = this.gridOffset;
    for (let x = -colWidth; x < this.width + colWidth; x += colWidth) {
      this.ctx.beginPath();
      this.ctx.moveTo(x - scrollOffset, 0);
      this.ctx.lineTo(x - scrollOffset, this.height - 20);
      this.ctx.stroke();
    }
    
    // Horizontal lines static
    const rowHeight = 30;
    for (let y = 0; y < this.height - 20; y += rowHeight) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawPipe(pipe) {
    this.ctx.save();
    
    // Neon shadow & outline configuration
    const config = this.levelConfigs[Math.min(20, this.level) - 1] || {
      outlineColor: '#ff007f',
      shadowColor: 'rgba(255, 0, 127, 0.6)',
      capColor: '#00f0ff',
      capShadow: '#00f0ff',
      shape: 'tapered',
      bodyColors: ['#2b0016', '#800040', '#ff99cc', '#ff007f', '#4d0026', '#1a000d'],
      capColors: ['#002633', '#008080', '#b3f9ff', '#00f0ff', '#004d4d', '#001a1a']
    };

    let outlineColor = config.outlineColor;
    let shadowColor = config.shadowColor;
    let capColor = config.capColor;
    let capShadow = config.capShadow;
    
    // Dynamic color shifting for Level 20 Omni Chrome
    if (this.level === 20) {
      const hue = (this.frameCount * 2) % 360;
      outlineColor = `hsl(${hue}, 100%, 65%)`;
      shadowColor = `hsla(${hue}, 100%, 65%, 0.6)`;
      const capHue = (hue + 180) % 360; // complementary color
      capColor = `hsl(${capHue}, 100%, 65%)`;
      capShadow = `hsl(${capHue}, 100%, 65%)`;
    }

    this.ctx.shadowColor = shadowColor;
    this.ctx.shadowBlur = 10;
    this.ctx.strokeStyle = outlineColor;
    this.ctx.lineWidth = 2.5;
    
    const isEasy = this.difficulty === 'EASY';
    if (isEasy && this.level === 5) {
      this.drawPumpingBalls(pipe, outlineColor, shadowColor, capColor, capShadow);
      this.ctx.restore();
      return;
    }
    if (isEasy && (this.level === 8 || this.level === 9)) {
      this.drawTreesAndRocks(pipe, outlineColor, shadowColor, capColor, capShadow);
      this.ctx.restore();
      return;
    }
    
    // 3D Cylindrical gradient fill for the pipe body
    let pipeGrad = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    
    let bodyStops = config.bodyColors;
    if (this.level === 20) {
      const hue = (this.frameCount * 2) % 360;
      bodyStops = [
        `hsl(${hue}, 100%, 15%)`,
        `hsl(${hue}, 100%, 35%)`,
        `hsl(${hue}, 100%, 75%)`,
        `hsl(${hue}, 100%, 55%)`,
        `hsl(${hue}, 100%, 25%)`,
        `hsl(${hue}, 100%, 10%)`
      ];
    }

    if (bodyStops && bodyStops.length >= 6) {
      pipeGrad.addColorStop(0, bodyStops[0]); 
      pipeGrad.addColorStop(0.18, bodyStops[1]);
      pipeGrad.addColorStop(0.4, bodyStops[2]); 
      pipeGrad.addColorStop(0.55, bodyStops[3]); 
      pipeGrad.addColorStop(0.9, bodyStops[4]);
      pipeGrad.addColorStop(1, bodyStops[5]);
    } else {
      pipeGrad.addColorStop(0, '#2b0016'); 
      pipeGrad.addColorStop(0.18, '#800040');
      pipeGrad.addColorStop(0.4, '#ff99cc'); 
      pipeGrad.addColorStop(0.55, '#ff007f'); 
      pipeGrad.addColorStop(0.9, '#4d0026');
      pipeGrad.addColorStop(1, '#1a000d');
    }
    this.ctx.fillStyle = pipeGrad;

    const bottomY = pipe.gapY + pipe.gapHeight;
    const shape = config.shape;

    if (shape === 'double-hourglass') {
      const midTopY = pipe.top / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(pipe.x, -10);
      this.ctx.lineTo(pipe.x + pipe.width, -10);
      this.ctx.lineTo(pipe.x + pipe.width * 0.75, midTopY);
      this.ctx.lineTo(pipe.x + pipe.width, pipe.top);
      this.ctx.lineTo(pipe.x, pipe.top);
      this.ctx.lineTo(pipe.x + pipe.width * 0.25, midTopY);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Draw horizontal magnetic stabilizer ring on top pipe midpoint
      this.ctx.save();
      this.ctx.fillStyle = capColor;
      this.ctx.shadowColor = capShadow;
      this.ctx.shadowBlur = 8;
      this.ctx.fillRect(pipe.x - 4, midTopY - 4, pipe.width + 8, 8);
      this.ctx.restore();

      const midBottomY = bottomY + pipe.bottom / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(pipe.x, bottomY);
      this.ctx.lineTo(pipe.x + pipe.width, bottomY);
      this.ctx.lineTo(pipe.x + pipe.width * 0.75, midBottomY);
      this.ctx.lineTo(pipe.x + pipe.width, this.height - 20 + 10);
      this.ctx.lineTo(pipe.x, this.height - 20 + 10);
      this.ctx.lineTo(pipe.x + pipe.width * 0.25, midBottomY);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Draw horizontal magnetic stabilizer ring on bottom pipe midpoint
      this.ctx.save();
      this.ctx.fillStyle = capColor;
      this.ctx.shadowColor = capShadow;
      this.ctx.shadowBlur = 8;
      this.ctx.fillRect(pipe.x - 4, midBottomY - 4, pipe.width + 8, 8);
      this.ctx.restore();

    } else if (shape === 'hourglass') {
      const midTopY = pipe.top / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(pipe.x, -10);
      this.ctx.lineTo(pipe.x + pipe.width, -10);
      this.ctx.lineTo(pipe.x + pipe.width * 0.85, midTopY);
      this.ctx.lineTo(pipe.x + pipe.width, pipe.top);
      this.ctx.lineTo(pipe.x, pipe.top);
      this.ctx.lineTo(pipe.x + pipe.width * 0.15, midTopY);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      const midBottomY = bottomY + pipe.bottom / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(pipe.x, bottomY);
      this.ctx.lineTo(pipe.x + pipe.width, bottomY);
      this.ctx.lineTo(pipe.x + pipe.width * 0.85, midBottomY);
      this.ctx.lineTo(pipe.x + pipe.width, this.height - 20 + 10);
      this.ctx.lineTo(pipe.x, this.height - 20 + 10);
      this.ctx.lineTo(pipe.x + pipe.width * 0.15, midBottomY);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

    } else if (shape === 'inverse-tapered') {
      // Top Pipe body
      this.ctx.beginPath();
      this.ctx.moveTo(pipe.x + 8, -10);
      this.ctx.lineTo(pipe.x + pipe.width - 8, -10);
      this.ctx.lineTo(pipe.x + pipe.width + 8, pipe.top);
      this.ctx.lineTo(pipe.x - 8, pipe.top);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Bottom Pipe body
      this.ctx.beginPath();
      this.ctx.moveTo(pipe.x - 8, bottomY);
      this.ctx.lineTo(pipe.x + pipe.width + 8, bottomY);
      this.ctx.lineTo(pipe.x + pipe.width - 8, this.height - 20 + 10);
      this.ctx.lineTo(pipe.x + 8, this.height - 20 + 10);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

    } else if (shape === 'tapered') {
      // Top Pipe body
      this.ctx.beginPath();
      this.ctx.moveTo(pipe.x - 12, -10);
      this.ctx.lineTo(pipe.x + pipe.width + 12, -10);
      this.ctx.lineTo(pipe.x + pipe.width, pipe.top);
      this.ctx.lineTo(pipe.x, pipe.top);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Bottom Pipe body
      this.ctx.beginPath();
      this.ctx.moveTo(pipe.x, bottomY);
      this.ctx.lineTo(pipe.x + pipe.width, bottomY);
      this.ctx.lineTo(pipe.x + pipe.width + 12, this.height - 20 + 10);
      this.ctx.lineTo(pipe.x - 12, this.height - 20 + 10);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

    } else {
      // 'square' / Standard Straight Cylinder
      // Top Pipe body
      this.ctx.beginPath();
      this.ctx.rect(pipe.x, -10, pipe.width, pipe.top + 10);
      this.ctx.fill();
      this.ctx.stroke();

      // Draw horizontal grooves
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      this.ctx.lineWidth = 1;
      const numLines = Math.floor(pipe.top / 25);
      for (let j = 0; j < numLines; j++) {
        const lineY = j * 25 + 10;
        this.ctx.beginPath();
        this.ctx.moveTo(pipe.x, lineY);
        this.ctx.lineTo(pipe.x + pipe.width, lineY);
        this.ctx.stroke();
      }
      this.ctx.restore();

      // Bottom Pipe body
      this.ctx.beginPath();
      this.ctx.rect(pipe.x, bottomY, pipe.width, pipe.bottom + 10);
      this.ctx.fill();
      this.ctx.stroke();

      // Draw horizontal grooves on bottom pipe
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      this.ctx.lineWidth = 1;
      const numLinesB = Math.floor(pipe.bottom / 25);
      for (let j = 0; j < numLinesB; j++) {
        const lineY = bottomY + j * 25 + 10;
        if (lineY < this.height - 20) {
          this.ctx.beginPath();
          this.ctx.moveTo(pipe.x, lineY);
          this.ctx.lineTo(pipe.x + pipe.width, lineY);
          this.ctx.stroke();
        }
      }
      this.ctx.restore();
    }

    // 3. Draw Gate neon caps (flanges at opening)
    this.ctx.shadowColor = capShadow;
    this.ctx.shadowBlur = 10;
    this.ctx.strokeStyle = capColor;
    
    const capHeight = 12;
    const capOffset = 4;
    
    let capGrad = this.ctx.createLinearGradient(pipe.x - capOffset, 0, pipe.x + pipe.width + capOffset, 0);
    let capStops = config.capColors;
    if (this.level === 20) {
      const hue = (this.frameCount * 2 + 180) % 360;
      capStops = [
        `hsl(${hue}, 100%, 15%)`,
        `hsl(${hue}, 100%, 35%)`,
        `hsl(${hue}, 100%, 75%)`,
        `hsl(${hue}, 100%, 55%)`,
        `hsl(${hue}, 100%, 25%)`,
        `hsl(${hue}, 100%, 10%)`
      ];
    }

    if (capStops && capStops.length >= 6) {
      capGrad.addColorStop(0, capStops[0]);
      capGrad.addColorStop(0.2, capStops[1]);
      capGrad.addColorStop(0.4, capStops[2]);
      capGrad.addColorStop(0.55, capStops[3]);
      capGrad.addColorStop(0.85, capStops[4]);
      capGrad.addColorStop(1, capStops[5]);
    } else {
      capGrad.addColorStop(0, '#002633');
      capGrad.addColorStop(0.2, '#008080');
      capGrad.addColorStop(0.4, '#b3f9ff');
      capGrad.addColorStop(0.55, '#00f0ff');
      capGrad.addColorStop(0.85, '#004d4d');
      capGrad.addColorStop(1, '#001a1a');
    }
    this.ctx.fillStyle = capGrad;
    
    // Top pipe cap
    this.ctx.beginPath();
    this.ctx.rect(
      pipe.x - capOffset, 
      pipe.top - capHeight, 
      pipe.width + (capOffset * 2), 
      capHeight
    );
    this.ctx.fill();
    this.ctx.stroke();

    // Bottom pipe cap
    this.ctx.beginPath();
    this.ctx.rect(
      pipe.x - capOffset, 
      bottomY, 
      pipe.width + (capOffset * 2), 
      capHeight
    );
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawPumpingBalls(pipe, outlineColor, shadowColor, capColor, capShadow) {
    const ballRadius = 24;
    const pulse = 1 + Math.sin(this.animationTime * 0.08) * 0.15;
    const currentRadius = ballRadius * pulse;
    const cx = pipe.x + pipe.width / 2;
    const topLimit = pipe.top;
    const spacing = ballRadius * 1.5;
    
    this.ctx.save();
    this.ctx.shadowColor = shadowColor;
    this.ctx.shadowBlur = 15;
    this.ctx.strokeStyle = outlineColor;
    this.ctx.lineWidth = 2.5;

    // Top balls
    for (let y = spacing / 2; y <= topLimit - currentRadius / 2; y += spacing) {
      const grad = this.ctx.createRadialGradient(cx - currentRadius / 4, y - currentRadius / 4, currentRadius / 8, cx, y, currentRadius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, outlineColor);
      grad.addColorStop(1, '#0c0c16');
      
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(cx, y, currentRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    }
    
    // Bottom balls
    const bottomY = pipe.gapY + pipe.gapHeight;
    const groundLimit = this.height - 20;
    for (let y = bottomY + currentRadius; y <= groundLimit + currentRadius; y += spacing) {
      const grad = this.ctx.createRadialGradient(cx - currentRadius / 4, y - currentRadius / 4, currentRadius / 8, cx, y, currentRadius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, outlineColor);
      grad.addColorStop(1, '#0c0c16');
      
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(cx, y, currentRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawTreesAndRocks(pipe, outlineColor, shadowColor, capColor, capShadow) {
    this.ctx.save();
    
    const cx = pipe.x + pipe.width / 2;
    const topY = pipe.top;
    const bottomY = pipe.gapY + pipe.gapHeight;
    const groundLimit = this.height - 20;

    // --- DRAW TOP HANGING CAVE ROCK ---
    this.ctx.shadowColor = shadowColor;
    this.ctx.shadowBlur = 10;
    this.ctx.strokeStyle = '#8a9bb8';
    
    let rockGrad = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    rockGrad.addColorStop(0, '#1c1f24');
    rockGrad.addColorStop(0.5, '#3a414c');
    rockGrad.addColorStop(1, '#111317');
    this.ctx.fillStyle = rockGrad;
    this.ctx.lineWidth = 2.0;

    this.ctx.beginPath();
    this.ctx.moveTo(pipe.x - 4, -10);
    this.ctx.lineTo(pipe.x + pipe.width + 4, -10);
    this.ctx.lineTo(pipe.x + pipe.width * 0.8, topY * 0.4);
    this.ctx.lineTo(pipe.x + pipe.width * 0.9, topY * 0.7);
    this.ctx.lineTo(cx, topY);
    this.ctx.lineTo(pipe.x + pipe.width * 0.15, topY * 0.65);
    this.ctx.lineTo(pipe.x + pipe.width * 0.25, topY * 0.35);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.strokeStyle = '#4e5868';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, topY);
    this.ctx.lineTo(cx - 5, topY * 0.6);
    this.ctx.moveTo(pipe.x + pipe.width * 0.8, topY * 0.4);
    this.ctx.lineTo(cx, topY * 0.6);
    this.ctx.stroke();

    // --- DRAW BOTTOM CYBER TREE ---
    this.ctx.shadowColor = shadowColor;
    this.ctx.shadowBlur = 10;
    this.ctx.strokeStyle = '#00ff66';
    this.ctx.lineWidth = 2.0;

    const treeHeight = groundLimit - bottomY;
    const trunkWidth = 14;
    const trunkHeight = treeHeight * 0.3;

    this.ctx.fillStyle = '#2d1a0e';
    this.ctx.strokeStyle = '#5a3d28';
    this.ctx.beginPath();
    this.ctx.rect(cx - trunkWidth / 2, groundLimit - trunkHeight, trunkWidth, trunkHeight);
    this.ctx.fill();
    this.ctx.stroke();

    const leafStartY = groundLimit - trunkHeight + 5;
    const leafEndY = bottomY;
    const layerHeight = (leafStartY - leafEndY) / 3;

    let leafGrad = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    leafGrad.addColorStop(0, '#001a08');
    leafGrad.addColorStop(0.5, '#00ff66');
    leafGrad.addColorStop(1, '#003311');
    this.ctx.fillStyle = leafGrad;
    this.ctx.strokeStyle = '#00ff66';

    for (let layer = 0; layer < 3; layer++) {
      const yBottom = leafStartY - layer * layerHeight;
      const yTop = yBottom - layerHeight - 4;
      const currentWidth = pipe.width * (1.1 - layer * 0.25);

      this.ctx.beginPath();
      this.ctx.moveTo(cx - currentWidth / 2, yBottom);
      this.ctx.lineTo(cx + currentWidth / 2, yBottom);
      this.ctx.lineTo(cx, yTop);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawBird() {
    // If invincible, flash bird by skipping rendering every few frames
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
      return;
    }

    this.ctx.save();
    
    // Center context around bird coordinate
    this.ctx.translate(this.bird.x, this.bird.y);
    if (!this.bird.facingRight) {
      this.ctx.scale(-1, 1); // Flip horizontally if flying left
    }
    this.ctx.rotate(this.bird.angle);
    
    const wingFlap = Math.sin(this.bird.wingTimer) * 5;
    
    // If jetpack is equipped, draw it behind the body
    if (this.equippedJetpack && this.equippedJetpack !== 'none') {
      const jp = this.jetpacks.find(j => j.id === this.equippedJetpack);
      const jpColor = jp ? jp.color : '#00f0ff';
      
      this.ctx.save();
      
      let thrusterGrad = this.ctx.createLinearGradient(-18, -10, -8, -10);
      thrusterGrad.addColorStop(0, '#333344');
      thrusterGrad.addColorStop(0.5, '#aaaaaa');
      thrusterGrad.addColorStop(1, '#111122');
      
      this.ctx.fillStyle = thrusterGrad;
      this.ctx.strokeStyle = jpColor;
      this.ctx.lineWidth = 1.5;
      this.ctx.shadowColor = jpColor;
      this.ctx.shadowBlur = 6;
      
      // Top cylinder
      this.ctx.roundRect = this.ctx.roundRect || function (x, y, w, h, r) {
        if (typeof r === 'number') r = {tl: r, tr: r, br: r, bl: r};
        this.beginPath();
        this.moveTo(x + r.tl, y);
        this.lineTo(x + w - r.tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
        this.lineTo(x + w, y + h - r.br);
        this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
        this.lineTo(x + r.bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
        this.lineTo(x, y + r.tl);
        this.quadraticCurveTo(x, y, x + r.tl, y);
        this.closePath();
        return this;
      };
      
      // Top cylinder
      this.ctx.beginPath();
      this.ctx.roundRect(-18, -11, 10, 6, 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Bottom cylinder
      this.ctx.beginPath();
      this.ctx.roundRect(-18, 5, 10, 6, 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Thruster nozzles
      this.ctx.fillStyle = '#222222';
      this.ctx.fillRect(-21, -9, 3, 3);
      this.ctx.fillRect(-21, 7, 3, 3);
      
      // Dynamic thruster fire plumes (animated and colored)
      let flameColor = '#ffea00';
      let coreColor = '#ffffff';
      if (jp) {
        flameColor = jp.color;
        if (jp.id === 'rusty') {
          flameColor = '#ff4500';
          coreColor = '#ffcc00';
        } else if (jp.id === 'crimson') {
          flameColor = '#ff0000';
          coreColor = '#ffcc00';
        } else if (jp.id === 'darkmatter') {
          flameColor = '#4b0082';
          coreColor = '#ff00ff';
        }
      }
      
      const flicker = Math.random() * 4;
      let flameLen = 6 + flicker;
      if (this.bird.velocity < 0) {
        flameLen += Math.abs(this.bird.velocity) * 2.2;
      }
      
      this.ctx.save();
      this.ctx.shadowColor = flameColor;
      this.ctx.shadowBlur = 10;
      
      // Top nozzle flame
      let topFlameGrad = this.ctx.createLinearGradient(-21, -7.5, -21 - flameLen, -7.5);
      topFlameGrad.addColorStop(0, flameColor);
      topFlameGrad.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = topFlameGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(-21, -9.5);
      this.ctx.lineTo(-21 - flameLen, -7.5);
      this.ctx.lineTo(-21, -5.5);
      this.ctx.closePath();
      this.ctx.fill();

      // Top inner flame core
      this.ctx.fillStyle = coreColor;
      this.ctx.beginPath();
      this.ctx.moveTo(-21, -8.5);
      this.ctx.lineTo(-21 - flameLen * 0.45, -7.5);
      this.ctx.lineTo(-21, -6.5);
      this.ctx.closePath();
      this.ctx.fill();

      // Bottom nozzle flame
      let bottomFlameGrad = this.ctx.createLinearGradient(-21, 8.5, -21 - flameLen, 8.5);
      bottomFlameGrad.addColorStop(0, flameColor);
      bottomFlameGrad.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = bottomFlameGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(-21, 6.5);
      this.ctx.lineTo(-21 - flameLen, 8.5);
      this.ctx.lineTo(-21, 10.5);
      this.ctx.closePath();
      this.ctx.fill();

      // Bottom inner flame core
      this.ctx.fillStyle = coreColor;
      this.ctx.beginPath();
      this.ctx.moveTo(-21, 7.5);
      this.ctx.lineTo(-21 - flameLen * 0.45, 8.5);
      this.ctx.lineTo(-21, 9.5);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
      
      // Connective straps
      this.ctx.shadowBlur = 0;
      this.ctx.strokeStyle = '#444455';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius + 1, -Math.PI * 0.7, -Math.PI * 0.3);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius + 1, Math.PI * 0.3, Math.PI * 0.7);
      this.ctx.stroke();
      
      this.ctx.restore();
    }
    
    if (this.birdColor === 'RED') {
      // --- RED BIRD (Classic Cyber Red style) ---
      this.ctx.shadowColor = 'rgba(255, 51, 51, 0.4)';
      this.ctx.shadowBlur = 8;
      
      // Crest feathers
      this.ctx.fillStyle = '#cc1111';
      this.ctx.strokeStyle = '#3a0000';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(-8, -14, 5, 0, Math.PI * 2);
      this.ctx.arc(-14, -10, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Tail feathers
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.moveTo(-14, 2);
      this.ctx.lineTo(-24, 5);
      this.ctx.lineTo(-24, 0);
      this.ctx.lineTo(-15, -2);
      this.ctx.closePath();
      this.ctx.fill();

      // Body (Red 3D Spherical Radial Gradient)
      let bodyGrad = this.ctx.createRadialGradient(-3, -3, 2, 0, 0, this.bird.radius);
      bodyGrad.addColorStop(0, '#ff6666'); // Highlight
      bodyGrad.addColorStop(0.6, '#ff3333'); // Mid red
      bodyGrad.addColorStop(1, '#990000'); // Shadow
      this.ctx.fillStyle = bodyGrad;
      this.ctx.strokeStyle = '#3a0000';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Cream belly (clipped inside body)
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.clip();
      this.ctx.fillStyle = '#ffe5cc';
      this.ctx.beginPath();
      this.ctx.arc(5, 8, 11, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // Eyes (Big White Circles)
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1;
      
      this.ctx.beginPath();
      this.ctx.arc(4, -3, 4.5, 0, Math.PI * 2); // left eye
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.arc(11, -3, 4.5, 0, Math.PI * 2); // right eye
      this.ctx.fill();
      this.ctx.stroke();

      // Pupils (Black dots)
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(5.5, -3, 1.5, 0, Math.PI * 2);
      this.ctx.arc(12.5, -3, 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Thick Cyber Eyebrows (Black V-shape)
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(1, -7);
      this.ctx.lineTo(8, -4.5);
      this.ctx.lineTo(15, -7.5);
      this.ctx.stroke();

      // Beak (Yellow Triangle)
      this.ctx.fillStyle = '#ffcc00';
      this.ctx.strokeStyle = '#3a0000';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(10, -1);
      this.ctx.lineTo(20, 2);
      this.ctx.lineTo(9, 5);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Wing (Red, flapping)
      this.ctx.fillStyle = '#cc1111';
      this.ctx.strokeStyle = '#3a0000';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(-5, 0);
      this.ctx.lineTo(-15, -6 + wingFlap);
      this.ctx.lineTo(-10, 6);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

    } else if (this.birdColor === 'YELLOW') {
      // --- YELLOW BIRD (Cyber Yellow 3D Faceted Prism) ---
      this.ctx.shadowColor = 'rgba(255, 234, 0, 0.4)';
      this.ctx.shadowBlur = 8;

      // Spiky Black Hair
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.moveTo(-10, -11);
      this.ctx.lineTo(-18, -22);
      this.ctx.lineTo(-10, -16);
      this.ctx.lineTo(-8, -24);
      this.ctx.lineTo(-4, -12);
      this.ctx.closePath();
      this.ctx.fill();

      // Tail
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.moveTo(-12, 4);
      this.ctx.lineTo(-25, 8);
      this.ctx.lineTo(-24, 0);
      this.ctx.closePath();
      this.ctx.fill();

      // Body (3D Prism facets: Split horizontally)
      this.ctx.strokeStyle = '#5a3d00';
      this.ctx.lineWidth = 2.5;

      // Crease line runs from front tip (17,2) to back center (-13,0)
      // Top Facet (Light Yellow linear gradient)
      let topGrad = this.ctx.createLinearGradient(-14, -14, 17, 2);
      topGrad.addColorStop(0, '#fff366');
      topGrad.addColorStop(1, '#ffea00');
      this.ctx.fillStyle = topGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(17, 2);
      this.ctx.lineTo(-14, -14);
      this.ctx.lineTo(-13, 0);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Bottom Facet (Shadow Gold/Yellow linear gradient)
      let bottomGrad = this.ctx.createLinearGradient(-12, 14, 17, 2);
      bottomGrad.addColorStop(0, '#b38600');
      bottomGrad.addColorStop(1, '#cca300');
      this.ctx.fillStyle = bottomGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(17, 2);
      this.ctx.lineTo(-13, 0);
      this.ctx.lineTo(-12, 14);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // White belly (Clipped inside triangular bounds)
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(17, 2);
      this.ctx.lineTo(-14, -14);
      this.ctx.lineTo(-12, 14);
      this.ctx.closePath();
      this.ctx.clip();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(-2, 10, 11, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // Eyes
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(3, -2, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(9, -2, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Pupils
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(4.5, -2, 1.5, 0, Math.PI * 2);
      this.ctx.arc(10.5, -2, 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Thick Eyebrows (Reddish brown)
      this.ctx.strokeStyle = '#cc0000';
      this.ctx.lineWidth = 2.2;
      this.ctx.beginPath();
      this.ctx.moveTo(-1, -6.5);
      this.ctx.lineTo(6, -4);
      this.ctx.lineTo(13, -6);
      this.ctx.stroke();

      // Long Orange Beak (with 3D bottom shade)
      this.ctx.fillStyle = '#ff6600';
      this.ctx.strokeStyle = '#3a0000';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(9, 0);
      this.ctx.lineTo(24, 3);
      this.ctx.lineTo(8, 6);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Wing (Yellow, flapping)
      this.ctx.fillStyle = '#e5b800';
      this.ctx.strokeStyle = '#5a3d00';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(-4, 1);
      this.ctx.lineTo(-14, -4 + wingFlap);
      this.ctx.lineTo(-9, 7);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

    } else if (this.birdColor === 'PINK') {
      // --- PINK BIRD (Cyber Pink 3D Shaded style) ---
      this.ctx.shadowColor = 'rgba(255, 0, 127, 0.4)';
      this.ctx.shadowBlur = 8;

      // Crest (Light Pink + Dark Tips)
      this.ctx.fillStyle = '#ff66b2';
      this.ctx.strokeStyle = '#4a0025';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(-8, -13, 4, 0, Math.PI * 2);
      this.ctx.arc(-13, -9, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Body (Round Pink 3D Radial Gradient)
      let bodyGrad = this.ctx.createRadialGradient(-3, -3, 2, 0, 0, this.bird.radius);
      bodyGrad.addColorStop(0, '#ff99cc'); // highlight
      bodyGrad.addColorStop(0.6, '#ff66b2'); // base
      bodyGrad.addColorStop(1, '#b30059'); // shadow
      this.ctx.fillStyle = bodyGrad;
      this.ctx.strokeStyle = '#4a0025';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Light Pink belly
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.clip();
      this.ctx.fillStyle = '#ffb3d9';
      this.ctx.beginPath();
      this.ctx.arc(5, 7, 10, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // Big cute eyes
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#4a0025';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(4, -2, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(11, -2, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Cute Blue Pupils
      this.ctx.fillStyle = '#0099ff';
      this.ctx.beginPath();
      this.ctx.arc(5, -2, 2.5, 0, Math.PI * 2);
      this.ctx.arc(12, -2, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Black centers
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(5, -2, 1.2, 0, Math.PI * 2);
      this.ctx.arc(12, -2, 1.2, 0, Math.PI * 2);
      this.ctx.fill();

      // Eyelashes (Thin black curves)
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.arc(4, -2, 5.2, -Math.PI/1.5, -Math.PI/3);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(11, -2, 5.2, -Math.PI/1.5, -Math.PI/3);
      this.ctx.stroke();

      // Beak (Small yellow beak)
      this.ctx.fillStyle = '#ffe033';
      this.ctx.strokeStyle = '#4a0025';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(9, 0);
      this.ctx.lineTo(16, 2);
      this.ctx.lineTo(8, 4);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Wing (Flapping Pink/Dark Pink)
      this.ctx.fillStyle = '#ff3399';
      this.ctx.strokeStyle = '#4a0025';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(-5, 0);
      this.ctx.lineTo(-14, -5 + wingFlap);
      this.ctx.lineTo(-10, 5);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

    } else if (this.birdColor === 'EAGLE') {
      // --- EAGLE COMMANDER (Premium bird) ---
      this.ctx.shadowColor = 'rgba(255, 200, 50, 0.4)';
      this.ctx.shadowBlur = 10;
      
      this.ctx.fillStyle = '#eeeeee';
      this.ctx.strokeStyle = '#3a2a1a';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(-10, -12);
      this.ctx.lineTo(-20, -18);
      this.ctx.lineTo(-12, -15);
      this.ctx.lineTo(-16, -24);
      this.ctx.lineTo(-6, -14);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#221100';
      this.ctx.beginPath();
      this.ctx.moveTo(-13, 3);
      this.ctx.lineTo(-25, 6);
      this.ctx.lineTo(-24, -2);
      this.ctx.closePath();
      this.ctx.fill();

      let bodyGrad = this.ctx.createRadialGradient(-3, -3, 2, 0, 0, this.bird.radius);
      bodyGrad.addColorStop(0, '#cca37a');
      bodyGrad.addColorStop(0.6, '#80552b');
      bodyGrad.addColorStop(1, '#4d2600');
      this.ctx.fillStyle = bodyGrad;
      this.ctx.strokeStyle = '#3a2a1a';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.clip();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(8, -2, 10, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      this.ctx.fillStyle = '#ffe500';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.arc(6, -3, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(7, -3, 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.moveTo(1, -7);
      this.ctx.lineTo(11, -5);
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffaa00';
      this.ctx.strokeStyle = '#3a2a1a';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(11, -2);
      this.ctx.lineTo(24, 2);
      this.ctx.quadraticCurveTo(20, 10, 10, 6);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#663300';
      this.ctx.strokeStyle = '#3a2a1a';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(-4, 0);
      this.ctx.lineTo(-16, -6 + wingFlap);
      this.ctx.lineTo(-12, 6);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.moveTo(-12, -3 + wingFlap * 0.5);
      this.ctx.lineTo(-16, -6 + wingFlap);
      this.ctx.lineTo(-14, 2);
      this.ctx.closePath();
      this.ctx.fill();

    } else if (this.birdColor === 'CANARY') {
      // --- CHRONO CANARY (Premium bird) ---
      this.ctx.shadowColor = 'rgba(204, 255, 51, 0.5)';
      this.ctx.shadowBlur = 10;

      this.ctx.fillStyle = '#ccff33';
      this.ctx.strokeStyle = '#2d3b00';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(-6, -13, 3.5, 0, Math.PI * 2);
      this.ctx.arc(-11, -9, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#ccff33';
      this.ctx.beginPath();
      this.ctx.moveTo(-12, 3);
      this.ctx.lineTo(-24, 7);
      this.ctx.lineTo(-20, -1);
      this.ctx.closePath();
      this.ctx.fill();

      let bodyGrad = this.ctx.createRadialGradient(-3, -3, 2, 0, 0, this.bird.radius);
      bodyGrad.addColorStop(0, '#e6ff99');
      bodyGrad.addColorStop(0.6, '#ccff33');
      bodyGrad.addColorStop(1, '#779900');
      this.ctx.fillStyle = bodyGrad;
      this.ctx.strokeStyle = '#2d3b00';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.arc(-4, 4, 4, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(-4, 0); this.ctx.lineTo(-4, 2);
      this.ctx.moveTo(-8, 4); this.ctx.lineTo(-6, 4);
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#006699';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(5, -2, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#0099ff';
      this.ctx.beginPath();
      this.ctx.arc(6, -2, 3, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ff6600';
      this.ctx.strokeStyle = '#2d3b00';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(10, 0);
      this.ctx.lineTo(18, 2);
      this.ctx.lineTo(9, 4);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      let wingGrad = this.ctx.createLinearGradient(-5, 0, -15, wingFlap);
      wingGrad.addColorStop(0, '#00f0ff');
      wingGrad.addColorStop(1, '#ccff33');
      this.ctx.fillStyle = wingGrad;
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(-4, 1);
      this.ctx.lineTo(-15, -5 + wingFlap);
      this.ctx.lineTo(-10, 6);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

    } else if (this.birdColor === 'PHOENIX') {
      // --- SHADOW PHOENIX (Premium bird) ---
      this.ctx.shadowColor = 'rgba(255, 0, 127, 0.6)';
      this.ctx.shadowBlur = 12;

      let crestGrad = this.ctx.createLinearGradient(-10, -12, -22, -26);
      crestGrad.addColorStop(0, '#ff0055');
      crestGrad.addColorStop(1, '#ffcc00');
      this.ctx.fillStyle = crestGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(-6, -12);
      this.ctx.quadraticCurveTo(-15, -25, -22, -26);
      this.ctx.quadraticCurveTo(-14, -18, -10, -14);
      this.ctx.quadraticCurveTo(-12, -28, -8, -30);
      this.ctx.quadraticCurveTo(-6, -18, -4, -12);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.fillStyle = '#ff3300';
      this.ctx.beginPath();
      this.ctx.moveTo(-13, 2);
      this.ctx.quadraticCurveTo(-26, 12, -32, 14);
      this.ctx.quadraticCurveTo(-22, 4, -14, 0);
      this.ctx.quadraticCurveTo(-28, -6, -34, -8);
      this.ctx.quadraticCurveTo(-20, -2, -13, -2);
      this.ctx.closePath();
      this.ctx.fill();

      let bodyGrad = this.ctx.createRadialGradient(-3, -3, 2, 0, 0, this.bird.radius);
      bodyGrad.addColorStop(0, '#ff00ff');
      bodyGrad.addColorStop(0.5, '#660033');
      bodyGrad.addColorStop(1, '#1a000d');
      this.ctx.fillStyle = bodyGrad;
      this.ctx.strokeStyle = '#ff007f';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#ff0000';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(5, -2, 4.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

    } else if (this.birdColor === 'CHICK') {
      // --- ROBO CHICK (Exclusive Bred Skin) ---
      this.ctx.shadowColor = 'rgba(255, 234, 0, 0.6)';
      this.ctx.shadowBlur = 10;

      // Body (Radial yellow-orange gradient)
      let bodyGrad = this.ctx.createRadialGradient(-3, -3, 2, 0, 0, this.bird.radius);
      bodyGrad.addColorStop(0, '#ffff33');
      bodyGrad.addColorStop(0.7, '#ffcc00');
      bodyGrad.addColorStop(1, '#e68a00');
      this.ctx.fillStyle = bodyGrad;
      this.ctx.strokeStyle = '#ff9900';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Cheeks (Blush)
      this.ctx.fillStyle = 'rgba(255, 51, 153, 0.4)';
      this.ctx.beginPath();
      this.ctx.arc(-5, 2, 3, 0, Math.PI * 2);
      this.ctx.arc(5, 2, 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Beak (Small orange triangle)
      this.ctx.fillStyle = '#ff6600';
      this.ctx.strokeStyle = '#3a1100';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.moveTo(3, -2);
      this.ctx.lineTo(11, 1);
      this.ctx.lineTo(3, 4);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Eyes
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#333333';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(-2, -3, 5, 0, Math.PI * 2);
      this.ctx.arc(4, -3, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Pupils (Black)
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(-1, -3, 2, 0, Math.PI * 2);
      this.ctx.arc(5, -3, 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Specular Glints
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(-1.5, -4, 0.8, 0, Math.PI * 2);
      this.ctx.arc(4.5, -4, 0.8, 0, Math.PI * 2);
      this.ctx.fill();

      // Cracked Eggshell Helmet
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 1.8;
      this.ctx.beginPath();
      this.ctx.arc(0, -7, this.bird.radius * 0.9, Math.PI, 0);
      this.ctx.lineTo(10, -7);
      this.ctx.lineTo(6, -4);
      this.ctx.lineTo(2, -7);
      this.ctx.lineTo(-2, -4);
      this.ctx.lineTo(-6, -7);
      this.ctx.lineTo(-10, -7);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Wing (Yellow)
      this.ctx.fillStyle = '#ffea00';
      this.ctx.strokeStyle = '#b38600';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(-3, 1);
      this.ctx.lineTo(-11, -2 + wingFlap * 0.7);
      this.ctx.lineTo(-7, 6);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

    } else if (this.birdColor === 'CYAN') {
      // --- CYAN BIRD (Neon Parrot Skin - 3D Cartoon style matching uploaded look) ---
      const wingFlapFar = Math.sin(this.bird.wingTimer + 0.6) * 5;

      // 1. Far Wing (Behind the body, shingled, darker/shadowed)
      this.ctx.save();
      this.ctx.shadowColor = '#002b4d';
      this.ctx.shadowBlur = 5;
      let farWingGrad = this.ctx.createLinearGradient(-15, -12 + wingFlapFar, 0, 0);
      farWingGrad.addColorStop(0, '#00802b');
      farWingGrad.addColorStop(1, '#002b4d');
      this.ctx.fillStyle = farWingGrad;
      this.ctx.strokeStyle = '#001a33';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(-3, -2);
      this.ctx.quadraticCurveTo(-15, -22 + wingFlapFar, -18, -16 + wingFlapFar);
      this.ctx.quadraticCurveTo(-9, -4, -5, -2);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Shingled details on far wing
      this.ctx.fillStyle = '#006622';
      this.ctx.beginPath();
      this.ctx.arc(-10, -10 + wingFlapFar, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // 2. Tail Feathers (Layered multi-colored)
      this.ctx.save();
      this.ctx.shadowColor = '#ff007f';
      this.ctx.shadowBlur = 6;
      let tailGrad = this.ctx.createLinearGradient(-15, 8, -24, 15);
      tailGrad.addColorStop(0, '#80ff00');
      tailGrad.addColorStop(0.6, '#00aa3a');
      tailGrad.addColorStop(1, '#0055ff');
      
      this.ctx.fillStyle = tailGrad;
      this.ctx.strokeStyle = '#003366';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(-10, 4);
      this.ctx.lineTo(-24, 15);
      this.ctx.lineTo(-15, 8);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.fillStyle = '#ff007f';
      this.ctx.strokeStyle = '#99004d';
      this.ctx.beginPath();
      this.ctx.moveTo(-10, 6);
      this.ctx.lineTo(-20, 18);
      this.ctx.lineTo(-14, 10);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffea00';
      this.ctx.strokeStyle = '#cca300';
      this.ctx.beginPath();
      this.ctx.moveTo(-8, 5);
      this.ctx.lineTo(-17, 12);
      this.ctx.lineTo(-12, 7);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();

      // 3. Red Legs / claws
      this.ctx.save();
      this.ctx.strokeStyle = '#ff3333';
      this.ctx.lineWidth = 2.2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();
      // Leg 1
      this.ctx.moveTo(0, 8);
      this.ctx.lineTo(-3, 15);
      this.ctx.lineTo(-6, 14);
      this.ctx.moveTo(-3, 15);
      this.ctx.lineTo(-2, 17);
      // Leg 2
      this.ctx.moveTo(4, 8);
      this.ctx.lineTo(3, 16);
      this.ctx.lineTo(1, 16);
      this.ctx.moveTo(3, 16);
      this.ctx.lineTo(5, 18);
      this.ctx.stroke();
      this.ctx.restore();

      // 4. Body (Green 3D Radial Gradient)
      this.ctx.save();
      this.ctx.shadowColor = '#00ff66';
      this.ctx.shadowBlur = 10;
      let bodyGrad = this.ctx.createRadialGradient(-3, -1, 2, 0, 2, this.bird.radius);
      bodyGrad.addColorStop(0, '#a3ff66'); 
      bodyGrad.addColorStop(0.6, '#33cc33'); 
      bodyGrad.addColorStop(1, '#006600'); 
      this.ctx.fillStyle = bodyGrad;
      this.ctx.strokeStyle = '#003311';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 2, this.bird.radius, this.bird.radius * 0.85, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();

      // 5. Head & Crest (Crest tufts + Green cap)
      this.ctx.save();
      this.ctx.shadowColor = '#00ff66';
      this.ctx.shadowBlur = 10;
      let headGrad = this.ctx.createRadialGradient(6, -8, 2, 8, -6, 8);
      headGrad.addColorStop(0, '#d6ff99');
      headGrad.addColorStop(0.6, '#00cc44');
      headGrad.addColorStop(1, '#006622');
      this.ctx.fillStyle = headGrad;
      this.ctx.strokeStyle = '#003311';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(8, -6, 8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Head Crest Tuft
      this.ctx.beginPath();
      this.ctx.moveTo(4, -13);
      this.ctx.quadraticCurveTo(-2, -20, 3, -19);
      this.ctx.quadraticCurveTo(5, -23, 9, -17);
      this.ctx.quadraticCurveTo(8, -13, 6, -13);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();

      // 6. Yellow Face Mask Overlay (around the eyes)
      this.ctx.save();
      let faceMaskGrad = this.ctx.createRadialGradient(7, -6, 2, 8, -6, 7);
      faceMaskGrad.addColorStop(0, '#fff599');
      faceMaskGrad.addColorStop(0.7, '#ffea00');
      faceMaskGrad.addColorStop(1, '#cca300');
      this.ctx.fillStyle = faceMaskGrad;
      this.ctx.beginPath();
      this.ctx.ellipse(8, -6, 7.2, 5.5, Math.PI / 12, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // 7. Hooked Beak (Big Red Upper Beak & Open lower beak with pink tongue)
      this.ctx.save();
      this.ctx.shadowColor = '#ff0033';
      this.ctx.shadowBlur = 8;
      let beakGrad = this.ctx.createRadialGradient(15, -6, 1, 17, -4, 5);
      beakGrad.addColorStop(0, '#ff99bb');
      beakGrad.addColorStop(0.5, '#ff0033');
      beakGrad.addColorStop(1, '#80001a');
      this.ctx.fillStyle = beakGrad;
      this.ctx.strokeStyle = '#3a0000';
      this.ctx.lineWidth = 1.5;
      
      // Upper Hooked Beak
      this.ctx.beginPath();
      this.ctx.moveTo(12, -9);
      this.ctx.quadraticCurveTo(23, -9, 22, -2);
      this.ctx.quadraticCurveTo(17, 0, 12, -4);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Lower Beak (Open)
      this.ctx.fillStyle = '#80001a';
      this.ctx.beginPath();
      this.ctx.moveTo(12, -4);
      this.ctx.quadraticCurveTo(16, -3, 18, -2);
      this.ctx.quadraticCurveTo(14, 1, 12, -2);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Tongue (Pink)
      this.ctx.fillStyle = '#ff6688';
      this.ctx.beginPath();
      this.ctx.moveTo(13, -3);
      this.ctx.quadraticCurveTo(15, -3, 15, -2.2);
      this.ctx.quadraticCurveTo(14, -1, 13, -2.5);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();

      // 8. Cartoon Eye (Large, Cyan Iris, Eyebrow, Eyelashes, specularity)
      this.ctx.save();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.arc(7.5, -6.5, 4.2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.fillStyle = '#00ccff';
      this.ctx.beginPath();
      this.ctx.arc(8.3, -6.5, 2.6, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(8.8, -6.5, 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Dual Specular highlights
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(7.5, -7.6, 0.7, 0, Math.PI * 2);
      this.ctx.arc(9.2, -5.6, 0.4, 0, Math.PI * 2);
      this.ctx.fill();

      // Eyebrow & Eyelashes
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 0.8;
      this.ctx.beginPath();
      // Eyelashes curves
      this.ctx.moveTo(11, -8.5);
      this.ctx.quadraticCurveTo(12.5, -8.5, 13, -7.5);
      this.ctx.moveTo(11.5, -9.5);
      this.ctx.quadraticCurveTo(12.8, -9, 13.2, -8);
      this.ctx.stroke();

      // Black Eyebrow
      this.ctx.lineWidth = 1.6;
      this.ctx.beginPath();
      this.ctx.arc(7.5, -6.5, 5.0, -Math.PI * 0.75, -Math.PI * 0.25);
      this.ctx.stroke();
      this.ctx.restore();

      // 9. Near Wing (Bright green/blue linear gradient with layered shingled feather tips)
      this.ctx.save();
      this.ctx.shadowColor = '#00ff66';
      this.ctx.shadowBlur = 10;
      let nearWingGrad = this.ctx.createLinearGradient(-15, -12 + wingFlap, 0, 0);
      nearWingGrad.addColorStop(0, '#80ff00');
      nearWingGrad.addColorStop(0.6, '#00aa3a');
      nearWingGrad.addColorStop(1, '#0055ff');
      this.ctx.fillStyle = nearWingGrad;
      this.ctx.strokeStyle = '#002266';
      this.ctx.lineWidth = 2;
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.quadraticCurveTo(-12, -18 + wingFlap, -15, -12 + wingFlap);
      this.ctx.quadraticCurveTo(-6, 2, -2, 4);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Draw feather shingle layers on near wing
      this.ctx.strokeStyle = '#003300';
      this.ctx.lineWidth = 0.5;
      this.ctx.fillStyle = '#b3ff66';
      this.ctx.beginPath();
      this.ctx.arc(-2, -4 + wingFlap * 0.5, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#80ff00';
      this.ctx.beginPath();
      this.ctx.arc(-5, -2 + wingFlap * 0.5, 2.2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Wing tip blue details
      this.ctx.fillStyle = '#00f0ff';
      this.ctx.beginPath();
      this.ctx.moveTo(-10, -9 + wingFlap * 0.7);
      this.ctx.lineTo(-14, -13 + wingFlap * 0.7);
      this.ctx.lineTo(-12, -8 + wingFlap * 0.7);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    } else if (this.birdColor === 'WINGS') {
      // --- CYBER WINGS SKIN ---
      this.ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
      this.ctx.shadowBlur = 8;
      
      // Draw back wing
      this.ctx.save();
      this.ctx.fillStyle = '#0088cc';
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(-10, -5);
      this.ctx.quadraticCurveTo(-22, -18 - wingFlap, -24, -10 - wingFlap);
      this.ctx.quadraticCurveTo(-15, -2, -10, -3);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();

      // Body (Cyan 3D Spherical Radial Gradient)
      let bodyGrad = this.ctx.createRadialGradient(-3, -3, 2, 0, 0, this.bird.radius);
      bodyGrad.addColorStop(0, '#e6ffff');
      bodyGrad.addColorStop(0.6, '#00ffff');
      bodyGrad.addColorStop(1, '#008899');
      this.ctx.fillStyle = bodyGrad;
      this.ctx.strokeStyle = '#004455';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Beak
      this.ctx.fillStyle = '#ffaa00';
      this.ctx.beginPath();
      this.ctx.moveTo(8, -1);
      this.ctx.lineTo(15, 2);
      this.ctx.lineTo(8, 5);
      this.ctx.closePath();
      this.ctx.fill();

      // Eyes
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(4, -3, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#000';
      this.ctx.beginPath();
      this.ctx.arc(5.2, -3, 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Front wing (Cyan/White glowing cyber wing)
      this.ctx.save();
      let wingGrad = this.ctx.createLinearGradient(-10, -10 + wingFlap, 0, 0);
      wingGrad.addColorStop(0, '#ffffff');
      wingGrad.addColorStop(0.5, '#00ffff');
      wingGrad.addColorStop(1, '#005588');
      this.ctx.fillStyle = wingGrad;
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.moveTo(-5, 0);
      this.ctx.quadraticCurveTo(-18, -15 + wingFlap, -22, -8 + wingFlap);
      this.ctx.quadraticCurveTo(-12, 3, -5, 1);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();
    } else if (this.birdColor === 'HAWK') {
      // --- NEON HAWK SKIN ---
      this.ctx.shadowColor = 'rgba(255, 85, 0, 0.5)';
      this.ctx.shadowBlur = 10;

      // Crest Spikes (Hawk shape)
      this.ctx.fillStyle = '#ff3300';
      this.ctx.beginPath();
      this.ctx.moveTo(-5, -12);
      this.ctx.lineTo(-18, -18);
      this.ctx.lineTo(-12, -9);
      this.ctx.lineTo(-24, -12);
      this.ctx.lineTo(-12, -4);
      this.ctx.closePath();
      this.ctx.fill();

      // Body (Volcanic Orange Radial Gradient)
      let bodyGrad = this.ctx.createRadialGradient(-3, -3, 2, 0, 0, this.bird.radius);
      bodyGrad.addColorStop(0, '#ffcc00');
      bodyGrad.addColorStop(0.6, '#ff5500');
      bodyGrad.addColorStop(1, '#801a00');
      this.ctx.fillStyle = bodyGrad;
      this.ctx.strokeStyle = '#3d0c00';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Hawk Sharp Yellow Beak
      this.ctx.fillStyle = '#ffea00';
      this.ctx.beginPath();
      this.ctx.moveTo(6, -4);
      this.ctx.quadraticCurveTo(16, -2, 17, 4);
      this.ctx.quadraticCurveTo(10, 8, 6, 2);
      this.ctx.closePath();
      this.ctx.fill();

      // Determined Hawk Eye
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(4, -3, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(5, -3, 1.3, 0, Math.PI * 2);
      this.ctx.fill();
      // Angled black eyebrow
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1.8;
      this.ctx.beginPath();
      this.ctx.moveTo(1, -6);
      this.ctx.lineTo(8, -4);
      this.ctx.stroke();

      // Hawk Wing
      this.ctx.save();
      let wingGrad = this.ctx.createLinearGradient(-12, -10 + wingFlap, 0, 0);
      wingGrad.addColorStop(0, '#ffea00');
      wingGrad.addColorStop(1, '#ff3300');
      this.ctx.fillStyle = wingGrad;
      this.ctx.strokeStyle = '#ff3300';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(-4, 0);
      this.ctx.quadraticCurveTo(-15, -12 + wingFlap, -18, -6 + wingFlap);
      this.ctx.quadraticCurveTo(-10, 4, -4, 2);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();
    } else if (this.birdColor === 'COORDINATOR') {
      // --- CYBER COORDINATOR (Premium Member Skin) ---
      this.ctx.shadowColor = 'rgba(51, 102, 255, 0.5)';
      this.ctx.shadowBlur = 10;

      // Body (Deep Blue Metallic Gradient)
      let bodyGrad = this.ctx.createRadialGradient(-3, -3, 2, 0, 0, this.bird.radius);
      bodyGrad.addColorStop(0, '#80c0ff');
      bodyGrad.addColorStop(0.6, '#3366ff');
      bodyGrad.addColorStop(1, '#001a66');
      this.ctx.fillStyle = bodyGrad;
      this.ctx.strokeStyle = '#000c33';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Holographic Visor Helmet
      this.ctx.save();
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 8;
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(5, -2, 6, -Math.PI * 0.6, Math.PI * 0.4);
      this.ctx.lineTo(2, 2);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();

      // Cyber Beak
      this.ctx.fillStyle = '#666677';
      this.ctx.beginPath();
      this.ctx.moveTo(8, -1);
      this.ctx.lineTo(14, 2);
      this.ctx.lineTo(8, 5);
      this.ctx.closePath();
      this.ctx.fill();

      // Cyber Wing
      this.ctx.save();
      this.ctx.fillStyle = '#001a66';
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 6;
      this.ctx.beginPath();
      this.ctx.moveTo(-4, -2);
      this.ctx.lineTo(-15, -12 + wingFlap);
      this.ctx.lineTo(-20, -5 + wingFlap);
      this.ctx.lineTo(-12, 4);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();
    } else {
      // Fallback: draw RED bird
      let bodyGrad = this.ctx.createRadialGradient(-3, -3, 2, 0, 0, this.bird.radius);
      bodyGrad.addColorStop(0, '#ff9999');
      bodyGrad.addColorStop(0.6, '#ff3333');
      bodyGrad.addColorStop(1, '#990000');
      this.ctx.fillStyle = bodyGrad;
      this.ctx.strokeStyle = '#4a0000';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#ff9900';
      this.ctx.beginPath();
      this.ctx.moveTo(8, -2);
      this.ctx.lineTo(16, 1);
      this.ctx.lineTo(8, 4);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(4, -4, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(5, -4, 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ff3333';
      this.ctx.strokeStyle = '#4a0000';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(-2, 1);
      this.ctx.lineTo(-10, -2 + wingFlap);
      this.ctx.lineTo(-6, 6);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }

    // Draw Guard Shield if active
    if (this.guardActive) {
      this.ctx.save();
      // Translate to bird center but do not rotate!
      this.ctx.translate(this.bird.x, this.bird.y);
      this.ctx.strokeStyle = '#00ff66';
      this.ctx.lineWidth = 2.5;
      this.ctx.shadowColor = '#00ff66';
      this.ctx.shadowBlur = 12;
      
      this.ctx.beginPath();
      const pulseRadius = this.bird.radius + 12 + Math.sin(this.animationTime * 0.15) * 3;
      this.ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Draw outer rotating dashed indicator
      this.ctx.strokeStyle = 'rgba(0, 255, 102, 0.4)';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([4, 6]);
      this.ctx.rotate(this.animationTime * 0.05);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, pulseRadius + 5, 0, Math.PI * 2);
      this.ctx.stroke();
      
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  recalculatePhysics() {
    let stabilityVal = 0;
    if (this.equippedJetpack && this.equippedJetpack !== 'none') {
      const jp = this.jetpacks.find(j => j.id === this.equippedJetpack);
      if (jp) {
        const upgradeLvl = this.jetpackUpgrades[jp.id] || 0;
        stabilityVal = jp.stability + upgradeLvl * 0.02;
      }
    }

    if (this.difficulty === 'EASY') {
      this.gravity = 0.28 * (1 - stabilityVal);
      this.jumpForce = -5.8;
      this.maxFallSpeed = 7.0;
      this.scrollSpeed = 1.8;
    } else {
      this.gravity = 0.38 * (1 - stabilityVal);
      this.jumpForce = -7.2;
      this.maxFallSpeed = 9.0;
      this.scrollSpeed = 2.4;
    }
    // Apply Flap Boost upgrade force multiplier
    this.jumpForce = this.jumpForce * (1 + this.upgradeLevel * 0.04);
  }

  updateSlowMoUI() {
    const slowmoBtn = document.getElementById('slowmo-toggle-btn');
    if (slowmoBtn) {
      if (this.slowMoActive) {
        slowmoBtn.textContent = 'ON';
        slowmoBtn.style.borderColor = 'var(--neon-cyan)';
        slowmoBtn.style.color = 'var(--neon-cyan)';
        slowmoBtn.style.background = 'rgba(0, 240, 255, 0.15)';
        slowmoBtn.style.boxShadow = 'var(--glow-cyan)';
      } else {
        slowmoBtn.textContent = 'OFF';
        slowmoBtn.style.borderColor = 'var(--neon-pink)';
        slowmoBtn.style.color = 'var(--neon-pink)';
        slowmoBtn.style.background = 'transparent';
        slowmoBtn.style.boxShadow = 'none';
      }
    }
  }

  buildBirdsShop() {
    const container = document.getElementById('premium-birds-list');
    if (!container) return;
    container.innerHTML = '';

    const lang = this.tutorialLang || 'SI';

    const displayBirds = [
      ...this.premiumBirds.map(b => ({
        id: b.id,
        name: b.name,
        color: b.color,
        description: b.description,
        source: 'coins',
        price: b.price
      })),
      {
        id: 'HAWK',
        name: {
          EN: 'Neon Hawk',
          SI: 'නියොන් හෝක්',
          ZH: '霓虹猎鹰',
          JA: 'ネオンホーク'
        }[lang] || 'Neon Hawk',
        color: '#ffea00',
        description: {
          EN: 'Unlock by watching a sponsored video. Sharp beak, crest spikes.',
          SI: 'වීඩියෝ දැන්වීමක් නැරඹීමෙන් නොමිලේ ලබා ගන්න. උල් හොටක් සහ කොණ්ඩයක් සහිතයි.',
          ZH: '通过观看赞助视频解锁。尖锐的鸟喙，头冠羽毛。',
          JA: 'スポンサー動画の視聴でアンロック。鋭いクチバシと冠羽。'
        }[lang] || 'Unlock by watching a sponsored video. Sharp beak, crest spikes.',
        source: 'ad'
      },
      {
        id: 'WINGS',
        name: {
          EN: 'Cyber Wings',
          SI: 'සයිබර් වින්ග්ස්',
          ZH: '赛博机翼',
          JA: 'サイバーウィング'
        }[lang] || 'Cyber Wings',
        color: '#00f0ff',
        description: {
          EN: 'Unlock in Store tab. Glowing cyan wings, sleek body.',
          SI: 'Store ටැබ් එකෙන් මිලදී ගන්න. දීප්තිමත් සයිබර් පියාපත් සහිතයි.',
          ZH: '在商店标签页中解锁。发光的青色机翼，流线型机身。',
          JA: 'ストアタブで解禁。光るシアン of ウィング、スマートなボディ。'
        }[lang] || 'Unlock in Store tab. Glowing cyan wings, sleek body.',
        source: 'store'
      },
      {
        id: 'COORDINATOR',
        name: {
          EN: 'Cyber Coordinator',
          SI: 'සයිබර් කොඕඩිනේටර්',
          ZH: '赛博协调员',
          JA: 'サイバーコーディネーター'
        }[lang] || 'Cyber Coordinator',
        color: '#ff007f',
        description: {
          EN: 'Unlock Premium Coordinator. Visor helmet, ad-free access.',
          SI: 'Premium Coordinator ලෙස එකතු වන්න. දැන්වීම් රහිතයි.',
          ZH: '解锁高级协调员。护目镜面罩头盔，无广告体验。',
          JA: 'プレミアムコーディネーターを有効にする。バイザーヘルメット、広告なし。'
        }[lang] || 'Unlock Premium Coordinator. Visor helmet, ad-free access.',
        source: 'premium'
      }
    ];

    displayBirds.forEach(bird => {
      const card = document.createElement('div');
      card.className = 'shop-item-card';

      // Left container for canvas + details
      const cardLeft = document.createElement('div');
      cardLeft.style.display = 'flex';
      cardLeft.style.alignItems = 'center';

      // Mini preview 3D image (Scaled to 200%)
      const img = document.createElement('img');
      let imgSrc = 'eagle_3d_icon.png';
      if (bird.id === 'CANARY') imgSrc = 'canary_3d_icon.png';
      else if (bird.id === 'PHOENIX') imgSrc = 'phoenix_3d_icon.png';
      else if (bird.id === 'HAWK') imgSrc = 'hawk_3d_icon.png';
      else if (bird.id === 'WINGS') imgSrc = 'wings_3d_icon.png';
      else if (bird.id === 'COORDINATOR') imgSrc = 'coordinator_3d_icon.png';
      img.src = imgSrc;
      img.alt = bird.name;
      img.style.width = '80px';
      img.style.height = '80px';
      img.style.borderRadius = '50%';
      img.style.background = 'rgba(255, 255, 255, 0.03)';
      img.style.border = `2px solid ${bird.color}`;
      img.style.marginRight = '10px';
      img.style.flexShrink = '0';
      img.style.objectFit = 'cover';
      img.style.boxShadow = '0 0 8px ' + bird.color + '40';

      const details = document.createElement('div');
      
      const name = document.createElement('div');
      name.className = 'shop-item-name';
      name.textContent = bird.name;
      name.style.color = bird.color;
      
      const desc = document.createElement('div');
      desc.className = 'shop-item-desc';
      desc.textContent = bird.description;

      details.appendChild(name);
      details.appendChild(desc);

      cardLeft.appendChild(img);
      cardLeft.appendChild(details);

      const actionBtn = document.createElement('button');
      actionBtn.className = 'pwa-btn';
      actionBtn.style.marginTop = '0';

      const isUnlocked = this.unlockedBirds.includes(bird.id);
      const isEquipped = this.birdColor === bird.id;

      if (isUnlocked) {
        if (isEquipped) {
          actionBtn.textContent = { EN: 'EQUIPPED', SI: 'සක්‍රීයයි', ZH: '已装备', JA: '装備中' }[lang] || 'EQUIPPED';
          actionBtn.style.borderColor = 'var(--neon-cyan)';
          actionBtn.style.color = 'var(--neon-cyan)';
          actionBtn.style.boxShadow = 'var(--glow-cyan)';
        } else {
          actionBtn.textContent = { EN: 'EQUIP', SI: 'භාවිත කරන්න', ZH: '装备', JA: '装備' }[lang] || 'EQUIP';
          actionBtn.style.borderColor = '#fff';
          actionBtn.style.color = '#fff';
          actionBtn.style.boxShadow = 'none';
        }
      } else {
        if (bird.source === 'ad') {
          actionBtn.textContent = { EN: '📺 UNLOCK', SI: '📺 දැන්වීමක්', ZH: '📺 观看广告', JA: '📺 動画を見る' }[lang] || '📺 UNLOCK';
          actionBtn.style.borderColor = 'var(--neon-pink)';
          actionBtn.style.color = 'var(--neon-pink)';
          actionBtn.style.boxShadow = 'var(--glow-pink)';
        } else if (bird.source === 'store') {
          actionBtn.textContent = { EN: 'STORE', SI: 'කඩය', ZH: '商店', JA: 'ストア' }[lang] || 'STORE';
          actionBtn.style.borderColor = 'var(--neon-cyan)';
          actionBtn.style.color = 'var(--neon-cyan)';
          actionBtn.style.boxShadow = 'var(--glow-cyan)';
        } else if (bird.source === 'premium') {
          actionBtn.textContent = { EN: 'PREMIUM', SI: 'ප්‍රීමියම්', ZH: '高级', JA: 'プレミアム' }[lang] || 'PREMIUM';
          actionBtn.style.borderColor = 'var(--neon-yellow)';
          actionBtn.style.color = 'var(--neon-yellow)';
          actionBtn.style.boxShadow = 'var(--glow-yellow)';
        } else {
          actionBtn.textContent = `BUY: ${bird.price} 🪙`;
          actionBtn.style.borderColor = '#ff9900';
          actionBtn.style.color = '#ff9900';
          actionBtn.style.boxShadow = '0 0 4px rgba(255,153,0,0.2)';
        }
      }

      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isUnlocked) {
          if (!isEquipped) {
            this.birdColor = bird.id;
            this.saveProgress();
            this.audio.playJump();
            this.buildBirdsShop();
            this.updateHomeUI();
            
            // De-select default bubbles
            this.colorBubbles.forEach(b => {
              b.classList.remove('active');
              b.style.borderColor = 'transparent';
            });
            this.updateUpgradeUI();
          }
        } else {
          if (bird.source === 'ad') {
            const unlockAction = () => {
              this.unlockedBirds.push('HAWK');
              this.birdColor = 'HAWK';
              this.saveProgress();
              this.audio.playLevelUp();
              this.buildBirdsShop();
              this.updateHomeUI();
              this.updateUpgradeUI();
            };
            if (this.isPremium) {
              unlockAction();
            } else {
              this.showRewardedAd('HAWK', unlockAction);
            }
          } else if (bird.source === 'store' || bird.source === 'premium') {
            // Close settings and route to account store tab
            this.hideOverlay(this.settingsOverlay);
            this.isPaused = false;
            
            const accountOverlay = document.getElementById('account-overlay');
            if (accountOverlay) {
              this.isPaused = true;
              this.showOverlay(accountOverlay);
              const storeTabBtn = document.querySelector('[data-tab="tab-store"]');
              if (storeTabBtn) storeTabBtn.click();
            }
          } else {
            if (this.coinsCollected >= bird.price) {
              this.coinsCollected -= bird.price;
              this.unlockedBirds.push(bird.id);
              this.birdColor = bird.id;
              this.saveProgress();
              
              this.colorBubbles.forEach(b => {
                b.classList.remove('active');
                b.style.borderColor = 'transparent';
              });

              this.audio.playLevelUp();
              this.buildBirdsShop();
              this.updateUpgradeUI();
            } else {
              this.audio.playCrash();
            }
          }
        }
      });

      card.appendChild(cardLeft);
      card.appendChild(actionBtn);
      container.appendChild(card);
    });
  }

  buildJetpacksShop() {
    const container = document.getElementById('jetpacks-list');
    if (!container) return;
    container.innerHTML = '';

    this.jetpacks.forEach(jp => {
      const card = document.createElement('div');
      card.className = 'shop-item-card';

      // Left container for canvas + details
      const cardLeft = document.createElement('div');
      cardLeft.style.display = 'flex';
      cardLeft.style.alignItems = 'center';

      // Mini preview 3D image (Scaled to 200%)
      const img = document.createElement('img');
      img.src = 'jetpack_3d_icon.png';
      img.alt = jp.name;
      img.style.width = '80px';
      img.style.height = '80px';
      img.style.borderRadius = '8px';
      img.style.background = 'rgba(255, 255, 255, 0.03)';
      img.style.border = `2px solid ${jp.color}`;
      img.style.marginRight = '10px';
      img.style.flexShrink = '0';
      img.style.objectFit = 'cover';
      img.style.boxShadow = '0 0 8px ' + jp.color + '40';

      const details = document.createElement('div');
      
      const name = document.createElement('div');
      name.className = 'shop-item-name';
      name.textContent = jp.name;
      name.style.color = jp.color;
      
      const desc = document.createElement('div');
      desc.className = 'shop-item-desc';
      desc.textContent = jp.description;

      const upgradeLvl = this.jetpackUpgrades[jp.id] || 0;
      const totalStability = Math.round((jp.stability + upgradeLvl * 0.02) * 100);

      const stabilityLabel = document.createElement('div');
      stabilityLabel.className = 'shop-item-desc';
      stabilityLabel.style.color = 'var(--neon-cyan)';
      stabilityLabel.style.fontWeight = 'bold';
      stabilityLabel.style.marginTop = '2px';
      stabilityLabel.textContent = `STABILITY: +${totalStability}% (Level ${upgradeLvl}/5)`;

      details.appendChild(name);
      details.appendChild(desc);
      details.appendChild(stabilityLabel);

      cardLeft.appendChild(img);
      cardLeft.appendChild(details);

      // Button container on the right side
      const btnContainer = document.createElement('div');
      btnContainer.style.display = 'flex';
      btnContainer.style.flexDirection = 'column';
      btnContainer.style.gap = '6px';
      btnContainer.style.alignItems = 'flex-end';

      const actionBtn = document.createElement('button');
      actionBtn.className = 'pwa-btn';
      actionBtn.style.marginTop = '0';

      const isUnlocked = this.unlockedJetpacks.includes(jp.id);
      const isEquipped = this.equippedJetpack === jp.id;

      if (isUnlocked) {
        if (isEquipped) {
          actionBtn.textContent = 'EQUIPPED';
          actionBtn.style.borderColor = 'var(--neon-cyan)';
          actionBtn.style.color = 'var(--neon-cyan)';
          actionBtn.style.boxShadow = 'var(--glow-cyan)';
        } else {
          actionBtn.textContent = 'EQUIP';
          actionBtn.style.borderColor = '#fff';
          actionBtn.style.color = '#fff';
          actionBtn.style.boxShadow = 'none';
        }
      } else {
        actionBtn.textContent = `BUY: ${jp.price} 🪙`;
        actionBtn.style.borderColor = '#ff9900';
        actionBtn.style.color = '#ff9900';
        actionBtn.style.boxShadow = '0 0 4px rgba(255,153,0,0.2)';
      }

      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isUnlocked) {
          if (isEquipped) {
            this.equippedJetpack = 'none';
            this.saveProgress();
            this.audio.playReboot();
          } else {
            this.equippedJetpack = jp.id;
            this.saveProgress();
            this.audio.playJump();
          }
          this.recalculatePhysics();
          this.updateUpgradeUI();
        } else {
          if (this.coinsCollected >= jp.price) {
            this.coinsCollected -= jp.price;
            this.unlockedJetpacks.push(jp.id);
            this.equippedJetpack = jp.id;
            this.saveProgress();

            this.audio.playLevelUp();
            this.recalculatePhysics();
            this.updateUpgradeUI();
          } else {
            this.audio.playCrash();
          }
        }
      });

      btnContainer.appendChild(actionBtn);

      // If unlocked, add stability upgrade option
      if (isUnlocked) {
        const upgradeBtn = document.createElement('button');
        upgradeBtn.className = 'pwa-btn';
        upgradeBtn.style.marginTop = '0';
        upgradeBtn.style.fontSize = '0.65rem';
        upgradeBtn.style.padding = '4px 8px';

        if (upgradeLvl < 5) {
          const upgradeCost = Math.round(jp.price * 0.4) * (upgradeLvl + 1);
          upgradeBtn.textContent = `UPG CORE: ${upgradeCost} 🪙`;
          upgradeBtn.style.borderColor = '#ff9900';
          upgradeBtn.style.color = '#ff9900';
          upgradeBtn.style.boxShadow = '0 0 4px rgba(255,153,0,0.2)';

          upgradeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.coinsCollected >= upgradeCost) {
              this.coinsCollected -= upgradeCost;
              this.jetpackUpgrades[jp.id] = upgradeLvl + 1;
              this.saveProgress();
              
              this.audio.playLevelUp();
              this.recalculatePhysics();
              this.updateUpgradeUI();
            } else {
              this.audio.playCrash();
            }
          });
        } else {
          upgradeBtn.textContent = 'CORE MAX';
          upgradeBtn.style.borderColor = '#8fa0dd';
          upgradeBtn.style.color = '#8fa0dd';
          upgradeBtn.disabled = true;
          upgradeBtn.style.cursor = 'default';
          upgradeBtn.style.boxShadow = 'none';
        }
        btnContainer.appendChild(upgradeBtn);
      }

      card.appendChild(cardLeft);
      card.appendChild(btnContainer);
      container.appendChild(card);
    });
  }

  spawnSnake() {
    const minHeight = 80;
    const maxHeight = this.height - 100;
    const yPos = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    
    this.snakes.push({
      x: this.width,
      y: yPos,
      speed: this.scrollSpeed + 1.2, // Move slightly faster than scroll speed
      timeActive: 0,
      level: this.level,
      sinOffset: Math.random() * Math.PI * 2
    });
  }

  drawSnake(snake) {
    this.ctx.save();
    
    // Choose color based on level
    let color = '#33ff33'; // green for level 1
    let shadowColor = 'rgba(51, 255, 51, 0.6)';
    let numSegments = 5;
    let size = 8;
    
    if (snake.level >= 2) {
      numSegments = 6;
      size = 10;
    }
    if (snake.level >= 3) {
      numSegments = 7;
      size = 11;
    }

    const config = this.levelConfigs[Math.min(20, snake.level) - 1];
    if (config) {
      color = config.outlineColor;
      shadowColor = config.shadowColor;
    }
    
    this.ctx.shadowColor = shadowColor;
    this.ctx.shadowBlur = 10;
    
    for (let i = 0; i < numSegments; i++) {
      const segX = snake.x + i * (size * 1.5);
      let segY = snake.y;
      
      if (snake.level >= 2) {
        // Slithering wave motion
        segY = snake.y + Math.sin(this.animationTime * 0.15 - i * 0.6 + snake.sinOffset) * 12;
      }
      
      const r = size * (1 - i * 0.12); // Tapered body
      
      // Draw segment
      this.ctx.fillStyle = i === 0 ? '#ffffff' : color; // White glowing head
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 1.5;
      
      this.ctx.beginPath();
      this.ctx.arc(segX, segY, r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Draw glowing eyes on head segment
      if (i === 0) {
        this.ctx.fillStyle = '#ff0055';
        this.ctx.beginPath();
        this.ctx.arc(segX - r * 0.3, segY - r * 0.3, r * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    this.ctx.restore();
  }

  checkSnakeCollision(circle, snake) {
    let numSegments = 5;
    let size = 8;
    if (snake.level >= 2) { numSegments = 6; size = 10; }
    if (snake.level >= 3) { numSegments = 7; size = 11; }
    
    for (let i = 0; i < numSegments; i++) {
      const segX = snake.x + i * (size * 1.5);
      let segY = snake.y;
      if (snake.level >= 2) {
        segY = snake.y + Math.sin(this.animationTime * 0.15 - i * 0.6 + snake.sinOffset) * 12;
      }
      
      const r = size * (1 - i * 0.12);
      
      // Collision check between bird (circle) and segment (circle)
      const dx = circle.x - segX;
      const dy = circle.y - segY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < circle.radius + r) {
        return true;
      }
    }
    return false;
  }

  createSnakeExplosion(snake) {
    let color = '#33ff33';
    const config = this.levelConfigs[Math.min(20, snake.level) - 1];
    if (config) {
      color = config.outlineColor;
    } else {
      if (snake.level === 2) color = '#ff6600';
      if (snake.level >= 3) color = '#cc00ff';
    }
    
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      const p = new Particle(
        snake.x,
        snake.y,
        color,
        Math.random() * 3 + 1.5,
        Math.cos(angle) * speed - snake.speed, // Expand and fly leftwards
        Math.sin(angle) * speed,
        Math.random() * 15 + 10
      );
      this.particles.push(p);
    }
  }

  updateDpadVisibility() {
    const dpad = document.getElementById('dpad-container');
    if (dpad) {
      if (this.state === 'PLAYING' && !this.isPaused) {
        dpad.classList.remove('hide');
      } else {
        dpad.classList.add('hide');
      }
    }
  }

  updateGuardUI() {
    this.updateDpadVisibility();

    const btn = document.getElementById('guard-btn');
    if (!btn) return;
    
    const shouldShow = (this.state === 'PLAYING' && this.difficulty === 'NORMAL');
    if (!shouldShow) {
      if (!btn.classList.contains('hide')) {
        btn.classList.add('hide');
      }
      return;
    }
    
    if (btn.classList.contains('hide')) {
      btn.classList.remove('hide');
    }
    
    if (this.guardActive) {
      const rounded = this.guardTimer.toFixed(1);
      const text = `🛡️ ACTIVE: ${rounded}s`;
      if (btn.textContent !== text) {
        btn.textContent = text;
        btn.style.borderColor = '#00ff66';
        btn.style.color = '#00ff66';
        btn.style.background = 'rgba(0, 255, 102, 0.15)';
        btn.style.boxShadow = '0 0 10px rgba(0, 255, 102, 0.4)';
        btn.style.opacity = '1';
      }
    } else {
      const canAfford = this.coinsCollected >= 15;
      const text = `🛡️ GUARD: 15 🪙`;
      if (btn.textContent !== text) {
        btn.textContent = text;
        btn.style.borderColor = 'var(--neon-cyan)';
        btn.style.color = '#fff';
        btn.style.background = 'rgba(0, 240, 255, 0.1)';
        btn.style.boxShadow = '0 0 8px rgba(0, 240, 255, 0.2)';
      }
      const targetOpacity = canAfford ? '1' : '0.5';
      if (btn.style.opacity !== targetOpacity) {
        btn.style.opacity = targetOpacity;
      }
    }
  }

  loop(currentTime) {
    const elapsed = currentTime - this.lastTime;
    
    // Cap frame time steps to 100ms to avoid tunneling during page sleep
    let dt = Math.min(100, elapsed) / 16.666; 
    
    this.lastTime = currentTime;
    
    if (this.slowMoActive) {
      dt *= 0.6;
    }
    
    if (!this.isPaused) {
      this.update(dt);
    }
    this.draw();
    
    requestAnimationFrame((t) => this.loop(t));
  }

  loadUserData(user) {
    this.currentUser = user.username;
    this.highScore = user.highScore || 0;
    this.coinsCollected = user.coins || 0;
    this.upgradeLevel = user.upgradeLevel || 0;
    this.unlockedBirds = user.unlockedBirds || [];
    this.unlockedJetpacks = user.unlockedJetpacks || [];
    this.equippedJetpack = user.equippedJetpack || 'none';
    this.jetpackUpgrades = user.jetpackUpgrades || {};
    this.tutorialSeen = user.tutorialSeen || false;
    this.birdColor = user.birdColor || 'RED';
    this.currentUserFriends = user.friends || [];
    this.currentUserPaymentCard = user.paymentCard || null;
    this.feedCount = user.feedCount || 0;
    this.breedingEggs = user.breedingEggs || [];
    this.homeTutorialSeen = user.homeTutorialSeen || false;
    this.isPremium = user.isPremium || false;
    this.deathCount = user.deathCount || 0;
    
    // Refresh elements
    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) {
      if (this.isPremium) {
        greetingEl.innerHTML = `HELLO ${user.username} <span style="color: var(--neon-yellow); text-shadow: var(--glow-yellow);">👑</span>`;
      } else {
        greetingEl.textContent = `HELLO ${user.username}`;
      }
      greetingEl.style.display = 'block';
      const birdEl = document.getElementById('greeting-bird');
      if (birdEl) birdEl.classList.remove('hide');
    }
    
    this.bestScoreEl.textContent = this.highScore;
    const coinsEl = document.getElementById('settings-coins');
    if (coinsEl) coinsEl.textContent = `${this.coinsCollected} 🪙`;
    const liveCoinsEl = document.getElementById('live-coins');
    if (liveCoinsEl) liveCoinsEl.textContent = this.coinsCollected;
    
    // Activate correct color bubble in UI
    this.colorBubbles.forEach(b => {
      if (b.getAttribute('data-color') === this.birdColor) {
        b.classList.add('active');
        b.style.borderColor = '#ffffff';
      } else {
        b.classList.remove('active');
        b.style.borderColor = 'transparent';
      }
    });

    this.updateUpgradeUI();
  }

  saveProgress() {
    const coinsEl = document.getElementById('settings-coins');
    if (coinsEl) coinsEl.textContent = `${this.coinsCollected} 🪙`;
    const liveCoinsEl = document.getElementById('live-coins');
    if (liveCoinsEl) liveCoinsEl.textContent = this.coinsCollected;

    if (this.currentUser) {
      const userData = {
        username: this.currentUser,
        highScore: this.highScore,
        coins: this.coinsCollected,
        upgradeLevel: this.upgradeLevel,
        unlockedBirds: this.unlockedBirds,
        unlockedJetpacks: this.unlockedJetpacks,
        equippedJetpack: this.equippedJetpack,
        jetpackUpgrades: this.jetpackUpgrades,
        tutorialSeen: this.tutorialSeen,
        birdColor: this.birdColor,
        friends: this.currentUserFriends || [],
        paymentCard: this.currentUserPaymentCard || null,
        feedCount: this.feedCount || 0,
        breedingEggs: this.breedingEggs || [],
        homeTutorialSeen: this.homeTutorialSeen || false,
        isPremium: this.isPremium || false,
        deathCount: this.deathCount || 0
      };
      window.gameDB.getUser(this.currentUser).then(user => {
        if (user) {
          userData.password = user.password;
          window.gameDB.saveUser(userData);
        }
      });
    } else {
      localStorage.setItem('neon_flappy_high_score', this.highScore);
      localStorage.setItem('neon_flappy_coins', this.coinsCollected);
      localStorage.setItem('neon_flappy_upgrade_level', this.upgradeLevel);
      localStorage.setItem('neon_flappy_unlocked_birds', JSON.stringify(this.unlockedBirds));
      localStorage.setItem('neon_flappy_unlocked_jetpacks', JSON.stringify(this.unlockedJetpacks));
      localStorage.setItem('neon_flappy_equipped_jetpack', this.equippedJetpack);
      localStorage.setItem('neon_flappy_jetpack_upgrades', JSON.stringify(this.jetpackUpgrades));
      localStorage.setItem('neon_flappy_tutorial_seen', this.tutorialSeen ? 'true' : 'false');
      localStorage.setItem('neon_flappy_bird_color', this.birdColor);
      localStorage.setItem('neon_flappy_friends', JSON.stringify(this.currentUserFriends || []));
      localStorage.setItem('neon_flappy_payment_card', JSON.stringify(this.currentUserPaymentCard || null));
      localStorage.setItem('neon_flappy_feed_count', this.feedCount);
      localStorage.setItem('neon_flappy_breeding_eggs', JSON.stringify(this.breedingEggs));
      localStorage.setItem('neon_flappy_home_tut_seen', this.homeTutorialSeen ? 'true' : 'false');
      localStorage.setItem('neon_flappy_is_premium', this.isPremium ? 'true' : 'false');
      localStorage.setItem('neon_flappy_death_count', this.deathCount);
    }
  }

  showTutorial() {
    this.activeTutorialMode = 'MAIN';
    this.tutorialStep = 0;
    this.isPaused = true;
    const overlay = document.getElementById('tutorial-overlay');
    const bubbleContainer = document.getElementById('tutorial-bubble-container');
    if (overlay) overlay.classList.remove('hide');
    if (bubbleContainer) bubbleContainer.classList.remove('hide');
    this.updateTutorialStep();
  }

  updateTutorialStep() {
    const textEl = document.getElementById('tutorial-text');
    const prevBtn = document.getElementById('tutorial-prev');
    const nextBtn = document.getElementById('tutorial-next');
    const container = document.getElementById('tutorial-bubble-container');
    
    const dpad = document.getElementById('dpad-container');
    const startSettingsBtn = document.getElementById('start-settings-btn');
    const diffRow = document.getElementById('tutorial-diff-row');
    const slowmoRow = document.getElementById('tutorial-slowmo-row');

    // Clear previous highlights
    if (dpad) dpad.classList.remove('emboss-highlight');
    if (startSettingsBtn) startSettingsBtn.classList.remove('emboss-highlight');
    if (diffRow) diffRow.classList.remove('emboss-highlight');
    if (slowmoRow) slowmoRow.classList.remove('emboss-highlight');

    // Reset settings active tutorial styling
    if (this.settingsOverlay) {
      this.settingsOverlay.classList.remove('tutorial-active');
    }

    // Dynamic layout transitions per step
    if (this.tutorialStep === 0) {
      // Step 0: Flight Controls
      this.hideOverlay(this.settingsOverlay);
      if (dpad) {
        dpad.classList.remove('hide');
        dpad.classList.add('emboss-highlight');
      }
      if (container) {
        container.style.top = 'auto';
        container.style.bottom = '145px';
      }
    } else if (this.tutorialStep === 1) {
      // Step 1: Settings Config button
      if (dpad) dpad.classList.add('hide');
      this.hideOverlay(this.settingsOverlay);
      if (startSettingsBtn) {
        startSettingsBtn.classList.add('emboss-highlight');
      }
      if (container) {
        container.style.bottom = 'auto';
        container.style.top = '190px';
      }
    } else if (this.tutorialStep === 2) {
      // Step 2: Difficulty Selector
      if (dpad) dpad.classList.add('hide');
      this.showOverlay(this.settingsOverlay);
      if (this.settingsOverlay) {
        this.settingsOverlay.classList.add('tutorial-active');
      }
      if (diffRow) {
        diffRow.classList.add('emboss-highlight');
      }
      if (container) {
        container.style.bottom = 'auto';
        container.style.top = '35px';
      }
    } else if (this.tutorialStep === 3) {
      // Step 3: Chrono Slow-Mo
      if (dpad) dpad.classList.add('hide');
      this.showOverlay(this.settingsOverlay);
      if (this.settingsOverlay) {
        this.settingsOverlay.classList.add('tutorial-active');
      }
      if (slowmoRow) {
        slowmoRow.classList.add('emboss-highlight');
      }
      if (container) {
        container.style.bottom = 'auto';
        container.style.top = '130px';
      }
    }

    if (textEl) {
      textEl.textContent = this.tutorialSteps[this.tutorialLang][this.tutorialStep];
    }
    
    if (prevBtn) {
      if (this.tutorialStep === 0) {
        prevBtn.classList.add('hide');
      } else {
        prevBtn.classList.remove('hide');
      }
    }
    
    if (nextBtn) {
      if (this.tutorialStep === this.tutorialSteps[this.tutorialLang].length - 1) {
        nextBtn.textContent = 'FINISH';
      } else {
        nextBtn.textContent = 'NEXT';
      }
    }
  }
  nextTutorialStep() {
    if (this.activeTutorialMode === 'LOGIN') {
      this.closeLoginTutorial();
      return;
    }
    if (this.activeTutorialMode === 'HOME') {
      this.nextHomeTutorialStep();
      return;
    }
    if (this.tutorialStep < this.tutorialSteps[this.tutorialLang].length - 1) {
      this.tutorialStep++;
      this.updateTutorialStep();
    } else {
      this.closeTutorial();
    }
  }

  prevTutorialStep() {
    if (this.activeTutorialMode === 'LOGIN') {
      return;
    }
    if (this.activeTutorialMode === 'HOME') {
      this.prevHomeTutorialStep();
      return;
    }
    if (this.tutorialStep > 0) {
      this.tutorialStep--;
      this.updateTutorialStep();
    }
  }

  closeTutorial() {
    if (this.activeTutorialMode === 'LOGIN') {
      this.closeLoginTutorial();
      return;
    }
    if (this.activeTutorialMode === 'HOME') {
      this.closeHomeTutorial();
      return;
    }
    this.tutorialSeen = true;
    this.isPaused = false;    
    const dpad = document.getElementById('dpad-container');
    const startSettingsBtn = document.getElementById('start-settings-btn');
    const diffRow = document.getElementById('tutorial-diff-row');
    const slowmoRow = document.getElementById('tutorial-slowmo-row');
    
    // Clear all highlights
    if (dpad) {
      dpad.classList.remove('emboss-highlight');
      dpad.classList.add('hide'); // Hide until playing starts
    }
    if (startSettingsBtn) startSettingsBtn.classList.remove('emboss-highlight');
    if (diffRow) diffRow.classList.remove('emboss-highlight');
    if (slowmoRow) slowmoRow.classList.remove('emboss-highlight');

    // Close overlays
    this.hideOverlay(this.settingsOverlay);
    if (this.settingsOverlay) {
      this.settingsOverlay.classList.remove('tutorial-active');
    }
    
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) {
      overlay.classList.add('hide');
    }
    
    const bubbleContainer = document.getElementById('tutorial-bubble-container');
    if (bubbleContainer) {
      bubbleContainer.classList.add('hide');
    }
    
    this.saveProgress();
  }

  startHomeTutorial() {
    this.activeTutorialMode = 'HOME';
    this.homeTutorialStep = 0;
    
    const homeOverlay = document.getElementById('home-overlay');
    if (homeOverlay) homeOverlay.classList.add('tutorial-active');

    const homeTutOverlay = document.getElementById('home-tutorial-overlay');
    if (homeTutOverlay) homeTutOverlay.classList.remove('hide');
    
    const bubbleContainer = document.getElementById('tutorial-bubble-container');
    if (bubbleContainer) bubbleContainer.classList.remove('hide');
    
    const tutLangSelect = document.getElementById('tutorial-lang-select');
    if (tutLangSelect) {
      tutLangSelect.value = this.tutorialLang;
    }
    
    this.highlightedHomeElements = [];
    this.updateHomeTutorialStep();
  }

  updateHomeTutorialStep() {
    this.clearHomeHighlights();
    
    const container = document.getElementById('tutorial-bubble-container');
    const textEl = document.getElementById('tutorial-text');
    const prevBtn = document.getElementById('tutorial-prev');
    const nextBtn = document.getElementById('tutorial-next');
    
    if (!container) return;
    
    const steps = this.homeTutorialSteps[this.tutorialLang] || this.homeTutorialSteps['EN'];
    const currentStepText = steps[this.homeTutorialStep];
    
    if (textEl) textEl.textContent = currentStepText;
    
    if (prevBtn) {
      if (this.homeTutorialStep === 0) {
        prevBtn.classList.add('hide');
      } else {
        prevBtn.classList.remove('hide');
      }
    }
    
    if (nextBtn) {
      if (this.homeTutorialStep === steps.length - 1) {
        nextBtn.textContent = 'FINISH';
      } else {
        nextBtn.textContent = 'NEXT';
      }
    }
    
    if (this.homeTutorialStep === 0) {
      const roost = document.getElementById('home-aviary-roost');
      if (roost) {
        this.highlightHomeElement(roost, 'yellow');
      }
      container.style.top = '175px';
      container.style.bottom = 'auto';
    } else if (this.homeTutorialStep === 1) {
      const tabBtn = document.querySelector('.home-tab-btn[data-tab="tab-home-inv"]');
      if (tabBtn) tabBtn.click();
      
      const invList = document.getElementById('home-inventory-list');
      const invTabBtn = document.querySelector('.home-tab-btn[data-tab="tab-home-inv"]');
      if (invTabBtn) this.highlightHomeElement(invTabBtn, 'cyan');
      if (invList) this.highlightHomeElement(invList, 'cyan');
      
      container.style.top = 'auto';
      container.style.bottom = '10px';
    } else if (this.homeTutorialStep === 2) {
      const tabBtn = document.querySelector('.home-tab-btn[data-tab="tab-home-breed"]');
      if (tabBtn) tabBtn.click();
      
      const breedTabContent = document.getElementById('tab-home-breed');
      const breedTabBtn = document.querySelector('.home-tab-btn[data-tab="tab-home-breed"]');
      if (breedTabBtn) this.highlightHomeElement(breedTabBtn, 'pink');
      if (breedTabContent) this.highlightHomeElement(breedTabContent, 'pink');
      
      container.style.top = 'auto';
      container.style.bottom = '10px';
    } else if (this.homeTutorialStep === 3) {
      const tabBtn = document.querySelector('.home-tab-btn[data-tab="tab-home-nursery"]');
      if (tabBtn) tabBtn.click();
      
      const nurseryTabContent = document.getElementById('tab-home-nursery');
      const nurseryTabBtn = document.querySelector('.home-tab-btn[data-tab="tab-home-nursery"]');
      const feedTabBtn = document.querySelector('.home-tab-btn[data-tab="tab-home-feed"]');
      if (nurseryTabBtn) this.highlightHomeElement(nurseryTabBtn, 'yellow');
      if (feedTabBtn) this.highlightHomeElement(feedTabBtn, 'yellow');
      if (nurseryTabContent) this.highlightHomeElement(nurseryTabContent, 'yellow');
      
      container.style.top = 'auto';
      container.style.bottom = '10px';
    }
  }

  nextHomeTutorialStep() {
    const steps = this.homeTutorialSteps[this.tutorialLang] || this.homeTutorialSteps['EN'];
    if (this.homeTutorialStep < steps.length - 1) {
      this.homeTutorialStep++;
      this.updateHomeTutorialStep();
    } else {
      this.closeHomeTutorial();
    }
  }

  prevHomeTutorialStep() {
    if (this.homeTutorialStep > 0) {
      this.homeTutorialStep--;
      this.updateHomeTutorialStep();
    }
  }

  closeHomeTutorial() {
    this.homeTutorialSeen = true;
    this.clearHomeHighlights();
    
    const homeOverlay = document.getElementById('home-overlay');
    if (homeOverlay) homeOverlay.classList.remove('tutorial-active');

    const homeTutOverlay = document.getElementById('home-tutorial-overlay');
    if (homeTutOverlay) homeTutOverlay.classList.add('hide');
    
    const bubbleContainer = document.getElementById('tutorial-bubble-container');
    if (bubbleContainer) bubbleContainer.classList.add('hide');
    
    this.activeTutorialMode = 'MAIN';
    
    localStorage.setItem('neon_flappy_home_tut_seen', 'true');
    this.saveProgress();
    
    const invTabBtn = document.querySelector('.home-tab-btn[data-tab="tab-home-inv"]');
    if (invTabBtn) invTabBtn.click();
  }

  highlightHomeElement(el, color = 'cyan') {
    if (!el) return;
    el.style.position = 'relative';
    el.style.zIndex = '48';
    const shadowColor = color === 'yellow' ? 'rgba(255, 234, 0, 0.8)' : (color === 'pink' ? 'rgba(255, 0, 127, 0.8)' : 'rgba(0, 240, 255, 0.8)');
    const hexColor = color === 'yellow' ? 'var(--neon-yellow)' : (color === 'pink' ? 'var(--neon-pink)' : 'var(--neon-cyan)');
    el.style.boxShadow = `0 0 0 3px ${hexColor}, 0 0 15px ${shadowColor}`;
    el.style.borderRadius = '8px';
    if (!this.highlightedHomeElements) {
      this.highlightedHomeElements = [];
    }
    this.highlightedHomeElements.push(el);
  }

  clearHomeHighlights() {
    if (this.highlightedHomeElements) {
      this.highlightedHomeElements.forEach(el => {
        el.style.position = '';
        el.style.zIndex = '';
        el.style.boxShadow = '';
        el.style.borderRadius = '';
      });
    }
    this.highlightedHomeElements = [];
  }

  startLoginTutorial() {
    this.activeTutorialMode = 'LOGIN';
    this.loginTutorialStep = 0;
    
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) loginOverlay.classList.add('tutorial-active');

    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.classList.remove('hide');
    
    const bubbleContainer = document.getElementById('tutorial-bubble-container');
    if (bubbleContainer) bubbleContainer.classList.remove('hide');
    
    const tutLangSelect = document.getElementById('tutorial-lang-select');
    if (tutLangSelect) {
      tutLangSelect.value = this.tutorialLang;
    }
    
    this.highlightedLoginElements = [];
    this.updateLoginTutorialStep();
  }

  updateLoginTutorialStep() {
    this.clearLoginHighlights();
    
    const container = document.getElementById('tutorial-bubble-container');
    const textEl = document.getElementById('tutorial-text');
    const prevBtn = document.getElementById('tutorial-prev');
    const nextBtn = document.getElementById('tutorial-next');
    
    if (!container) return;
    
    const steps = this.loginTutorialSteps[this.tutorialLang] || this.loginTutorialSteps['EN'];
    const currentStepText = steps[this.loginTutorialStep];
    
    if (textEl) textEl.textContent = currentStepText;
    
    if (prevBtn) {
      prevBtn.classList.add('hide');
    }
    
    if (nextBtn) {
      nextBtn.textContent = 'OK';
    }
    
    const loginBox = document.querySelector('#login-overlay .stats-box');
    const loginBtn = document.getElementById('login-btn');
    const guestBtn = document.getElementById('guest-btn');
    
    if (loginBox) this.highlightLoginElement(loginBox, 'cyan');
    if (loginBtn) this.highlightLoginElement(loginBtn, 'pink');
    if (guestBtn) this.highlightLoginElement(guestBtn, 'cyan');
    
    container.style.top = '100px';
    container.style.bottom = 'auto';
  }

  closeLoginTutorial() {
    this.loginTutorialSeen = true;
    this.clearLoginHighlights();
    
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) loginOverlay.classList.remove('tutorial-active');

    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.classList.add('hide');
    
    const bubbleContainer = document.getElementById('tutorial-bubble-container');
    if (bubbleContainer) bubbleContainer.classList.add('hide');
    
    this.activeTutorialMode = 'MAIN';
    
    localStorage.setItem('neon_flappy_login_tut_seen', 'true');
  }

  highlightLoginElement(el, color = 'cyan') {
    if (!el) return;
    el.style.position = 'relative';
    el.style.zIndex = '48';
    const shadowColor = color === 'yellow' ? 'rgba(255, 234, 0, 0.8)' : (color === 'pink' ? 'rgba(255, 0, 127, 0.8)' : 'rgba(0, 240, 255, 0.8)');
    const hexColor = color === 'yellow' ? 'var(--neon-yellow)' : (color === 'pink' ? 'var(--neon-pink)' : 'var(--neon-cyan)');
    el.style.boxShadow = `0 0 0 3px ${hexColor}, 0 0 15px ${shadowColor}`;
    el.style.borderRadius = '8px';
    if (!this.highlightedLoginElements) {
      this.highlightedLoginElements = [];
    }
    this.highlightedLoginElements.push(el);
  }

  clearLoginHighlights() {
    if (this.highlightedLoginElements) {
      this.highlightedLoginElements.forEach(el => {
        el.style.position = '';
        el.style.zIndex = '';
        el.style.boxShadow = '';
        el.style.borderRadius = '';
      });
    }
    this.highlightedLoginElements = [];
  }

  updateParentPreview(selectId, previewId) {
    const selectEl = document.getElementById(selectId);
    const previewEl = document.getElementById(previewId);
    if (!selectEl || !previewEl) return;
    const val = selectEl.value;
    if (!val) {
      previewEl.innerHTML = '<span style="font-size: 1.2rem;">❓</span>';
      previewEl.style.borderColor = selectId.includes('a') ? 'rgba(0,240,255,0.3)' : 'rgba(255,0,127,0.3)';
      previewEl.style.background = 'rgba(0,0,0,0.3)';
      return;
    }
    previewEl.innerHTML = this.getBirdSvg(val, 32);
    
    let color = '#fff';
    if (val === 'RED') color = '#ff3333';
    else if (val === 'CYAN') color = '#00f0ff';
    else if (val === 'YELLOW') color = '#ffea00';
    else if (val === 'PINK') color = '#ff007f';
    else if (val === 'EAGLE') color = '#cc9966';
    else if (val === 'CANARY') color = '#ccff33';
    else if (val === 'PHOENIX') color = '#990033';
    else if (val === 'CHICK') color = '#ffff00';
    
    previewEl.style.borderColor = color;
    previewEl.style.background = 'rgba(255,255,255,0.05)';
  }

  getBirdSvg(birdColor, size = 36) {
    const delay = (birdColor.charCodeAt(0) % 10) * 0.1;
    const styleBlock = `
      <style>
        @keyframes roostFlap-${birdColor} {
          0% { transform: rotate(-20deg); }
          100% { transform: rotate(20deg); }
        }
        .roost-wing-${birdColor} {
          animation: roostFlap-${birdColor} 0.35s ease-in-out infinite alternate;
          animation-delay: -${delay}s;
          transform-origin: 12px 17px;
        }
        .roost-body-glow-${birdColor} {
          filter: drop-shadow(0 0 3px var(--glow-color, rgba(0, 240, 255, 0.5)));
        }
      </style>
    `;

    let content = '';

    if (birdColor === 'RED') {
      content = `
        <!-- Feet -->
        <path d="M 12 26 L 12 29 M 15 26 L 15 29 M 21 26 L 21 29 M 24 26 L 24 29" stroke="#ff9900" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Body -->
        <circle cx="18" cy="17" r="9" fill="url(#redBodyGrad)" class="roost-body-glow-RED"/>
        <!-- Wing -->
        <path d="M 14 17 C 9 17, 7 21, 12 23 C 15 23, 15 17, 14 17 Z" fill="url(#redWingGrad)" class="roost-wing-RED"/>
        <!-- Beak -->
        <path d="M 25 14 L 31 17 L 25 20 Z" fill="#ffaa00"/>
        <!-- Eye -->
        <circle cx="21" cy="13" r="2.5" fill="#ffffff"/>
        <circle cx="22" cy="13" r="1.2" fill="#000000"/>
        <circle cx="22.5" cy="12.2" r="0.5" fill="#ffffff"/>
        
        <defs>
          <radialGradient id="redBodyGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ff6666"/>
            <stop offset="60%" stop-color="#ff0000"/>
            <stop offset="100%" stop-color="#800000"/>
          </radialGradient>
          <linearGradient id="redWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#990000"/>
            <stop offset="100%" stop-color="#ff3333"/>
          </linearGradient>
        </defs>
      `;
    } else if (birdColor === 'CYAN') {
      content = `
        <!-- Tail -->
        <path d="M 12 21 L 6 28 C 5 29, 3 29, 4 27 L 9 21 Z" fill="#00f0ff"/>
        <path d="M 10 22 L 4 30 C 3 31, 2 30, 3 29 L 8 22 Z" fill="#ff007f"/>
        <!-- Feet -->
        <path d="M 14 26 L 14 29 M 18 26 L 18 29" stroke="#ff3366" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Body -->
        <circle cx="16" cy="17" r="9" fill="url(#parrotBodyGrad)" class="roost-body-glow-CYAN"/>
        <!-- Crest -->
        <path d="M 12 9 L 10 3 L 13 6 L 15 2 L 16 8 Z" fill="#00ff66"/>
        <!-- Face Mask -->
        <path d="M 16 9 C 21 9, 23 12, 23 17 C 21 18, 17 18, 16 17 Z" fill="url(#parrotFaceGrad)"/>
        <!-- Beak -->
        <path d="M 23 13 C 27 13, 29 16, 26 21 C 24 21, 23 18, 23 13 Z" fill="url(#parrotBeakGrad)"/>
        <!-- Eye -->
        <circle cx="19" cy="13" r="2.5" fill="#ffffff"/>
        <circle cx="20" cy="13" r="1.5" fill="#00f0ff"/>
        <circle cx="20.5" cy="12.5" r="0.7" fill="#000000"/>
        <circle cx="19.5" cy="12" r="0.5" fill="#ffffff"/>
        <!-- Wing -->
        <path d="M 13 17 C 9 17, 7 21, 11 23 C 14 23, 14 17, 13 17 Z" fill="url(#parrotWingGrad)" class="roost-wing-CYAN"/>
        
        <defs>
          <radialGradient id="parrotBodyGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#66ff99"/>
            <stop offset="70%" stop-color="#00ff66"/>
            <stop offset="100%" stop-color="#006622"/>
          </radialGradient>
          <linearGradient id="parrotFaceGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffea00"/>
            <stop offset="100%" stop-color="#ffaa00"/>
          </linearGradient>
          <radialGradient id="parrotBeakGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ff66b2"/>
            <stop offset="70%" stop-color="#ff007f"/>
            <stop offset="100%" stop-color="#99004d"/>
          </radialGradient>
          <linearGradient id="parrotWingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00f0ff"/>
            <stop offset="100%" stop-color="#0055ff"/>
          </linearGradient>
        </defs>
      `;
    } else if (birdColor === 'YELLOW') {
      content = `
        <!-- Feet -->
        <path d="M 12 26 L 12 29 M 18 26 L 18 29" stroke="#ff6600" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Body -->
        <path d="M 16 8 C 22 8, 24 21, 16 25 C 8 21, 10 8, 16 8 Z" fill="url(#yellowBodyGrad)" class="roost-body-glow-YELLOW"/>
        <!-- Beak -->
        <path d="M 22 15 L 28 18 L 22 21 Z" fill="#ff6600"/>
        <!-- Eye -->
        <circle cx="18" cy="14" r="2.5" fill="#ffffff"/>
        <circle cx="19" cy="14" r="1.2" fill="#000000"/>
        <circle cx="19.5" cy="13.2" r="0.5" fill="#ffffff"/>
        <!-- Wing -->
        <path d="M 13 18 C 9 18, 8 21, 12 23 C 14 23, 14 18, 13 18 Z" fill="url(#yellowWingGrad)" class="roost-wing-YELLOW"/>
        
        <defs>
          <radialGradient id="yellowBodyGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ffff99"/>
            <stop offset="70%" stop-color="#ffea00"/>
            <stop offset="100%" stop-color="#b38600"/>
          </radialGradient>
          <linearGradient id="yellowWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#cc9900"/>
            <stop offset="100%" stop-color="#ffea00"/>
          </linearGradient>
        </defs>
      `;
    } else if (birdColor === 'PINK') {
      content = `
        <!-- Feet -->
        <path d="M 12 26 L 12 29 M 18 26 L 18 29" stroke="#ff00aa" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Body -->
        <circle cx="16" cy="17" r="9" fill="url(#pinkBodyGrad)" class="roost-body-glow-PINK"/>
        <!-- Beak -->
        <path d="M 23 15 L 29 18 L 23 21 Z" fill="#ffea00"/>
        <!-- Eye -->
        <circle cx="18" cy="13" r="2.5" fill="#ffffff"/>
        <circle cx="19" cy="13" r="1.2" fill="#000000"/>
        <circle cx="19.5" cy="12.2" r="0.5" fill="#ffffff"/>
        <!-- Wing -->
        <path d="M 13 17 C 9 17, 8 21, 12 23 C 14 23, 14 17, 13 17 Z" fill="url(#pinkWingGrad)" class="roost-wing-PINK"/>
        
        <defs>
          <radialGradient id="pinkBodyGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ff99cc"/>
            <stop offset="70%" stop-color="#ff007f"/>
            <stop offset="100%" stop-color="#99004c"/>
          </radialGradient>
          <linearGradient id="pinkWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#800040"/>
            <stop offset="100%" stop-color="#ff3399"/>
          </linearGradient>
        </defs>
      `;
    } else if (birdColor === 'EAGLE') {
      content = `
        <!-- Feet -->
        <path d="M 12 26 L 12 29 M 18 26 L 18 29" stroke="#ffcc00" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Body -->
        <circle cx="16" cy="18" r="9" fill="url(#eagleBodyGrad)" class="roost-body-glow-EAGLE"/>
        <!-- Head Hood -->
        <path d="M 11 12 C 11 8, 14 7, 18 8 C 22 8, 24 11, 24 17 C 20 17, 13 17, 11 12 Z" fill="#ffffff"/>
        <!-- Beak -->
        <path d="M 23 13 C 26 13, 29 15, 27 19 L 23 17 Z" fill="#ffcc00"/>
        <!-- Eye -->
        <circle cx="18" cy="12" r="2" fill="#000000"/>
        <path d="M 16 10 L 20 11.5" stroke="#000" stroke-width="1" stroke-linecap="round"/>
        <!-- Wing -->
        <path d="M 13 18 C 9 18, 8 22, 12 24 C 14 24, 14 18, 13 18 Z" fill="url(#eagleWingGrad)" class="roost-wing-EAGLE"/>
        
        <defs>
          <radialGradient id="eagleBodyGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#cc9966"/>
            <stop offset="70%" stop-color="#8a5c2e"/>
            <stop offset="100%" stop-color="#4d3319"/>
          </radialGradient>
          <linearGradient id="eagleWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4d3319"/>
            <stop offset="100%" stop-color="#a37547"/>
          </linearGradient>
        </defs>
      `;
    } else if (birdColor === 'CANARY') {
      content = `
        <!-- Feet -->
        <path d="M 12 26 L 12 29 M 18 26 L 18 29" stroke="#ff9900" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Body -->
        <circle cx="16" cy="17" r="9" fill="url(#canaryBodyGrad)" class="roost-body-glow-CANARY"/>
        <!-- Beak -->
        <path d="M 23 15 L 28 18 L 23 20 Z" fill="#ff9900"/>
        <!-- Eye -->
        <circle cx="18" cy="13" r="2.5" fill="#ffffff"/>
        <circle cx="19" cy="13" r="1.2" fill="#000000"/>
        <!-- Wing -->
        <path d="M 13 17 C 9 17, 8 21, 12 23 C 14 23, 14 17, 13 17 Z" fill="url(#canaryWingGrad)" class="roost-wing-CANARY"/>
        
        <defs>
          <radialGradient id="canaryBodyGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#e6ff80"/>
            <stop offset="70%" stop-color="#ccff33"/>
            <stop offset="100%" stop-color="#739900"/>
          </radialGradient>
          <linearGradient id="canaryWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#739900"/>
            <stop offset="100%" stop-color="#d9ff66"/>
          </linearGradient>
        </defs>
      `;
    } else if (birdColor === 'PHOENIX') {
      content = `
        <!-- Tail -->
        <path d="M 11 20 L 5 28 C 4 29, 2 28, 4 26 L 9 20 Z" fill="#ff3300"/>
        <path d="M 9 21 L 3 30 C 2 31, 1 30, 2 28 L 7 21 Z" fill="#ffcc00"/>
        <!-- Feet -->
        <path d="M 13 26 L 13 29 M 17 26 L 17 29" stroke="#ff3300" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Crest -->
        <path d="M 13 9 Q 8 2 5 5 Q 10 7 12 9 Z" fill="#ff3300"/>
        <path d="M 14 8 Q 10 0 7 2 Q 12 5 13 8 Z" fill="#ffcc00"/>
        <!-- Body -->
        <circle cx="16" cy="17" r="9" fill="url(#phoenixBodyGrad)" class="roost-body-glow-PHOENIX"/>
        <!-- Beak -->
        <path d="M 23 15 L 29 18 L 23 21 Z" fill="#ff3300"/>
        <!-- Eye -->
        <circle cx="18" cy="13" r="2.2" fill="#ffcc00"/>
        <circle cx="19" cy="13" r="1" fill="#000000"/>
        <!-- Wing -->
        <path d="M 13 17 C 9 17, 7 21, 11 23 C 14 23, 14 17, 13 17 Z" fill="url(#phoenixWingGrad)" class="roost-wing-PHOENIX"/>
        
        <defs>
          <radialGradient id="phoenixBodyGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ff0066"/>
            <stop offset="70%" stop-color="#990033"/>
            <stop offset="100%" stop-color="#4d001a"/>
          </radialGradient>
          <linearGradient id="phoenixWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ff3300"/>
            <stop offset="100%" stop-color="#ffcc00"/>
          </linearGradient>
        </defs>
      `;
    } else if (birdColor === 'CHICK') {
      content = `
        <!-- Feet -->
        <path d="M 13 25 L 13 28 M 17 25 L 17 28" stroke="#ff9900" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Body -->
        <circle cx="16" cy="17" r="8.5" fill="url(#chickBodyGrad)" class="roost-body-glow-CHICK"/>
        <!-- Blushing Cheeks -->
        <circle cx="18" cy="19" r="1.5" fill="#ff66b2" opacity="0.7"/>
        <!-- Beak -->
        <path d="M 22 16 L 27 18.5 L 22 21 Z" fill="#ffaa00"/>
        <!-- Eye -->
        <circle cx="17.5" cy="14" r="2.5" fill="#ffffff"/>
        <circle cx="18.5" cy="14" r="1.2" fill="#000000"/>
        <circle cx="19" cy="13.2" r="0.5" fill="#ffffff"/>
        <!-- Eggshell Helmet -->
        <path d="M 7.5 13.5 C 7.5 6, 24.5 6, 24.5 13.5 L 21.5 13.5 L 19 10 L 16.5 13.5 L 14 10 L 11 13.5 Z" fill="#e6ffff" stroke="#00f0ff" stroke-width="1.5" class="roost-body-glow-CHICK"/>
        <path d="M 12 7 L 14 11 M 17 7 L 15 10 M 20 8 L 19 12" stroke="#00f0ff" stroke-width="0.8"/>
        <!-- Wing -->
        <path d="M 13 18 C 10 18, 9 21, 12 23 C 14 23, 14 18, 13 18 Z" fill="url(#chickWingGrad)" class="roost-wing-CHICK"/>
        
        <defs>
          <radialGradient id="chickBodyGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ffff99"/>
            <stop offset="70%" stop-color="#ffff00"/>
            <stop offset="100%" stop-color="#e6b800"/>
          </radialGradient>
          <linearGradient id="chickWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffcc00"/>
            <stop offset="100%" stop-color="#ffff33"/>
          </linearGradient>
        </defs>
      `;
    } else if (birdColor === 'WINGS') {
      content = `
        <!-- Feet -->
        <path d="M 12 26 L 12 29 M 18 26 L 18 29" stroke="#00aacc" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Back Wing -->
        <path d="M 10 17 C 5 17, 3 20, 8 22 C 11 22, 11 17, 10 17 Z" fill="#0088cc" stroke="#00f0ff" stroke-width="1"/>
        <!-- Body -->
        <circle cx="16" cy="17" r="9" fill="url(#wingsBodyGrad)" class="roost-body-glow-WINGS"/>
        <!-- Beak -->
        <path d="M 23 15 L 29 18 L 23 20 Z" fill="#ffaa00"/>
        <!-- Eye -->
        <circle cx="18" cy="13" r="2.5" fill="#ffffff"/>
        <circle cx="19" cy="13" r="1.2" fill="#000000"/>
        <!-- Front Wing -->
        <path d="M 13 17 C 8 17, 6 21, 11 23 C 14 23, 14 17, 13 17 Z" fill="url(#wingsWingGrad)" class="roost-wing-WINGS"/>
        
        <defs>
          <radialGradient id="wingsBodyGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#e6ffff"/>
            <stop offset="60%" stop-color="#00ffff"/>
            <stop offset="100%" stop-color="#008899"/>
          </radialGradient>
          <linearGradient id="wingsWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="50%" stop-color="#00ffff"/>
            <stop offset="100%" stop-color="#005588"/>
          </linearGradient>
        </defs>
      `;
    } else if (birdColor === 'HAWK') {
      content = `
        <!-- Feet -->
        <path d="M 12 26 L 12 29 M 18 26 L 18 29" stroke="#ff3300" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Crest Spikes -->
        <path d="M 13 9 L 6 3 L 10 7 L 4 5 L 9 10 Z" fill="#ff3300"/>
        <!-- Body -->
        <circle cx="16" cy="17" r="9" fill="url(#hawkBodyGrad)" class="roost-body-glow-HAWK"/>
        <!-- Hooked Beak -->
        <path d="M 23 13 C 27 13, 29 15, 27 19 L 23 17 Z" fill="#ffea00"/>
        <!-- Eye -->
        <circle cx="18" cy="13" r="2.2" fill="#ffffff"/>
        <circle cx="19" cy="13" r="1" fill="#000000"/>
        <path d="M 15 10 L 20 11.5" stroke="#000" stroke-width="1.5"/>
        <!-- Wing -->
        <path d="M 13 17 C 9 17, 7 21, 11 23 C 14 23, 14 17, 13 17 Z" fill="url(#hawkWingGrad)" class="roost-wing-HAWK"/>
        
        <defs>
          <radialGradient id="hawkBodyGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ffcc00"/>
            <stop offset="60%" stop-color="#ff5500"/>
            <stop offset="100%" stop-color="#801a00"/>
          </radialGradient>
          <linearGradient id="hawkWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffea00"/>
            <stop offset="100%" stop-color="#ff3300"/>
          </linearGradient>
        </defs>
      `;
    } else if (birdColor === 'COORDINATOR') {
      content = `
        <!-- Feet -->
        <path d="M 12 26 L 12 29 M 18 26 L 18 29" stroke="#000c33" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Body -->
        <circle cx="16" cy="17" r="9" fill="url(#coordBodyGrad)" class="roost-body-glow-COORDINATOR"/>
        <!-- Holographic Visor -->
        <path d="M 14 11 C 14 10, 23 10, 23 14 C 21 16, 15 16, 14 14 Z" fill="rgba(0, 240, 255, 0.75)" stroke="#00f0ff" stroke-width="1" class="roost-body-glow-COORDINATOR"/>
        <!-- Cyber Beak -->
        <path d="M 23 15 L 28 17.5 L 23 20 Z" fill="#666677"/>
        <!-- Wing -->
        <path d="M 13 17 C 9 17, 7 21, 11 23 C 14 23, 14 17, 13 17 Z" fill="url(#coordWingGrad)" class="roost-wing-COORDINATOR"/>
        
        <defs>
          <radialGradient id="coordBodyGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#80c0ff"/>
            <stop offset="60%" stop-color="#3366ff"/>
            <stop offset="100%" stop-color="#001a66"/>
          </radialGradient>
          <linearGradient id="coordWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#001a66"/>
            <stop offset="100%" stop-color="#00f0ff"/>
          </linearGradient>
        </defs>
      `;
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="display: block; overflow: visible;">
        ${styleBlock}
        ${content}
      </svg>
    `;
  }

  loadAdminUsersList() {
    window.gameDB.open().then(() => {
      window.gameDB.getAllUsers().then(users => {
        const countEl = document.getElementById('admin-user-count');
        if (countEl) countEl.textContent = `ACCOUNTS: ${users.length}`;
        
        const listEl = document.getElementById('admin-users-list');
        if (!listEl) return;
        listEl.innerHTML = '';
        
        users.forEach(user => {
          const card = document.createElement('div');
          card.className = 'admin-user-card';
          
          const meta = document.createElement('div');
          meta.className = 'user-meta';
          
          const nameSpan = document.createElement('span');
          nameSpan.className = 'admin-user-name';
          nameSpan.textContent = user.username;
          
          const scoreSpan = document.createElement('span');
          scoreSpan.className = 'admin-user-scores';
          scoreSpan.textContent = `Score: ${user.highScore || 0} | Coins: ${user.coins || 0}`;
          
          meta.appendChild(nameSpan);
          meta.appendChild(scoreSpan);
          
          const actions = document.createElement('div');
          actions.className = 'admin-user-actions';
          
          const addCoinsBtn = document.createElement('button');
          addCoinsBtn.className = 'admin-action-btn';
          addCoinsBtn.textContent = '+100 🪙';
          addCoinsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            user.coins = (user.coins || 0) + 100;
            window.gameDB.saveUser(user).then(() => {
              this.audio.playLevelUp();
              scoreSpan.textContent = `Score: ${user.highScore || 0} | Coins: ${user.coins || 0}`;
              if (this.currentUser === user.username) {
                this.coinsCollected = user.coins;
                this.saveProgress();
              }
            });
          });
          
          const unlockSkinsBtn = document.createElement('button');
          unlockSkinsBtn.className = 'admin-action-btn';
          unlockSkinsBtn.textContent = '🔑 SKINS';
          unlockSkinsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            user.unlockedBirds = ['EAGLE', 'CANARY', 'PHOENIX'];
            user.unlockedJetpacks = this.jetpacks.map(j => j.id);
            window.gameDB.saveUser(user).then(() => {
              this.audio.playLevelUp();
              if (this.currentUser === user.username) {
                this.unlockedBirds = user.unlockedBirds;
                this.unlockedJetpacks = user.unlockedJetpacks;
                this.saveProgress();
                this.updateUpgradeUI();
              }
            });
          });
          
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'admin-action-btn delete';
          deleteBtn.textContent = 'DEL';
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Delete user ${user.username}?`)) {
              window.gameDB.deleteUser(user.username).then(() => {
                this.audio.playReboot();
                card.remove();
                
                const remaining = listEl.children.length;
                if (countEl) countEl.textContent = `ACCOUNTS: ${remaining}`;
                
                if (this.currentUser === user.username) {
                  this.currentUser = null;
                  location.reload();
                }
              });
            }
          });
          
          actions.appendChild(addCoinsBtn);
          actions.appendChild(unlockSkinsBtn);
          actions.appendChild(deleteBtn);
          
          card.appendChild(meta);
          card.appendChild(actions);
          listEl.appendChild(card);
        });
      });
    });
  }

  updateAdminDbUI() {
    const statusEl = document.getElementById('admin-db-status');
    const setupForm = document.getElementById('firebase-setup-form');
    const activeInfo = document.getElementById('firebase-active-info');
    const projectIdEl = document.getElementById('admin-db-project-id');
    const configInput = document.getElementById('firebase-config-input');
    const dbError = document.getElementById('admin-db-error');
    
    if (dbError) {
      dbError.textContent = '';
      dbError.style.color = 'var(--neon-pink)';
    }
    
    if (window.gameDB.useFirestore && window.gameDB.firestoreConfig) {
      if (statusEl) {
        statusEl.textContent = 'CLOUD FIRESTORE (CONNECTED)';
        statusEl.style.color = '#00ff66';
        statusEl.style.textShadow = '0 0 5px rgba(0, 255, 102, 0.5)';
      }
      if (setupForm) setupForm.classList.add('hide');
      if (activeInfo) activeInfo.classList.remove('hide');
      if (projectIdEl) projectIdEl.textContent = window.gameDB.firestoreConfig.projectId || '-';
    } else {
      if (statusEl) {
        statusEl.textContent = 'LOCAL INDEXEDDB';
        statusEl.style.color = '#ff007f';
        statusEl.style.textShadow = 'var(--glow-pink)';
      }
      if (setupForm) setupForm.classList.remove('hide');
      if (activeInfo) activeInfo.classList.add('hide');
      if (configInput) configInput.value = '';
    }
  }

  initAccountOverlay() {
    const guestBlock = document.getElementById('account-guest-block');
    const authView = document.getElementById('account-auth-view');
    
    if (guestBlock) guestBlock.classList.add('hide');
    if (authView) authView.classList.remove('hide');
    
    // Reset tabs to default active (Vault)
    const accountTabBtns = document.querySelectorAll('.account-tab-btn');
    const accountTabContents = document.querySelectorAll('.account-tab-content');
    accountTabBtns.forEach(b => b.classList.remove('active'));
    if (accountTabBtns[0]) accountTabBtns[0].classList.add('active');
    accountTabContents.forEach(c => c.classList.add('hide'));
    const vaultTab = document.getElementById('tab-vault');
    if (vaultTab) vaultTab.classList.remove('hide');
    
    this.renderProfileDetails();
    this.renderFriendsList();
    this.renderPaymentDetails();
  }

  renderProfileDetails() {
    const usernameEl = document.getElementById('vault-username');
    const highscoreEl = document.getElementById('vault-highscore');
    const coinsEl = document.getElementById('vault-coins');
    const engineEl = document.getElementById('vault-engine');
    const equipmentListEl = document.getElementById('vault-equipment-list');
    
    if (usernameEl) usernameEl.textContent = this.currentUser || 'GUEST';
    if (highscoreEl) highscoreEl.textContent = this.highScore;
    if (coinsEl) coinsEl.textContent = `${this.coinsCollected} 🪙`;
    if (engineEl) engineEl.textContent = `LVL ${this.upgradeLevel}`;
    
    if (equipmentListEl) {
      equipmentListEl.innerHTML = '';
      
      let defaultSkinItem = document.createElement('div');
      defaultSkinItem.style.display = 'flex';
      defaultSkinItem.style.justifyContent = 'space-between';
      defaultSkinItem.innerHTML = `<span style="color: #fff;">RED WING CORE</span><span style="color: var(--neon-cyan);">ACTIVE</span>`;
      equipmentListEl.appendChild(defaultSkinItem);
      
      this.unlockedBirds.forEach(bird => {
        let item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.innerHTML = `<span style="color: #8fa0dd;">🐦 ${bird} MODULE</span><span style="color: var(--neon-yellow);">OWNED</span>`;
        equipmentListEl.appendChild(item);
      });
      
      this.unlockedJetpacks.forEach(jetpack => {
        let item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        
        let equipped = this.equippedJetpack === jetpack ? '<span style="color: var(--neon-cyan);">EQUIPPED</span>' : '<span style="color: var(--neon-yellow);">OWNED</span>';
        item.innerHTML = `<span style="color: #8fa0dd;">🚀 ${jetpack.toUpperCase()} THRUSTER</span>${equipped}`;
        equipmentListEl.appendChild(item);
      });
    }
  }

  renderFriendsList() {
    const friendsListEl = document.getElementById('friends-list');
    if (!friendsListEl) return;
    
    friendsListEl.innerHTML = '';
    
    if (!this.currentUserFriends || this.currentUserFriends.length === 0) {
      friendsListEl.innerHTML = '<div style="font-size: 0.65rem; color: #6a7bb0; text-align: center; padding: 15px 0;">NO CONNECTIONS LOADED</div>';
      return;
    }
    
    this.currentUserFriends.forEach(friend => {
      const card = document.createElement('div');
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';
      card.style.background = 'rgba(255,255,255,0.02)';
      card.style.border = '1px solid rgba(255,255,255,0.05)';
      card.style.borderRadius = '8px';
      card.style.padding = '6px 10px';
      card.style.fontSize = '0.7rem';
      card.style.fontFamily = 'var(--font-arcade)';
      
      window.gameDB.open().then(() => {
        window.gameDB.getUser(friend).then(user => {
          const status = user ? '<span style="color: #00ff66;">ONLINE</span>' : '<span style="color: #ff3333; opacity: 0.7;">OFFLINE</span>';
          const score = user ? `BEST: ${user.highScore}` : 'SYS SYNCING';
          
          card.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span style="color: #fff;">${friend}</span>
              <span style="font-size: 0.55rem; color: #8fa0dd;">${score} • ${status}</span>
            </div>
            <button class="remove-friend-btn" data-username="${friend}" style="background: transparent; border: none; color: var(--neon-pink); cursor: pointer; font-size: 0.8rem; padding: 4px;">❌</button>
          `;
          
          const deleteBtn = card.querySelector('.remove-friend-btn');
          if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              this.audio.playReboot();
              this.currentUserFriends = this.currentUserFriends.filter(f => f !== friend);
              this.saveProgress();
              this.renderFriendsList();
            });
          }
        });
      });
      
      friendsListEl.appendChild(card);
    });
  }

  renderPaymentDetails() {
    const holderInput = document.getElementById('card-holder-input');
    const numberInput = document.getElementById('card-number-input');
    const expiryInput = document.getElementById('card-expiry-input');
    const cvvInput = document.getElementById('card-cvv-input');
    
    const previewHolder = document.getElementById('card-preview-holder');
    const previewNumber = document.getElementById('card-preview-number');
    const previewExpiry = document.getElementById('card-preview-expiry');
    const cardError = document.getElementById('card-error-msg');
    
    if (cardError) cardError.textContent = '';
    
    if (this.currentUserPaymentCard) {
      const card = this.currentUserPaymentCard;
      if (holderInput) holderInput.value = card.holder || '';
      if (numberInput) {
        let val = card.number || '';
        let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
        numberInput.value = formatted;
      }
      if (expiryInput) expiryInput.value = card.expiry || '';
      if (cvvInput) cvvInput.value = card.cvv || '';
      
      if (previewHolder) previewHolder.textContent = card.holder || 'CARDHOLDER NAME';
      if (previewNumber) {
        let val = card.number || '';
        let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
        previewNumber.textContent = formatted || '•••• •••• •••• ••••';
      }
      if (previewExpiry) previewExpiry.textContent = card.expiry || 'MM/YY';
    } else {
      if (holderInput) holderInput.value = '';
      if (numberInput) numberInput.value = '';
      if (expiryInput) expiryInput.value = '';
      if (cvvInput) cvvInput.value = '';
      
      if (previewHolder) previewHolder.textContent = 'CARDHOLDER NAME';
      if (previewNumber) previewNumber.textContent = '•••• •••• •••• ••••';
      if (previewExpiry) previewExpiry.textContent = 'MM/YY';
    }
  }

  getLocalizedStoreItems() {
    const lang = this.tutorialLang || 'SI';
    return [
      {
        id: 'COINS_5K',
        price: '$0.99',
        name: {
          EN: '5000 Coins Pack',
          SI: 'කොයින් 5000 පැක් එක',
          ZH: '5000金币包',
          JA: '5000コインパック'
        }[lang] || '5000 Coins Pack',
        desc: {
          EN: 'Instantly add 5000 🪙 to your balance.',
          SI: 'ඔබගේ ගිණුමට කොයින් 5000ක් 🪙 එකතු කරන්න.',
          ZH: '立即为您的账户增加5000金币 🪙。',
          JA: 'アカウントに5000コイン 🪙 を即座に追加します。'
        }[lang] || 'Instantly add 5000 🪙 to your balance.',
        type: 'coins',
        amount: 5000
      },
      {
        id: 'COINS_10K',
        price: '$1.49',
        name: {
          EN: '10000 Coins Pack',
          SI: 'කොයින් 10000 පැක් එක',
          ZH: '10000金币包',
          JA: '10000コインパック'
        }[lang] || '10000 Coins Pack',
        desc: {
          EN: 'Supercharge your balance with 10000 🪙.',
          SI: 'ඔබගේ ගිණුම කොයින් 10000කින් 🪙 පුරවන්න.',
          ZH: '让您的账户充值10000金币 🪙。',
          JA: 'アカウントを10000コイン 🪙 で満たします。'
        }[lang] || 'Supercharge your balance with 10000 🪙.',
        type: 'coins',
        amount: 10000
      },
      {
        id: 'HEARTS_10',
        price: '$0.99',
        name: {
          EN: '10 Hearts Pack',
          SI: 'ලයිෆ් 10 පැක් එක',
          ZH: '10心心包',
          JA: '10ハートパック'
        }[lang] || '10 Hearts Pack',
        desc: {
          EN: 'Get 10 extra ❤️ lives for continues.',
          SI: 'ගේම් එක දිගටම ක්‍රීඩා කිරීමට අමතර ජීවිත ❤️ 10ක් ලබා ගන්න.',
          ZH: '获取额外的10个 ❤️ 生命值以便继续游戏。',
          JA: 'コンティニュー用に予備の ❤️ ライフを10個獲得します。'
        }[lang] || 'Get 10 extra ❤️ lives for continues.',
        type: 'hearts',
        amount: 10
      },
      {
        id: 'SKIN_WINGS',
        price: '$0.99',
        name: {
          EN: 'Cyber Wings Skin',
          SI: 'සයිබර් වින්ග්ස් ස්කින්',
          ZH: '赛博机翼外观',
          JA: 'サイバーウィングスキン'
        }[lang] || 'Cyber Wings Skin',
        desc: {
          EN: 'Unlock the glowing Cyber Wings skin.',
          SI: 'දීප්තිමත් සයිබර් පියාපත් සහිත ස්කින් එක ලබා ගන්න.',
          ZH: '解锁发光的赛博机翼皮肤。',
          JA: '光るサイバーウィングのスキンをアンロックします。'
        }[lang] || 'Unlock the glowing Cyber Wings skin.',
        type: 'skin',
        skinId: 'WINGS'
      },
      {
        id: 'PREMIUM_LICENSE',
        price: '$2.99',
        name: {
          EN: 'Premium Coordinator License',
          SI: 'ප්‍රීමියම් කොඕඩිනේටර් බලපත්‍රය',
          ZH: '高级协调员许可证',
          JA: 'プレミアムコーディネーターライセンス'
        }[lang] || 'Premium Coordinator License',
        desc: {
          EN: 'Become a Premium Coordinator: Ad-free experience, Cyber Coordinator skin, +1000 🪙 jackpot!',
          SI: 'Premium Coordinator කෙනෙක් වන්න: දැන්වීම් රහිත අත්දැකීමක්, Coordinator ස්කින් එක සහ +1000 🪙 ජැක්පොට්!',
          ZH: '成为高级协调员：无广告体验，赛博协调员皮肤，以及 +1000 🪙 奖励！',
          JA: 'プレミアムコーディネーターになる：広告なし、サイバーコーディネータースキン、+1000 🪙 ジャックポット！'
        }[lang] || 'Become a Premium Coordinator: Ad-free experience, Cyber Coordinator skin, +1000 🪙 jackpot!',
        type: 'premium'
      }
    ];
  }

  updateStoreUI() {
    const storeListings = document.getElementById('store-listings');
    if (!storeListings) return;
    
    const items = this.getLocalizedStoreItems();
    let html = '';
    
    const ownedTexts = {
      EN: 'OWNED',
      SI: 'හිමි කරගෙන ඇත',
      ZH: '已拥有',
      JA: '所有済み'
    };
    const ownedText = ownedTexts[this.tutorialLang] || 'OWNED';
    
    items.forEach(item => {
      let isOwned = false;
      if (item.id === 'SKIN_WINGS' && this.unlockedBirds.includes('WINGS')) {
        isOwned = true;
      } else if (item.id === 'PREMIUM_LICENSE' && this.isPremium) {
        isOwned = true;
      }
      
      html += `
        <div class="store-item" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px;">
          <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px;">
            <span style="font-family: var(--font-arcade); font-size: 0.68rem; color: #fff;">${item.name}</span>
            <span style="font-family: var(--font-main); font-size: 0.58rem; color: #8fa0dd; line-height: 1.3;">${item.desc}</span>
          </div>
          <button class="store-buy-btn pwa-btn" data-item-id="${item.id}" style="margin-top: 0; padding: 6px 12px; font-size: 0.65rem; border-color: ${isOwned ? '#555566' : 'var(--neon-pink)'}; color: ${isOwned ? '#8888aa' : 'var(--neon-pink)'}; min-width: 75px; text-align: center; cursor: ${isOwned ? 'default' : 'pointer'};" ${isOwned ? 'disabled' : ''}>
            ${isOwned ? ownedText : item.price}
          </button>
        </div>
      `;
    });
    
    storeListings.innerHTML = html;
    
    const buyBtns = storeListings.querySelectorAll('.store-buy-btn');
    buyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.getAttribute('data-item-id');
        const selectedItem = items.find(item => item.id === itemId);
        if (selectedItem) {
          this.processStorePurchase(selectedItem);
        }
      });
    });
  }

  processStorePurchase(item) {
    if (!this.currentUserPaymentCard) {
      const errMsgs = {
        EN: 'ADD PAYMENT METHOD IN CARD TAB FIRST!',
        SI: 'පළමුව කාඩ්පත් ටැබ් එකෙහි ගෙවීම් පතක් එක් කරන්න!',
        ZH: '请先在卡片标签页中添加付款方式！',
        JA: '先にカードタブで支払い方法を追加してください！'
      };
      
      const annOverlay = document.getElementById('announcement-overlay');
      const annTitle = document.getElementById('announcement-title');
      const annMsg = document.getElementById('announcement-message');
      if (annOverlay && annTitle && annMsg) {
        annTitle.textContent = { EN: 'PAYMENT REQUIRED', SI: 'ගෙවීම් අවශ්‍යයි', ZH: '需要付款方式', JA: '支払い方法が必要です' }[this.tutorialLang] || 'PAYMENT REQUIRED';
        annTitle.style.color = 'var(--neon-pink)';
        annTitle.style.textShadow = 'var(--glow-pink)';
        annMsg.textContent = errMsgs[this.tutorialLang] || errMsgs.EN;
        this.audio.playCrash();
        this.showOverlay(annOverlay);
      }
      return;
    }
    
    const processingOverlay = document.getElementById('store-processing-overlay');
    const processingBar = document.getElementById('store-processing-bar');
    const processingTitle = document.getElementById('store-processing-title');
    if (processingOverlay && processingBar && processingTitle) {
      const procTitles = {
        EN: 'PROCESSING TRANSACTION...',
        SI: 'ගනුදෙනුව සැකසෙමින් පවතී...',
        ZH: '正在处理交易...',
        JA: '取引を処理中...'
      };
      processingTitle.textContent = procTitles[this.tutorialLang] || procTitles.EN;
      
      processingOverlay.classList.remove('hide');
      processingBar.style.width = '0%';
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        processingBar.style.width = `${progress}%`;
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            processingOverlay.classList.add('hide');
            this.completeStorePurchase(item);
          }, 200);
        }
      }, 150);
    }
  }

  completeStorePurchase(item) {
    this.audio.playLevelUp();
    
    let successMsg = '';
    const lang = this.tutorialLang || 'SI';
    
    if (item.type === 'coins') {
      this.coinsCollected += item.amount;
      successMsg = {
        EN: `SUCCESS!\n\nAdded ${item.amount} 🪙 to your balance.`,
        SI: `සාර්ථකයි!\n\nකොයින් ${item.amount}ක් 🪙 ඔබේ ගිණුමට එකතු කරන ලදී.`,
        ZH: `交易成功！\n\n已向您的账户添加了 ${item.amount} 🪙。`,
        JA: `成功！\n\nアカウントに ${item.amount} 🪙 を追加しました。`
      }[lang];
    } else if (item.type === 'hearts') {
      this.hearts += item.amount;
      successMsg = {
        EN: `SUCCESS!\n\nAdded ${item.amount} ❤️ lives to your balance.`,
        SI: `සාර්ථකයි!\n\nලයිෆ් ${item.amount}ක් ❤️ ඔබේ ගිණුමට එකතු කරන ලදී.`,
        ZH: `交易成功！\n\n已向您的账户添加了 ${item.amount} ❤️ 生命。`,
        JA: `成功！\n\nアカウントに ${item.amount} ❤️ ライフを追加しました。`
      }[lang];
    } else if (item.type === 'skin') {
      if (!this.unlockedBirds.includes(item.skinId)) {
        this.unlockedBirds.push(item.skinId);
      }
      successMsg = {
        EN: `SUCCESS!\n\nCyber Wings skin has been unlocked. Equip it in Bird Home.`,
        SI: `සාර්ථකයි!\n\nCyber Wings ස්කින් එක දැන් විවෘතයි. Bird Home වෙත ගොස් එය equip කරන්න.`,
        ZH: `交易成功！\n\n赛博机翼外观已解锁。可在小鸟家园中装备。`,
        JA: `成功！\n\nサイバーウィングスキンがアンロックされました。鳥のホームで装備できます。`
      }[lang];
    } else if (item.type === 'premium') {
      this.isPremium = true;
      if (!this.unlockedBirds.includes('COORDINATOR')) {
        this.unlockedBirds.push('COORDINATOR');
      }
      this.coinsCollected += 1000;
      
      successMsg = {
        EN: `PREMIUM ACTIVE!\n\nCongratulations! You are now a Premium Coordinator.\n\n- Ad-free active\n- Cyber Coordinator skin unlocked\n- +1000 🪙 bonus claimed!`,
        SI: `ප්‍රීමියම් සක්‍රීයයි!\n\nසුභ පැතුම්! ඔබ දැන් Premium Coordinator කෙනෙකි.\n\n- දැන්වීම් රහිත සේවාව ක්‍රියාත්මකයි\n- Cyber Coordinator ස්කින් එක විවෘතයි\n- කොයින් 1000ක 🪙 බෝනස් එකක් ලැබුණි!`,
        ZH: `高级会员已激活！\n\n恭喜！您现在是高级协调员。\n\n- 无广告体验开启\n- 赛博协调员皮肤解锁\n- 领到了 +1000 🪙 奖励！`,
        JA: `プレミアム有効！\n\nおめでとうございます！プレミアムコーディネーターになりました。\n\n- 広告なしが有効\n- サイバーコーディネータースキンがアンロック\n- +1000 🪙 ボーナスを獲得しました！`
      }[lang];
    }
    
    this.saveProgress();
    this.updateStoreUI();
    this.updateHomeUI();
    this.renderProfileDetails();
    
    const coinsEl = document.getElementById('settings-coins');
    if (coinsEl) coinsEl.textContent = `${this.coinsCollected} 🪙`;
    
    const annOverlay = document.getElementById('announcement-overlay');
    const annTitle = document.getElementById('announcement-title');
    const annMsg = document.getElementById('announcement-message');
    if (annOverlay && annTitle && annMsg) {
      annTitle.textContent = {
        EN: 'TRANSACTION COMPLETE',
        SI: 'ගනුදෙනුව සම්පූර්ණයි',
        ZH: '交易已完成',
        JA: '取引完了'
      }[lang] || 'TRANSACTION COMPLETE';
      annTitle.style.color = '#00ff66';
      annTitle.style.textShadow = '0 0 10px rgba(0, 255, 102, 0.5)';
      annMsg.textContent = successMsg;
      this.isPaused = true;
      this.showOverlay(annOverlay);
    }
  }

  showInterstitialAd(callback) {
    const modal = document.getElementById('ad-interstitial-modal');
    const closeBtn = document.getElementById('ad-interstitial-close');
    if (!modal || !closeBtn) {
      if (callback) callback();
      return;
    }
    
    this.isPaused = true;
    this.showOverlay(modal);
    
    let countdown = 3;
    closeBtn.disabled = true;
    
    const skipTexts = {
      EN: 'Skip Ad in ',
      SI: 'දැන්වීම මඟහරින්න ',
      ZH: '跳过广告 ',
      JA: '広告をスキップ '
    };
    const skipText = skipTexts[this.tutorialLang] || skipTexts.EN;
    
    closeBtn.textContent = `${skipText}${countdown}s...`;
    
    const interval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        closeBtn.textContent = `${skipText}${countdown}s...`;
      } else {
        clearInterval(interval);
        closeBtn.disabled = false;
        closeBtn.textContent = {
          EN: 'SKIP AD',
          SI: 'දැන්වීම මඟහරින්න',
          ZH: '跳过广告',
          JA: '広告をスキップ'
        }[this.tutorialLang] || 'SKIP AD';
        closeBtn.style.borderColor = 'var(--neon-cyan)';
        closeBtn.style.color = '#fff';
        closeBtn.style.boxShadow = 'var(--glow-cyan)';
      }
    }, 1000);
    
    const handleClose = (e) => {
      e.stopPropagation();
      this.audio.playJump();
      this.hideOverlay(modal);
      this.isPaused = false;
      closeBtn.removeEventListener('click', handleClose);
      
      closeBtn.style.borderColor = '#888';
      closeBtn.style.color = '#888';
      closeBtn.style.boxShadow = 'none';
      
      if (callback) callback();
    };
    
    closeBtn.addEventListener('click', handleClose);
  }

  showRewardedAd(rewardType, callback) {
    const modal = document.getElementById('ad-rewarded-modal');
    const skipBtn = document.getElementById('ad-rewarded-skip');
    const timerEl = document.getElementById('ad-rewarded-timer');
    const progressEl = document.getElementById('ad-rewarded-progress');
    
    if (!modal || !skipBtn || !timerEl || !progressEl) {
      if (callback) callback();
      return;
    }
    
    this.isPaused = true;
    this.showOverlay(modal);
    
    skipBtn.disabled = true;
    progressEl.style.width = '0%';
    
    const timerTexts = {
      EN: 'REWARD IN: ',
      SI: 'ත්‍යාගය ලැබීමට: ',
      ZH: '奖励将在：',
      JA: '報酬まで：'
    };
    const timerText = timerTexts[this.tutorialLang] || timerTexts.EN;
    
    let countdown = 5;
    timerEl.textContent = `${timerText}${countdown}s`;
    
    let elapsed = 0;
    const duration = 5000;
    const tick = 50;
    
    const progressInterval = setInterval(() => {
      elapsed += tick;
      const pct = Math.min(100, (elapsed / duration) * 100);
      progressEl.style.width = `${pct}%`;
      
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      timerEl.textContent = `${timerText}${remaining}s`;
      
      if (elapsed >= duration) {
        clearInterval(progressInterval);
        
        timerEl.textContent = {
          EN: 'REWARD UNLOCKED!',
          SI: 'ත්‍යාගය විවෘතයි!',
          ZH: '奖励已解锁！',
          JA: '報酬を獲得しました！'
        }[this.tutorialLang] || 'REWARD UNLOCKED!';
        
        skipBtn.disabled = false;
        skipBtn.textContent = {
          EN: 'CLAIM REWARD',
          SI: 'ත්‍යාගය ලබා ගන්න',
          ZH: '领取奖励',
          JA: '報酬を受け取る'
        }[this.tutorialLang] || 'CLAIM REWARD';
        
        skipBtn.style.borderColor = '#00ff66';
        skipBtn.style.color = '#fff';
        skipBtn.style.boxShadow = '0 0 10px rgba(0, 255, 102, 0.4)';
      }
    }, tick);
    
    const handleClaim = (e) => {
      e.stopPropagation();
      this.audio.playLevelUp();
      this.hideOverlay(modal);
      this.isPaused = false;
      skipBtn.removeEventListener('click', handleClaim);
      
      skipBtn.style.borderColor = 'var(--neon-pink)';
      skipBtn.style.color = 'var(--neon-pink)';
      skipBtn.style.boxShadow = 'none';
      skipBtn.textContent = {
        EN: 'SKIP VIDEO',
        SI: 'මඟහරින්න',
        ZH: '跳过视频',
        JA: 'ビデオをスキップ'
      }[this.tutorialLang] || 'SKIP VIDEO';
      
      if (callback) callback();
    };
    
    skipBtn.addEventListener('click', handleClaim);
  }

  rebootGameFree() {
    this.hideOverlay(this.continueOverlay);
    this.isPaused = false;
    this.updateDpadVisibility();
    
    this.pipes = this.pipes.filter(p => p.x > this.bird.x + 160 || p.x + p.width < this.bird.x - 50);
    this.coins = this.coins.filter(c => c.x > this.bird.x + 160 || c.x < this.bird.x - 50);
    
    this.bird.velocity = -4.5;
    this.bird.angle = -0.25;
    
    this.invincibleTimer = 120;
    this.audio.playReboot();
  }
}

// Initialize the game once the document is loaded
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
