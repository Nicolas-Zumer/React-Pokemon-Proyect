const typeImages = import.meta.glob('../assets/types/*.png', {
    eager: true,
    import: 'default',
    query: '?url',
});

const UsePokemonTypeImage = ({pokemon}) => {
    const type1 = pokemon.types[0].type.name
    const typeImage1 = typeImages[`../assets/types/${type1}.png`];
    if(pokemon.types[1]){
      const type2 = pokemon.types[1].type.name
      const typeImage2 = typeImages[`../assets/types/${type2}.png`];

      return (
        <div className='pokemon-types'>
          <img className='pokemon-type-image' src={typeImage1} alt={type1}/>
          <img className='pokemon-type-image' src={typeImage2} alt={type2}/>
        </div>
      )
    }
  
  return (
    <div className='pokemon-types'>
      <img className='pokemon-type-image' src={typeImage1} alt={type1}/>
    </div>
  )
}

export default UsePokemonTypeImage