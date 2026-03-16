export const GameState = {
    gold: 200,
    souls: 0,
    wave: 1,
    monstersPurchased: 0,
    unlockedMonsters: ['slime'],
    inventory: {
        slime: 1,
        goblin: 0,
        orc: 0,
        skeleton: 0
    },

    // Tycoon Mechanics (V4)
    passiveGoldRate: 5, // Gold every 2 seconds
    camasLevel: 0,
    afiladorLevel: 0,
    damageMultiplier: 1.0,
    lastTimestamp: Date.now(),

    save() {
        const data = {
            gold: this.gold,
            souls: this.souls,
            wave: this.wave,
            monstersPurchased: this.monstersPurchased,
            inventory: this.inventory,
            unlockedMonsters: this.unlockedMonsters,
            // Tycoon persistence
            passiveGoldRate: this.passiveGoldRate,
            camasLevel: this.camasLevel,
            afiladorLevel: this.afiladorLevel,
            damageMultiplier: this.damageMultiplier,
            lastTimestamp: Date.now()
        };
        localStorage.setItem('mimic_tavern_save', JSON.stringify(data));
        console.log('Juego guardado');
    },

    load() {
        const saved = localStorage.getItem('mimic_tavern_save');
        let offlineGold = 0;

        if (saved) {
            const data = JSON.parse(saved);
            this.gold = data.gold ?? this.gold;
            this.souls = data.souls ?? this.souls;
            this.wave = data.wave ?? this.wave;
            this.monstersPurchased = data.monstersPurchased ?? this.monstersPurchased;
            this.inventory = data.inventory ?? this.inventory;
            this.unlockedMonsters = data.unlockedMonsters ?? this.unlockedMonsters;

            // Tycoon loading
            this.passiveGoldRate = data.passiveGoldRate ?? this.passiveGoldRate;
            this.camasLevel = data.camasLevel ?? this.camasLevel;
            this.afiladorLevel = data.afiladorLevel ?? this.afiladorLevel;
            this.damageMultiplier = data.damageMultiplier ?? this.damageMultiplier;

            // Offline Progress Calculation
            if (data.lastTimestamp) {
                const now = Date.now();
                const diffMs = now - data.lastTimestamp;
                const secondsElapsed = Math.floor(diffMs / 1000);

                // +5 gold every 2 seconds means 2.5 gold per second
                offlineGold = Math.floor(secondsElapsed * (this.passiveGoldRate / 2));
                this.gold += offlineGold;
            }

            console.log('Juego cargado');
        }
        return offlineGold;
    },

    reset() {
        localStorage.removeItem('mimic_tavern_save');
        window.location.reload();
    }
};
