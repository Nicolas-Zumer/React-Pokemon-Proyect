import './App.css'
import { NavLink, Outlet } from 'react-router-dom'
import timburLogo from './assets/TimburLogo.PNG';

function App() {

  return (
    <>
      <div className='App'>
      <header>
      </header>
      <div>
        <nav>
          <NavLink to=""> <img src={timburLogo} alt='TimburLogo'></img> </NavLink>
          <NavLink to=""> Home </NavLink>
          <NavLink to="pokedex"> Pokedex </NavLink>
          <NavLink to="teambuilder"> Teambuilder </NavLink>
          <NavLink to="teamviewer"> Teamviewer </NavLink>

        </nav>
      </div>
      <main>
        <Outlet />
      </main>
      <footer>Created by Nizuso</footer>
    </div>
    </>
  )
}

export default App
