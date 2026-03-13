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
    }

    create() {
        GameState.load();
        this.drawMap();

        this.scene.launch('UIScene');

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

        this.events.on('hero_escaped', (gold) => {
            GameState.gold = Math.max(0, GameState.gold - gold);
            GameState.save();
            this.updateUI();
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
        // To be implemented in next step, but called here for consistency
        this.events.emit('ui_update');
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
            if (this.enemiesSpawnedInWave < this.maxEnemiesPerWave) {
                if (time > this.nextWaveTime) {
                    this.spawnHero();
                    this.nextWaveTime = time + 2000; // 2 seconds between spawns in wave
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

        const hero = new Hero(this, PATH_POINTS, {
            speed: 120,
            hp: Math.round(50 * hpMultiplier),
            gold: Math.round(15 * goldMultiplier),
            texture: 'hero_knight'
        });
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
