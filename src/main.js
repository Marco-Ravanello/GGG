import { MAP_CONFIG, PATH_POINTS, getWorldPos } from './map.js';
import { Hero } from './entities.js';
import { Tower } from './towers.js';
import { GameState } from './state.js';
import { UIScene } from './ui.js';
import { Invasor } from './invasor.js';
import { ASSETS } from './assets_urls.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.enemies = [];
        this.towers = [];
        this.invasors = [];
        this.nextWaveTime = 0;
        this.nextInvasorTime = 5000;

        // Wave management
        this.enemiesSpawnedInWave = 0;
        this.maxEnemiesPerWave = 10;
        this.isWaveActive = false;
        this.waveWaitTimer = 0;
    }

    preload() {
        this.load.image('tile_grass', ASSETS.tile_grass);
        this.load.image('tile_path', ASSETS.tile_path);
        this.load.image('hero_knight', ASSETS.hero_knight);
        this.load.image('tower_slime', ASSETS.tower_slime);
        this.load.image('invasor', ASSETS.invasor);
        this.load.image('tavern_bg', ASSETS.tavern_bg);
        this.load.image('icon_bed', ASSETS.icon_bed);
        this.load.image('icon_sword', ASSETS.icon_sword);
        this.load.image('icon_coin', ASSETS.icon_coin);
        this.load.image('icon_soul', ASSETS.icon_soul);
    }

    create() {
        const offlineGold = GameState.load();
        this.drawMap();

        this.scene.launch('UIScene', { offlineGold });

        // Groups
        this.enemyGroup = this.add.group();
        this.towerGroup = this.add.group();

        // Event listeners
        this.events.on('hero_defeated', (gold) => {
            GameState.gold += gold;
            GameState.souls += 1;
            GameState.save();
            this.updateUI();
        });

        this.events.on('boss_defeated', (data) => {
            GameState.souls += data.souls;
            GameState.save();
            this.updateUI();
            this.showFloatingText(data.x, data.y, `+${data.souls} ALMAS`, '#9b59b6');
        });

        this.events.on('hero_escaped', () => {
            const loss = Math.floor(GameState.gold * 0.05);
            GameState.gold = Math.max(0, GameState.gold - loss);
            GameState.save();
            this.updateUI();
            this.showFloatingText(360, 100, `¡ROBADO! -${loss} Oro`, '#ff0000');
        });

        this.events.on('boss_escaped', () => {
            // Reset current wave
            this.enemiesSpawnedInWave = 0;
            this.isWaveActive = false;
            this.waveWaitTimer = 2000;
            this.showFloatingText(360, 640, "EL JEFE ESCAPÓ\nREINICIANDO OLEADA", '#ff0000');
        });

        // Input: Place tower on click (Draft)
        this.input.on('pointerdown', (pointer) => {
            this.placeTower(pointer.x, pointer.y);
        });

        // Mouse move for placement preview
        this.input.on('pointermove', (pointer) => {
            if (this.isPlacingTower && this.placementPreview) {
                this.placementPreview.x = pointer.x;
                this.placementPreview.y = pointer.y;
            }
        });
    }

    startPlacement(type) {
        this.events.emit('placement_started');
        if (this.placementPreview) this.placementPreview.destroy();
        this.isPlacingTower = true;
        this.pendingMonsterType = type;

        const texture = 'tower_slime';
        this.placementPreview = this.add.sprite(0, 0, texture).setAlpha(0.6).setDepth(200);
        if (type === 'red_monster') this.placementPreview.setTint(0xff0000);
    }

    drawMap() {
        // Draw background tiles
        for (let r = 0; r < MAP_CONFIG.rows; r++) {
            for (let c = 0; c < MAP_CONFIG.cols; c++) {
                const pos = getWorldPos(c, r);
                const tile = this.add.image(pos.x, pos.y, 'tile_grass');
                tile.setDisplaySize(64, 64);
                tile.setTint(0x442200); // Darker wood for tavern feel
            }
        }

        // Draw path tiles
        PATH_POINTS.forEach(p => {
            const pos = getWorldPos(p.x, p.y);
            this.add.image(pos.x, pos.y, 'tile_path');
        });
    }

    placeTower(x, y) {
        // Only place if shop interaction is active (to be added in UI step)
        if (!this.isPlacingTower) return;

        const col = Math.floor((x - MAP_CONFIG.offsetX) / MAP_CONFIG.tileWidth);
        const row = Math.floor(y / MAP_CONFIG.tileHeight);

        if (col < 0 || col >= MAP_CONFIG.cols || row < 0 || row >= MAP_CONFIG.rows) return;

        const isOnPath = PATH_POINTS.some(p => p.x === col && p.y === row);
        if (isOnPath) return;

        const isOccupied = this.towers.some(t => {
            const tCol = Math.floor((t.x - MAP_CONFIG.offsetX) / MAP_CONFIG.tileWidth);
            const tRow = Math.floor(t.y / MAP_CONFIG.tileHeight);
            return tCol === col && tRow === row;
        });
        if (isOccupied) return;

        const pos = getWorldPos(col, row);

        const towerData = this.pendingMonsterType === 'slime' ? {
            type: 'slime',
            texture: 'tower_slime',
            damage: 15,
            range: 150,
            fireRate: 800
        } : {
            type: 'red_monster',
            texture: 'tower_slime',
            damage: 40,
            range: 250,
            fireRate: 1500,
            tint: 0xff0000
        };

        const tower = new Tower(this, pos.x, pos.y, towerData);
        this.towers.push(tower);

        this.isPlacingTower = false;
        if (this.placementPreview) {
            this.placementPreview.destroy();
            this.placementPreview = null;
        }
        this.events.emit('placement_finished');
    }

    updateUI() {
        this.events.emit('ui_update');
    }

    showFloatingText(x, y, message, color) {
        const txt = this.add.text(x, y, message, {
            fontSize: '32px',
            fill: color,
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(300);

        this.tweens.add({
            targets: txt,
            y: y - 100,
            alpha: 0,
            duration: 2000,
            onComplete: () => txt.destroy()
        });
    }

    update(time, delta) {
        // Wave logic
        if (!this.isWaveActive) {
            if (this.waveWaitTimer > 0) {
                this.waveWaitTimer -= delta;
            } else {
                this.startNewWave();
            }
        } else {
            const isBossWave = GameState.wave % 10 === 0;
            const maxEnemies = isBossWave ? 1 : 10;

            if (this.enemiesSpawnedInWave < maxEnemies) {
                if (time > this.nextWaveTime) {
                    this.spawnHero();
                    this.nextWaveTime = time + 2000;
                }
            } else if (this.enemies.length === 0) {
                this.endWave();
            }
        }

        // Spawn Invasores
        if (time > this.nextInvasorTime) {
            this.spawnInvasor();
            this.nextInvasorTime = time + Phaser.Math.Between(10000, 20000);
        }

        // Update and Clean Invasores
        this.invasors = this.invasors.filter(inv => {
            if (inv.active) {
                inv.update(time, delta);
                return true;
            }
            return false;
        });

        // Update and Clean enemies
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.active) {
                enemy.update(time, delta);
                return true;
            }
            return false;
        });

        // Update towers
        this.towers.forEach(tower => {
            tower.update(time, delta, this.enemies);
        });

        // Passive Gold Generation (Every 2 seconds)
        if (!this.lastPassiveGoldTime) this.lastPassiveGoldTime = time;
        if (time - this.lastPassiveGoldTime >= 2000) {
            GameState.gold += GameState.passiveGoldRate;
            this.updateUI();
            this.lastPassiveGoldTime = time;
            GameState.save();
        }
    }

    startNewWave() {
        this.isWaveActive = true;
        this.enemiesSpawnedInWave = 0;
        this.events.emit('ui_update');
    }

    endWave() {
        this.isWaveActive = false;
        GameState.wave++;
        GameState.save();
        this.waveWaitTimer = 3000; // 3 second pause
        this.events.emit('ui_update');
    }

    spawnHero() {
        const hpMultiplier = Math.pow(1.15, GameState.wave - 1);
        const goldMultiplier = Math.pow(1.10, GameState.wave - 1);
        const isBossWave = GameState.wave % 10 === 0;

        const config = isBossWave ? {
            speed: 60,
            hp: Math.round(50 * hpMultiplier) * 5,
            souls: 50,
            isBoss: true,
            texture: 'hero_knight'
        } : {
            speed: 120,
            hp: Math.round(50 * hpMultiplier),
            gold: Math.round(15 * goldMultiplier),
            texture: 'hero_knight'
        };

        const hero = new Hero(this, PATH_POINTS, config);
        this.enemies.push(hero);
        this.enemiesSpawnedInWave++;
    }

    spawnInvasor() {
        const inv = new Invasor(this);
        this.invasors.push(inv);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 720,
    height: 1280,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [GameScene, UIScene]
};

const game = new Phaser.Game(config);
