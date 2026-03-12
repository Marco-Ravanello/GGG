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
        scene.tweens.add({
            targets: this,
            y: startY + 50,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update(time, delta) {
        this.x += this.speed * (delta / 1000);
        if (this.x > 770) {
            this.destroy();
        }
    }

    claimReward() {
        GameState.souls += 5;
        GameState.save();
        this.scene.events.emit('ui_update');

        // Visual feedback
        const text = this.scene.add.text(this.x, this.y, '+5 Almas!', {
            fontSize: '32px',
            fill: '#9b59b6',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: text,
            y: this.y - 100,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });

        this.destroy();
    }
}
