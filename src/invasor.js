import { GameState } from './state.js';

export class Invasor extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        const startY = Phaser.Math.Between(200, 1000);
        super(scene, -50, startY, 'invasor');

        this.scene = scene;
        scene.add.existing(this);

        this.setInteractive();
        this.on('pointerdown', () => this.claimReward());

        this.speed = Phaser.Math.Between(150, 250);

        // Float effect
        this.floatTween = scene.tweens.add({
            targets: this,
            y: startY + 50,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update(time, delta) {
        if (this.scene.isGamePaused) return;
        this.x += this.speed * (delta / 1000);
        if (this.x > 770) {
            this.destroy();
        }
    }

    claimReward() {
        this.scene.events.emit('invasor_clicked', this);
    }
}
