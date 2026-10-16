import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'pokemon-teams';

const emptyStats = () => ({
    hp: { base: 0, iv: 31, ev: 0 },
    attack: { base: 0, iv: 31, ev: 0 },
    defense: { base: 0, iv: 31, ev: 0 },
    specialAttack: { base: 0, iv: 31, ev: 0 },
    specialDefense: { base: 0, iv: 31, ev: 0 },
    speed: { base: 0, iv: 31, ev: 0 },
});

export const createEmptyPokemon = () => ({
    id: uuidv4(),
    pokemonId: '',
    name: '',
    sprite: '',
    abilities: [],
    movesOptions: [],
    baseStats: emptyStats(),
    genderOptions: [],
    ability: '',
    level: 50,
    gender: '',
    shiny: false,
    teraType: '',
    moves: ['', '', '', ''],
    nature: 'hardy',
    stats: emptyStats(),
});

export const loadTeams = () => {
    const storedTeams = localStorage.getItem(STORAGE_KEY);
    return storedTeams ? JSON.parse(storedTeams) : [];
};

export const saveTeams = (teams) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
};
