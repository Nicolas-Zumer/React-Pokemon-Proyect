import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {  BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ThemeProvider from './context/ThemeProvider.jsx'
//Importamos las paginas creadas para poder referenciarlas
import Pokedex from './pages/Pokedex.jsx'
import Home from './pages/Home.jsx'
import TeamBuilder from './pages/TeamBuilder.jsx'
import TeamViewer from './pages/TeamViewer.jsx'
import NotFound from './pages/NotFound.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter basename='/'>
        <Routes>
          <Route path='/' element={<App />}>
            <Route index element = {<Home />}/>
            <Route path='pokedex' element = {<Pokedex />}/>
            <Route path='teambuilder' element = {<TeamBuilder />}/>
            <Route path='teamviewer' element = {<TeamViewer />}/>
            <Route path='*' element = {<NotFound />}/>



          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
