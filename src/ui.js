import { GameState } from './state.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        this.currentTab = 'combat'; // 'combat' or 'tavern'
    }

    create(data) {
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

        // --- COMBAT UI ELEMENTS ---
        this.combatContainer = this.add.container(0, 0);

        // Invoke Button
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

        this.combatContainer.add(this.shopButton);

        // --- TAVERN UI ELEMENTS ---
        this.tavernContainer = this.add.container(0, 0).setVisible(false);

        const tavernBg = this.add.graphics();
        tavernBg.fillStyle(0x2c3e50, 0.95);
        tavernBg.fillRect(0, 80, 720, 1100);
        // Make background interactive to block clicks to the game world underneath
        tavernBg.setInteractive(new Phaser.Geom.Rectangle(0, 80, 720, 1100), Phaser.Geom.Rectangle.Contains);
        this.tavernContainer.add(tavernBg);

        const tavernTitle = this.add.text(360, 150, 'MENÚ DE LA TABERNA', {
            fontSize: '48px',
            fill: '#ecf0f1',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.tavernContainer.add(tavernTitle);

        // Upgrades (To be implemented in next step, placeholders for now)
        this.createUpgradeButtons();

        // --- NAVIGATION TABS ---
        this.tabsContainer = this.add.container(0, 1180);

        const tabsBg = this.add.graphics();
        tabsBg.fillStyle(0x000000, 0.9);
        tabsBg.fillRect(0, 0, 720, 100);
        this.tabsContainer.add(tabsBg);

        // Combat Tab Button
        this.btnCombat = this.createTabButton(180, 50, 'COMBATE', () => this.switchTab('combat'));
        // Tavern Tab Button
        this.btnTavern = this.createTabButton(540, 50, 'TABERNA', () => this.switchTab('tavern'));

        this.tabsContainer.add([this.btnCombat, this.btnTavern]);
        this.updateTabHighlights();

        // --- LISTENERS ---
        mainGame.events.on('ui_update', () => {
            this.goldText.setText(`Oro: ${GameState.gold}`);
            this.soulsText.setText(`Almas: ${GameState.souls}`);
            this.waveText.setText(`Oleada: ${GameState.wave}`);
            this.updateShopText();
            this.updateUpgradeText();
        });

        mainGame.events.on('placement_started', () => {
            this.tabsContainer.setVisible(false);
        });

        mainGame.events.on('placement_finished', () => {
            this.updateShopText();
            this.shopText.setFill('#ffffff');
            this.tabsContainer.setVisible(true);
        });

        // Offline Gold Message
        if (data && data.offlineGold > 0) {
            this.showWelcomeMessage(data.offlineGold);
        }
    }

    createTabButton(x, y, label, callback) {
        const container = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(0x34495e, 1);
        bg.fillRoundedRect(-140, -35, 280, 70, 10);

        const text = this.add.text(0, 0, label, {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([bg, text]);
        container.setInteractive(new Phaser.Geom.Rectangle(-140, -35, 280, 70), Phaser.Geom.Rectangle.Contains);
        container.on('pointerdown', callback);

        return container;
    }

    updateTabHighlights() {
        // Highlight active tab
        const combatBg = this.btnCombat.getAt(0);
        const tavernBg = this.btnTavern.getAt(0);

        combatBg.clear();
        tavernBg.clear();

        if (this.currentTab === 'combat') {
            combatBg.fillStyle(0x27ae60, 1);
            tavernBg.fillStyle(0x34495e, 1);
        } else {
            combatBg.fillStyle(0x34495e, 1);
            tavernBg.fillStyle(0x27ae60, 1);
        }

        combatBg.fillRoundedRect(-140, -35, 280, 70, 10);
        tavernBg.fillRoundedRect(-140, -35, 280, 70, 10);
    }

    switchTab(tab) {
        this.currentTab = tab;
        this.updateTabHighlights();

        if (tab === 'combat') {
            this.combatContainer.setVisible(true);
            this.tavernContainer.setVisible(false);
            this.scene.get('GameScene').children.each(child => {
                if (child.type !== 'UIScene') child.setVisible(true);
            });
        } else {
            this.combatContainer.setVisible(false);
            this.tavernContainer.setVisible(true);
            // Hide game world
            const mainGame = this.scene.get('GameScene');
            mainGame.children.each(child => {
                child.setVisible(false);
            });
        }
    }

    createUpgradeButtons() {
        // Mejorar Camas
        this.bedUpgradeBtn = this.add.container(360, 300);
        const bg1 = this.add.graphics().fillStyle(0x8e44ad, 1).fillRoundedRect(-250, -40, 500, 80, 10);
        this.bedText = this.add.text(0, 0, '', { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.bedUpgradeBtn.add([bg1, this.bedText]);
        this.bedUpgradeBtn.setInteractive(new Phaser.Geom.Rectangle(-250, -40, 500, 80), Phaser.Geom.Rectangle.Contains);

        this.bedUpgradeBtn.on('pointerdown', () => {
            const cost = Math.floor(100 * Math.pow(1.5, GameState.camasLevel));
            if (GameState.gold >= cost) {
                GameState.gold -= cost;
                GameState.camasLevel++;
                GameState.passiveGoldRate += 2;
                GameState.save();
                this.scene.get('GameScene').updateUI();
            }
        });

        // Afilador de Garras
        this.dmgUpgradeBtn = this.add.container(360, 420);
        const bg2 = this.add.graphics().fillStyle(0xc0392b, 1).fillRoundedRect(-250, -40, 500, 80, 10);
        this.dmgText = this.add.text(0, 0, '', { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.dmgUpgradeBtn.add([bg2, this.dmgText]);
        this.dmgUpgradeBtn.setInteractive(new Phaser.Geom.Rectangle(-250, -40, 500, 80), Phaser.Geom.Rectangle.Contains);

        this.dmgUpgradeBtn.on('pointerdown', () => {
            const cost = 20 + (GameState.afiladorLevel * 10);
            if (GameState.souls >= cost) {
                GameState.souls -= cost;
                GameState.afiladorLevel++;
                GameState.damageMultiplier *= 1.10;
                GameState.save();
                this.scene.get('GameScene').updateUI();
            }
        });

        this.tavernContainer.add([this.bedUpgradeBtn, this.dmgUpgradeBtn]);
        this.updateUpgradeText();
    }

    updateUpgradeText() {
        const bedCost = Math.floor(100 * Math.pow(1.5, GameState.camasLevel));
        this.bedText.setText(`Mejorar Camas (Nvl: ${GameState.camasLevel}) | Costo: ${bedCost} Oro`);

        const dmgCost = 20 + (GameState.afiladorLevel * 10);
        this.dmgText.setText(`Afilador Garras (Nvl: ${GameState.afiladorLevel}) | Costo: ${dmgCost} Almas`);
    }

    showWelcomeMessage(amount) {
        const welcome = this.add.container(360, 640);
        const bg = this.add.graphics().fillStyle(0x000000, 0.9).fillRoundedRect(-300, -100, 600, 200, 20).lineStyle(4, 0xf1c40f).strokeRoundedRect(-300, -100, 600, 200, 20);
        const text = this.add.text(0, 0, `¡Mientras dormías, la taberna\ngeneró ${amount} Oro!`, {
            fontSize: '32px',
            fill: '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        welcome.add([bg, text]);
        welcome.setDepth(200);

        this.time.delayedCall(4000, () => {
            welcome.destroy();
        });
    }
}
