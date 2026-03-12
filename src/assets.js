export const createBaseAssets = (scene) => {
    // Grass Tile
    const grass = scene.make.graphics({ x: 0, y: 0, add: false });
    grass.fillStyle(0x4a7c44, 1);
    grass.fillRect(0, 0, 64, 64);
    grass.lineStyle(2, 0x3d6638, 1);
    grass.strokeRect(0, 0, 64, 64);
    grass.generateTexture('tile_grass', 64, 64);

    // Path Tile
    const path = scene.make.graphics({ x: 0, y: 0, add: false });
    path.fillStyle(0x8d715a, 1);
    path.fillRect(0, 0, 64, 64);
    path.lineStyle(2, 0x7a624e, 1);
    path.strokeRect(0, 0, 64, 64);
    path.generateTexture('tile_path', 64, 64);

    // Hero - Knight
    const knight = scene.make.graphics({ x: 0, y: 0, add: false });
    knight.fillStyle(0xbdc3c7, 1);
    knight.fillCircle(32, 32, 20);
    knight.fillStyle(0x2c3e50, 1);
    knight.fillCircle(32, 20, 8); // Helmet/Head
    knight.fillStyle(0xe74c3c, 1);
    knight.fillRect(20, 45, 24, 5); // Cape/Detail
    knight.generateTexture('hero_knight', 64, 64);

    // Monster - Slime (Beer Slime)
    const slime = scene.make.graphics({ x: 0, y: 0, add: false });
    slime.fillStyle(0xf1c40f, 1); // Beer color
    slime.fillEllipse(32, 40, 45, 35);
    slime.fillStyle(0xffffff, 0.8); // Foam
    slime.fillCircle(32, 25, 15);
    slime.generateTexture('tower_slime', 64, 64);

    // Monster - Goblin (Pickpocket)
    const goblin = scene.make.graphics({ x: 0, y: 0, add: false });
    goblin.fillStyle(0x27ae60, 1);
    goblin.fillEllipse(32, 32, 35, 40);
    goblin.fillStyle(0x34495e, 1); // Hood
    goblin.fillCircle(32, 20, 12);
    goblin.fillStyle(0xf1c40f, 1); // Gold coin bag
    goblin.fillCircle(45, 45, 8);
    goblin.generateTexture('tower_goblin', 64, 64);

    // Monster - Orc (Cook)
    const orc = scene.make.graphics({ x: 0, y: 0, add: false });
    orc.fillStyle(0x1e8449, 1);
    orc.fillRect(12, 12, 40, 40);
    orc.fillStyle(0xffffff, 1); // Chef Hat
    orc.fillRect(22, 0, 20, 15);
    orc.fillStyle(0x5d4037, 1); // Cleaver
    orc.fillRect(45, 20, 10, 25);
    orc.generateTexture('tower_orc', 64, 64);

    // Monster - Skeleton (Bard)
    const skeleton = scene.make.graphics({ x: 0, y: 0, add: false });
    skeleton.fillStyle(0xecf0f1, 1);
    skeleton.fillCircle(32, 32, 18);
    skeleton.fillStyle(0x000000, 1); // Eyes
    skeleton.fillCircle(25, 28, 4);
    skeleton.fillCircle(39, 28, 4);
    skeleton.fillStyle(0xba68c8, 1); // Lute/Instrument
    skeleton.fillRect(40, 35, 15, 20);
    skeleton.generateTexture('tower_skeleton', 64, 64);

    // Invasor (Fairy/Drone)
    const invasor = scene.make.graphics({ x: 0, y: 0, add: false });
    invasor.fillStyle(0x00d2ff, 1);
    invasor.fillCircle(32, 32, 10);
    invasor.fillStyle(0xffffff, 0.6); // Wings
    invasor.fillEllipse(20, 32, 20, 10);
    invasor.fillEllipse(44, 32, 20, 10);
    invasor.generateTexture('invasor', 64, 64);
};
