import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

const SearchBar = () => {
    const [filter, setFilter] = useState('');
    const [debouncedFilter] = useDebounce(filter, 400);
    const [result, setResult] = useState({ query: '', pokemon: null, error: '' });
    const query = debouncedFilter.trim().toLowerCase();
    const visibleResult = result.query === query ? result : null;
    const isWaiting = filter.trim().toLowerCase() !== query;

    useEffect(() => {
        if (!query) return undefined;

        let cancelled = false;
        const getPokemon = async () => {
            try {
                const response = await fetch(
                    `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(query)}`,
                );

                if (!response.ok) {
                    throw new Error('No Pokémon found. Check the name or Pokédex number.');
                }

                const pokemon = await response.json();
                if (!cancelled) {
                    setResult({
                        query,
                        pokemon: {
                            name: pokemon.name,
                            id: pokemon.id,
                            image: pokemon.sprites?.front_default
                                ?? pokemon.sprites?.other?.['official-artwork']?.front_default
                                ?? '',
                        },
                        error: '',
                    });
                }
            } catch (error) {
                if (!cancelled) {
                    setResult({
                        query,
                        pokemon: null,
                        error: error instanceof Error ? error.message : 'Could not search Pokémon.',
                    });
                }
            }
        };

        getPokemon();
        return () => {
            cancelled = true;
        };
    }, [query]);

    return (
        <div>
            <input
                type='text'
                value={filter}
                placeholder='Escribe el nombre de un pokemon o su id'
                onChange={(event) => setFilter(event.target.value)}
            />
            <div aria-live='polite'>
                {isWaiting && filter.trim() && <p>Waiting for the search…</p>}
                {visibleResult?.error && <p role='alert'>{visibleResult.error}</p>}
                {visibleResult?.pokemon && (
                    <div key={visibleResult.pokemon.id}>
                        {visibleResult.pokemon.image && (
                            <img src={visibleResult.pokemon.image} alt={visibleResult.pokemon.name} />
                        )}
                        <h1>{visibleResult.pokemon.name}</h1>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;