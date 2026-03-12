export const GameState = {
    gold: 200,
    souls: 0,
    level: 1,
    unlockedMonsters: ['slime'],
    inventory: {
        slime: 1,
        goblin: 0,
        orc: 0,
        skeleton: 0
    },

    save() {
        const data = {
            gold: this.gold,
            souls: this.souls,
            level: this.level,
            inventory: this.inventory,
            unlockedMonsters: this.unlockedMonsters
        };
        localStorage.setItem('mimic_tavern_save', JSON.stringify(data));
        console.log('Juego guardado');
    },

    load() {
        const saved = localStorage.getItem('mimic_tavern_save');
        if (saved) {
            const data = JSON.parse(saved);
            this.gold = data.gold ?? this.gold;
            this.souls = data.souls ?? this.souls;
            this.level = data.level ?? this.level;
            this.inventory = data.inventory ?? this.inventory;
            this.unlockedMonsters = data.unlockedMonsters ?? this.unlockedMonsters;
            console.log('Juego cargado');
        }
    },

    reset() {
        localStorage.removeItem('mimic_tavern_save');
        window.location.reload();
    }
};
