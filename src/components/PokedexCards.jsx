import { useState } from 'react'
import PokemonCard from './PokemonCard';
import SearchBar from './SearchBar';

const PokedexCards = () => {
    const [pokemonNumber, setPokemonNumber] = useState (25)

  return (
    <div>
        <h1>POKEDEX</h1>
        <SearchBar />
        {Array.from({ length: pokemonNumber }, (_, index) => {
            const number = index +1;
            return <PokemonCard key={number} number={number} />
        })}
        <button onClick={() => setPokemonNumber(pokemonNumber+25)}>Mostrar Más</button>
    </div>
  )
}

export default PokedexCards
