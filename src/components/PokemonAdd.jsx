import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { NATURES, STAT_FIELDS, TERA_TYPES } from '../data/teamOptions';
import { createEmptyPokemon } from '../utils/teamStorage';

const API_BASE = 'https://pokeapi.co/api/v2';

const getJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`PokéAPI request failed (${response.status})`);
    }
    return response.json();
};

const PokemonAdd = ({ index, onRemove, canRemove }) => {
    const {
        control,
        formState: { errors },
        getValues,
        register,
        setValue,
    } = useFormContext();
    const fieldName = `members.${index}`;
    const member = useWatch({ control, name: fieldName }) ?? {};
    const [search, setSearch] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const memberErrors = errors.members?.[index] ?? {};

    const loadPokemon = async () => {
        const query = (search ?? member.name ?? '').trim().toLowerCase();
        if (!query) {
            setLoadError('Enter a Pokémon name or Pokédex number.');
            return;
        }

        setLoading(true);
        setLoadError('');
        try {
            const pokemon = await getJson(`${API_BASE}/pokemon/${encodeURIComponent(query)}`);
            const species = await getJson(pokemon.species.url);
            const versionGroup = 'scarlet-violet';
            const movesOptions = [...new Set(
                pokemon.moves
                    .filter(({ version_group_details }) =>
                        version_group_details.some(
                            ({ version_group }) => version_group.name === versionGroup,
                        ),
                    )
                    .map(({ move }) => move.name),
            )].sort();
            const abilities = pokemon.abilities.map(({ ability }) => ability.name);
            const genderOptions = species.gender_rate === -1
                ? ['genderless']
                : species.gender_rate === 0
                    ? ['male']
                    : species.gender_rate === 8
                        ? ['female']
                        : ['male', 'female'];
            const baseStats = createEmptyPokemon().baseStats;

            pokemon.stats.forEach(({ base_stat, stat }) => {
                const statKey = {
                    hp: 'hp',
                    attack: 'attack',
                    defense: 'defense',
                    'special-attack': 'specialAttack',
                    'special-defense': 'specialDefense',
                    speed: 'speed',
                }[stat.name];
                baseStats[statKey].base = base_stat;
            });

            const current = getValues(fieldName);
            const defaultMember = createEmptyPokemon();
            const sprite = pokemon.sprites.other?.['official-artwork']?.front_default
                ?? pokemon.sprites.front_default
                ?? '';
            const nextStats = createEmptyPokemon().stats;
            STAT_FIELDS.forEach(({ key }) => {
                nextStats[key].base = baseStats[key].base;
            });

            setValue(fieldName, {
                ...defaultMember,
                id: current.id || defaultMember.id,
                pokemonId: pokemon.id,
                name: pokemon.name,
                sprite,
                abilities,
                movesOptions,
                baseStats,
                genderOptions,
                level: current.level || 50,
                gender: genderOptions.includes(current.gender)
                    ? current.gender
                    : genderOptions[0],
                shiny: current.shiny ?? false,
                teraType: current.teraType || '',
                stats: nextStats,
            }, { shouldDirty: true, shouldValidate: true });
            setSearch(pokemon.name);
        } catch (error) {
            setLoadError(
                error instanceof Error
                    ? `${error.message}. Check the name or Pokédex number and try again.`
                    : 'Unable to load this Pokémon.',
            );
        } finally {
            setLoading(false);
        }
    };

    const evTotal = STAT_FIELDS.reduce(
        (total, { key }) => total + (Number(member.stats?.[key]?.ev) || 0),
        0,
    );
    const evRule = {
        min: { value: 0, message: 'EVs must be at least 0.' },
        max: { value: 252, message: 'A stat can have at most 252 EVs.' },
        validate: () => {
            const stats = getValues(`${fieldName}.stats`);
            const total = STAT_FIELDS.reduce(
                (sum, { key }) => sum + (Number(stats?.[key]?.ev) || 0),
                0,
            );
            return total <= 510 || 'The total EVs across all stats cannot exceed 510.';
        },
    };

    return (
        <fieldset className='team-pokemon'>
            <legend>Pokémon {index + 1}</legend>
            <div className='team-pokemon-search'>
                <label htmlFor={`pokemon-search-${index}`}>Pokémon name or Pokédex number</label>
                <div className='team-search-row'>
                    <input
                        id={`pokemon-search-${index}`}
                        value={search ?? member.name ?? ''}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                loadPokemon();
                            }
                        }}
                        placeholder='For example, Pikachu or 25'
                    />
                    <button type='button' onClick={loadPokemon} disabled={loading}>
                        {loading ? 'Loading…' : member.pokemonId ? 'Change Pokémon' : 'Load Pokémon'}
                    </button>
                </div>
                {memberErrors.pokemonId && (
                    <p className='team-error'>{memberErrors.pokemonId.message}</p>
                )}
                {loadError && <p className='team-error' role='alert'>{loadError}</p>}
            </div>

            <input
                type='hidden'
                {...register(`${fieldName}.pokemonId`, {
                    required: 'Load a Pokémon before saving the team.',
                })}
            />

            {member.pokemonId && (
                <>
                    <div className='team-pokemon-heading'>
                        {member.sprite && <img src={member.sprite} alt='' />}
                        <div>
                            <h3>{member.name}</h3>
                            <p>Base stats are loaded from PokéAPI.</p>
                        </div>
                    </div>

                    <div className='team-field-grid'>
                        <label>
                            Ability
                            <select {...register(`${fieldName}.ability`, { required: 'Choose an ability.' })}>
                                <option value=''>Choose an ability</option>
                                {member.abilities?.map((ability) => (
                                    <option key={ability} value={ability}>{ability.replaceAll('-', ' ')}</option>
                                ))}
                            </select>
                            {memberErrors.ability && <span className='team-error'>{memberErrors.ability.message}</span>}
                        </label>
                        <label>
                            Level
                            <input
                                type='number'
                                min='1'
                                max='100'
                                {...register(`${fieldName}.level`, {
                                    valueAsNumber: true,
                                    required: 'Enter a level.',
                                    min: { value: 1, message: 'Level must be at least 1.' },
                                    max: { value: 100, message: 'Level cannot exceed 100.' },
                                    validate: (value) => Number.isInteger(value) || 'Level must be a whole number.',
                                })}
                            />
                            {memberErrors.level && <span className='team-error'>{memberErrors.level.message}</span>}
                        </label>
                        <label>
                            Gender
                            <select {...register(`${fieldName}.gender`, { required: 'Choose a gender option.' })}>
                                {member.genderOptions?.map((gender) => (
                                    <option key={gender} value={gender}>{gender}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Tera Type
                            <select {...register(`${fieldName}.teraType`, { required: 'Choose a Tera Type.' })}>
                                <option value=''>Choose a type</option>
                                {TERA_TYPES.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {memberErrors.teraType && <span className='team-error'>{memberErrors.teraType.message}</span>}
                        </label>
                        <label>
                            Nature
                            <select {...register(`${fieldName}.nature`, { required: true })}>
                                {NATURES.map((nature) => (
                                    <option key={nature} value={nature}>{nature}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className='team-shiny-toggle'>
                        <input type='checkbox' {...register(`${fieldName}.shiny`)} />
                        <span className='team-toggle-track' aria-hidden='true' />
                        Shiny Pokémon
                    </label>

                    <section className='team-subsection' aria-label={`Moves for ${member.name}`}>
                        <h4>Moves (up to 4; Gen 9 learnset)</h4>
                        <div className='team-field-grid team-move-grid'>
                            {[0, 1, 2, 3].map((moveIndex) => (
                                <label key={moveIndex}>
                                    Move {moveIndex + 1}
                                    <select {...register(`${fieldName}.moves.${moveIndex}`)}>
                                        <option value=''>— Empty —</option>
                                        {member.movesOptions?.map((move) => (
                                            <option key={move} value={move}>{move.replaceAll('-', ' ')}</option>
                                        ))}
                                    </select>
                                </label>
                            ))}
                        </div>
                        {member.movesOptions?.length === 0 && (
                            <p className='team-error'>PokéAPI has no Scarlet/Violet moves listed for this Pokémon.</p>
                        )}
                    </section>

                    <section className='team-subsection' aria-label={`Stats for ${member.name}`}>
                        <h4>Stats — EVs used: {evTotal}/510</h4>
                        <div className='team-stats-table'>
                            <div className='team-stat-row team-stat-header'>
                                <span>Stat</span><span>Base</span><span>IV (0–31)</span><span>EV (0–252)</span>
                            </div>
                            {STAT_FIELDS.map(({ key, label }) => (
                                <div className='team-stat-row' key={key}>
                                    <span>{label}</span>
                                    <span>{member.baseStats?.[key]?.base ?? 0}</span>
                                    <input
                                        aria-label={`${label} IV`}
                                        type='number'
                                        min='0'
                                        max='31'
                                        {...register(`${fieldName}.stats.${key}.iv`, {
                                            valueAsNumber: true,
                                            min: { value: 0, message: 'IVs must be at least 0.' },
                                            max: { value: 31, message: 'IVs cannot exceed 31.' },
                                            validate: (value) => Number.isInteger(value) || 'IVs must be whole numbers.',
                                        })}
                                    />
                                    <input
                                        aria-label={`${label} EV`}
                                        type='number'
                                        min='0'
                                        max='252'
                                        {...register(`${fieldName}.stats.${key}.ev`, {
                                            valueAsNumber: true,
                                            min: evRule.min,
                                            max: evRule.max,
                                            validate: (value) => Number.isInteger(value)
                                                ? evRule.validate()
                                                : 'EVs must be whole numbers.',
                                        })}
                                    />
                                </div>
                            ))}
                        </div>
                        {memberErrors.stats && (
                            <p className='team-error'>Check the IV and EV values; per-stat and total limits apply.</p>
                        )}
                        {evTotal > 510 && <p className='team-error' role='alert'>The total EVs across all stats cannot exceed 510.</p>}
                    </section>
                </>
            )}

            {canRemove && (
                <button className='team-remove-button' type='button' onClick={onRemove}>
                    Remove Pokémon
                </button>
            )}
        </fieldset>
    );
};

export default PokemonAdd;
