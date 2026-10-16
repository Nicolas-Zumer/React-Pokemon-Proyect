import { useEffect, useState } from 'react';
import UsePokemonTypeImage from './UsePokemonTypeImage';

const PokemonCard = ({ number }) => {
    const [pokemon, setPokemon] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadPokemon() {
        try {
            const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${number}`
            );

            if (!response.ok) {
                throw new Error(`Could not load Pokémon #${number}`);
            }

            const data = await response.json();

            if (!cancelled) {
                setPokemon(data);
            }
        } catch (error) {
            if (!cancelled) {
                setError(error.message);
            }
        }
    }

        loadPokemon();

        return () => {
        cancelled = true;
        };

    }, [number]);

    if (error) {
        return <article>{error}</article>;
    }

    if (!pokemon) {
        return <article>Loading...</article>;
    }

    return (
        <div className='PokemonCard' key={pokemon.id}>
            <img className='pokemon-sprite' src={pokemon.sprites.front_default} alt={pokemon.name} />
            <h2>{pokemon.name}</h2>
            <UsePokemonTypeImage pokemon={pokemon} />
        </div>
    );
};

export default PokemonCard;