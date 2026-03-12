export class Tower extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);
        this.scene = scene;
        this.type = config.type;
        this.damage = config.damage || 10;
        this.range = config.range || 150;
        this.fireRate = config.fireRate || 1000; // ms
        this.lastFired = 0;

        this.sprite = scene.add.sprite(0, 0, config.texture);
        this.add(this.sprite);

        // Range circle (visible only during placement or selection)
        this.rangeCircle = scene.add.graphics();
        this.rangeCircle.lineStyle(2, 0xffffff, 0.3);
        this.rangeCircle.strokeCircle(0, 0, this.range);
        this.add(this.rangeCircle);
        this.rangeCircle.setVisible(false);

        scene.add.existing(this);
    }

    update(time, delta, enemies) {
        if (time < this.lastFired + this.fireRate) return;

        const target = this.findTarget(enemies);
        if (target) {
            this.fire(target);
            this.lastFired = time;
        }
    }

    findTarget(enemies) {
        return enemies.find(enemy => {
            if (!enemy.active) return false;
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            return distance <= this.range;
        });
    }

    fire(target) {
        // Simple projectile effect
        const line = this.scene.add.graphics();
        line.lineStyle(3, 0xffff00, 1);
        line.lineBetween(this.x, this.y, target.x, target.y);
        this.scene.tweens.add({
            targets: line,
            alpha: 0,
            duration: 200,
            onComplete: () => line.destroy()
        });

        target.takeDamage(this.damage);
    }
}
