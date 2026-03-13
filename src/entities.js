import { getWorldPos } from './map.js';

export class Hero extends Phaser.GameObjects.Container {
    constructor(scene, path, config) {
        const startPos = getWorldPos(path[0].x, path[0].y);
        super(scene, startPos.x, startPos.y);

        this.scene = scene;
        this.path = path;
        this.pathIndex = 0;
        this.speed = config.speed || 100;
        this.hp = config.hp || 100;
        this.maxHp = this.hp;
        this.gold = config.gold || 10;

        this.sprite = scene.add.sprite(0, 0, config.texture || 'hero_knight');
        this.add(this.sprite);

        // Health bar
        this.hpBar = scene.add.graphics();
        this.add(this.hpBar);
        this.updateHpBar();

        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    updateHpBar() {
        this.hpBar.clear();
        this.hpBar.fillStyle(0x000000);
        this.hpBar.fillRect(-20, -35, 40, 5);
        this.hpBar.fillStyle(0xff0000);
        this.hpBar.fillRect(-20, -35, 40 * (this.hp / this.maxHp), 5);
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.updateHpBar();
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.scene.events.emit('hero_defeated', this.gold);
        this.destroy();
    }

    update(time, delta) {
        if (this.pathIndex >= this.path.length - 1) {
            this.scene.events.emit('hero_escaped', this.gold);
            this.destroy();
            return;
        }

        const target = getWorldPos(this.path[this.pathIndex + 1].x, this.path[this.pathIndex + 1].y);
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

        if (distance < 5) {
            this.pathIndex++;
        } else {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
            this.x += Math.cos(angle) * this.speed * (delta / 1000);
            this.y += Math.sin(angle) * this.speed * (delta / 1000);
        }
    }
}
