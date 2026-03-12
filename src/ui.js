import { GameState } from './state.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // Top Bar
        const topBar = this.add.graphics();
        topBar.fillStyle(0x000000, 0.7);
        topBar.fillRect(0, 0, 720, 80);

        this.goldText = this.add.text(20, 20, `Oro: ${GameState.gold}`, {
            fontSize: '32px',
            fill: '#f1c40f',
            fontStyle: 'bold'
        });

        this.soulsText = this.add.text(350, 20, `Almas: ${GameState.souls}`, {
            fontSize: '32px',
            fill: '#9b59b6',
            fontStyle: 'bold'
        });

        // Bottom Bar (Draft)
        const bottomBar = this.add.graphics();
        bottomBar.fillStyle(0x000000, 0.7);
        bottomBar.fillRect(0, 1180, 720, 100);

        this.add.text(360, 1230, 'TABERNA | MONSTRUOS | INVOCAR | TIENDA', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Listen for updates from GameScene
        const mainGame = this.scene.get('GameScene');
        mainGame.events.on('ui_update', () => {
            this.goldText.setText(`Oro: ${GameState.gold}`);
            this.soulsText.setText(`Almas: ${GameState.souls}`);
        });
    }
}
