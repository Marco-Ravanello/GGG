export const MAP_CONFIG = {
    tileWidth: 64,
    tileHeight: 64,
    rows: 20,
    cols: 11,
    offsetX: 8 // (720 - (11 * 64)) / 2
};

// Fixed S-shaped path (column, row)
export const PATH_POINTS = [
    {x: 10, y: 1}, {x: 9, y: 1}, {x: 8, y: 1}, {x: 7, y: 1}, {x: 6, y: 1}, {x: 5, y: 1}, {x: 4, y: 1}, {x: 3, y: 1}, {x: 2, y: 1}, {x: 1, y: 1},
    {x: 1, y: 2}, {x: 1, y: 3}, {x: 1, y: 4}, {x: 1, y: 5},
    {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5}, {x: 5, y: 5}, {x: 6, y: 5}, {x: 7, y: 5}, {x: 8, y: 5}, {x: 9, y: 5},
    {x: 9, y: 6}, {x: 9, y: 7}, {x: 9, y: 8}, {x: 9, y: 9},
    {x: 8, y: 9}, {x: 7, y: 9}, {x: 6, y: 9}, {x: 5, y: 9}, {x: 4, y: 9}, {x: 3, y: 9}, {x: 2, y: 9}, {x: 1, y: 9},
    {x: 1, y: 10}, {x: 1, y: 11}, {x: 1, y: 12}, {x: 1, y: 13},
    {x: 2, y: 13}, {x: 3, y: 13}, {x: 4, y: 13}, {x: 5, y: 13}, {x: 6, y: 13}, {x: 7, y: 13}, {x: 8, y: 13}, {x: 9, y: 13},
    {x: 9, y: 14}, {x: 9, y: 15}, {x: 9, y: 16}, {x: 9, y: 17},
    {x: 8, y: 17}, {x: 7, y: 17}, {x: 6, y: 17}, {x: 5, y: 17}, {x: 4, y: 17}, {x: 3, y: 17}, {x: 2, y: 17}, {x: 1, y: 17}
];

export function getWorldPos(col, row) {
    return {
        x: MAP_CONFIG.offsetX + col * MAP_CONFIG.tileWidth + MAP_CONFIG.tileWidth / 2,
        y: row * MAP_CONFIG.tileHeight + MAP_CONFIG.tileHeight / 2
    };
}
