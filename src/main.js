import { createBaseAssets } from './assets.js';
import { MAP_CONFIG, PATH_POINTS, getWorldPos } from './map.js';
import { Hero } from './entities.js';
import { Tower } from './towers.js';
import { GameState } from './state.js';
import { UIScene } from './ui.js';
import { Invasor } from './invasor.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.enemies = [];
        this.towers = [];
        this.invasors = [];
        this.nextWaveTime = 0;
        this.nextInvasorTime = 5000;
    }

    preload() {
        // Assets are generated procedurally in create
    }

    create() {
        GameState.load();
        createBaseAssets(this);
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
    }

    drawMap() {
        // Draw background tiles
        for (let r = 0; r < MAP_CONFIG.rows; r++) {
            for (let c = 0; c < MAP_CONFIG.cols; c++) {
                const pos = getWorldPos(c, r);
                this.add.image(pos.x, pos.y, 'tile_grass');
            }
        }

        // Draw path tiles
        PATH_POINTS.forEach(p => {
            const pos = getWorldPos(p.x, p.y);
            this.add.image(pos.x, pos.y, 'tile_path');
        });
    }

    placeTower(x, y) {
        const col = Math.floor((x - MAP_CONFIG.offsetX) / MAP_CONFIG.tileWidth);
        const row = Math.floor(y / MAP_CONFIG.tileHeight);

        // Boundaries check
        if (col < 0 || col >= MAP_CONFIG.cols || row < 0 || row >= MAP_CONFIG.rows) return;

        const isOnPath = PATH_POINTS.some(p => p.x === col && p.y === row);
        if (isOnPath) return;

        // Check if tower already exists at this location
        const isOccupied = this.towers.some(t => {
            const tCol = Math.floor((t.x - MAP_CONFIG.offsetX) / MAP_CONFIG.tileWidth);
            const tRow = Math.floor(t.y / MAP_CONFIG.tileHeight);
            return tCol === col && tRow === row;
        });
        if (isOccupied) return;

        const pos = getWorldPos(col, row);

        if (GameState.gold >= 50) {
            const tower = new Tower(this, pos.x, pos.y, {
                type: 'slime',
                texture: 'tower_slime',
                damage: 15,
                range: 150,
                fireRate: 800
            });
            this.towers.push(tower);
            GameState.gold -= 50;
            GameState.save();
            this.updateUI();
        }
    }

    updateUI() {
        // To be implemented in next step, but called here for consistency
        this.events.emit('ui_update');
    }

    update(time, delta) {
        // Spawn waves
        if (time > this.nextWaveTime) {
            this.spawnHero();
            this.nextWaveTime = time + 3000; // Every 3 seconds
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

    spawnHero() {
        const hero = new Hero(this, PATH_POINTS, {
            speed: 120,
            hp: 50,
            gold: 15,
            texture: 'hero_knight'
        });
        this.enemies.push(hero);
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
