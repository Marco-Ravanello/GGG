import { GameState } from './state.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        const mainGame = this.scene.get('GameScene');

        // Top Bar
        const topBar = this.add.graphics();
        topBar.fillStyle(0x000000, 0.8);
        topBar.fillRect(0, 0, 720, 80);
        topBar.depth = 100;

        this.goldText = this.add.text(20, 20, `Oro: ${GameState.gold}`, {
            fontSize: '32px',
            fill: '#f1c40f',
            fontStyle: 'bold'
        }).setDepth(101);

        this.soulsText = this.add.text(350, 20, `Almas: ${GameState.souls}`, {
            fontSize: '32px',
            fill: '#9b59b6',
            fontStyle: 'bold'
        }).setDepth(101);

        this.waveText = this.add.text(20, 90, `Oleada: ${GameState.wave}`, {
            fontSize: '28px',
            fill: '#ecf0f1',
            fontStyle: 'bold'
        }).setDepth(101);

        // Shop Button
        this.shopButton = this.add.container(360, 1100);
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x27ae60, 1);
        btnBg.fillRoundedRect(-150, -30, 300, 60, 10);
        btnBg.lineStyle(2, 0xffffff, 1);
        btnBg.strokeRoundedRect(-150, -30, 300, 60, 10);

        this.updateShopText = () => {
            const cost = 50 + (GameState.monstersPurchased * 10);
            this.shopText.setText(`Invocar Monstruo (${cost} Oro)`);
        };

        this.shopText = this.add.text(0, 0, '', {
            fontSize: '22px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.updateShopText();

        this.shopButton.add([btnBg, this.shopText]);
        this.shopButton.setInteractive(new Phaser.Geom.Rectangle(-150, -30, 300, 60), Phaser.Geom.Rectangle.Contains);

        this.shopButton.on('pointerdown', () => {
            const cost = 50 + (GameState.monstersPurchased * 10);
            if (GameState.gold >= cost) {
                GameState.gold -= cost;
                GameState.monstersPurchased++;
                GameState.save();
                mainGame.updateUI();

                const rng = Math.random();
                const monsterType = rng < 0.7 ? 'slime' : 'red_monster';
                mainGame.startPlacement(monsterType);

                this.shopText.setText('Selecciona en el mapa...');
                this.shopText.setFill('#f1c40f');
            } else {
                this.shopText.setText('¡Falta Oro!');
                this.time.delayedCall(1000, () => {
                    this.updateShopText();
                });
            }
        });

        // Bottom Bar (Draft)
        const bottomBar = this.add.graphics();
        bottomBar.fillStyle(0x000000, 0.8);
        bottomBar.fillRect(0, 1180, 720, 100);
        bottomBar.depth = 100;

        this.add.text(360, 1230, 'TABERNA | MONSTRUOS | INVOCAR | TIENDA', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5).setDepth(101);

        // Listen for updates
        mainGame.events.on('ui_update', () => {
            this.goldText.setText(`Oro: ${GameState.gold}`);
            this.soulsText.setText(`Almas: ${GameState.souls}`);
            this.waveText.setText(`Oleada: ${GameState.wave}`);
            this.updateShopText();
        });

        mainGame.events.on('placement_finished', () => {
            this.updateShopText();
            this.shopText.setFill('#ffffff');
        });
    }
}
