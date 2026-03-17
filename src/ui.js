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
        topBar.fillRect(0, 0, 720, 130);
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

        this.waveText = this.add.text(20, 80, `Oleada: ${GameState.wave}`, {
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

        const tavernBg = this.add.image(360, 640, 'tavern_bg');
        tavernBg.setDisplaySize(720, 1280);
        tavernBg.setTint(0x664422); // Darken the scroll for a tavern feel
        tavernBg.setInteractive();
        this.tavernContainer.add(tavernBg);

        const tavernTitle = this.add.text(360, 180, 'MENÚ DE LA TABERNA', {
            fontSize: '48px',
            fill: '#3e2723',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.tavernContainer.add(tavernTitle);

        // Status Panel
        const statusPanel = this.add.container(360, 250);
        const sBg = this.add.graphics();
        sBg.fillStyle(0x3e2723, 0.8);
        sBg.fillRoundedRect(-250, -30, 500, 60, 15);
        statusPanel.add(sBg);

        this.statusText = this.add.text(0, 0, '', {
            fontSize: '24px',
            fill: '#f1c40f',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        statusPanel.add(this.statusText);
        this.tavernContainer.add(statusPanel);

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
        // Mejorar Camas Card
        this.bedCard = this.createUpgradeCard(360, 400, {
            title: 'Mejorar Camas',
            icon: 'icon_bed',
            currencyIcon: 'icon_coin',
            upgradeType: 'beds'
        });

        // Afilador de Garras Card
        this.dmgCard = this.createUpgradeCard(360, 550, {
            title: 'Afilador Garras',
            icon: 'icon_sword',
            currencyIcon: 'icon_soul',
            upgradeType: 'damage'
        });

        this.tavernContainer.add([this.bedCard.container, this.dmgCard.container]);
        this.updateUpgradeText();
    }

    createUpgradeCard(x, y, config) {
        const container = this.add.container(x, y);

        // Background card
        const bg = this.add.graphics();
        bg.fillStyle(0xfdf5e6, 0.9);
        bg.lineStyle(4, 0x3e2723, 1);
        bg.fillRoundedRect(-320, -60, 640, 120, 10);
        bg.strokeRoundedRect(-320, -60, 640, 120, 10);
        container.add(bg);

        // Icon
        const icon = this.add.image(-260, 0, config.icon).setDisplaySize(80, 80);
        container.add(icon);

        // Info (Center)
        const titleText = this.add.text(-200, -35, config.title, {
            fontSize: '28px',
            fill: '#3e2723',
            fontStyle: 'bold'
        });
        const levelText = this.add.text(-200, 0, '', {
            fontSize: '20px',
            fill: '#5d4037'
        });
        const effectText = this.add.text(-200, 25, '', {
            fontSize: '18px',
            fill: '#795548',
            fontStyle: 'italic'
        });
        container.add([titleText, levelText, effectText]);

        // Buy Button (Right)
        const buyBtn = this.add.container(220, 0);
        const bBg = this.add.graphics();
        bBg.fillStyle(0xd4af37, 1);
        bBg.lineStyle(2, 0x3e2723, 1);
        bBg.fillRoundedRect(-70, -35, 140, 70, 8);
        bBg.strokeRoundedRect(-70, -35, 140, 70, 8);

        const costText = this.add.text(-25, 0, '', {
            fontSize: '24px',
            fill: '#3e2723',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        const cIcon = this.add.image(30, 0, config.currencyIcon).setDisplaySize(32, 32);

        buyBtn.add([bBg, costText, cIcon]);
        buyBtn.setInteractive(new Phaser.Geom.Rectangle(-70, -35, 140, 70), Phaser.Geom.Rectangle.Contains);
        container.add(buyBtn);

        buyBtn.on('pointerdown', () => {
            if (config.upgradeType === 'beds') {
                const cost = Math.floor(100 * Math.pow(1.5, GameState.camasLevel));
                if (GameState.gold >= cost) {
                    GameState.gold -= cost;
                    GameState.camasLevel++;
                    GameState.passiveGoldRate += 2;
                    GameState.save();
                    this.scene.get('GameScene').updateUI();
                }
            } else {
                const cost = 20 + (GameState.afiladorLevel * 10);
                if (GameState.souls >= cost) {
                    GameState.souls -= cost;
                    GameState.afiladorLevel++;
                    GameState.damageMultiplier *= 1.10;
                    GameState.save();
                    this.scene.get('GameScene').updateUI();
                }
            }
        });

        return { container, levelText, effectText, costText };
    }

    updateUpgradeText() {
        this.statusText.setText(`Generación actual: ${GameState.passiveGoldRate} Oro / 2 seg`);

        // Bed card update
        const bedCost = Math.floor(100 * Math.pow(1.5, GameState.camasLevel));
        this.bedCard.levelText.setText(`Nivel: ${GameState.camasLevel}`);
        this.bedCard.effectText.setText(`+2 Oro / 2 seg`);
        this.bedCard.costText.setText(`${bedCost}`);

        // Dmg card update
        const dmgCost = 20 + (GameState.afiladorLevel * 10);
        this.dmgCard.levelText.setText(`Nivel: ${GameState.afiladorLevel}`);
        this.dmgCard.effectText.setText(`+10% Daño global`);
        this.dmgCard.costText.setText(`${dmgCost}`);
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
