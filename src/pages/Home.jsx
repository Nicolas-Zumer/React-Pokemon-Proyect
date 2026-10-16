import { useState } from 'react';
import { Link } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import useTheme from '../hooks/useTheme';

const Home = () => {
    const [savedNickname, setSavedNickname, nicknameError] = useLocalStorage('timbur-nickname', '');
    const [nicknameDraft, setNicknameDraft] = useState(savedNickname);
    const { theme, setTheme, storageError: themeError } = useTheme();

    const saveNickname = (event) => {
        event.preventDefault();
        setSavedNickname(nicknameDraft.trim());
    };

    return (
        <div className='home-page'>
            <section className='home-intro'>
                <p className='home-eyebrow'>TimburBuilder</p>
                <h1>{savedNickname ? `Welcome, ${savedNickname}!` : 'Build your Pokémon team.'}</h1>
                <p className='home-lead'>
                    A simple workspace to explore Pokémon and prepare teams for competitive play.
                    Look up Pokémon, plan their moves and stats, then keep your teams saved in one place.
                </p>
                <div className='home-actions'>
                    <Link className='home-primary-link' to='/teambuilder'>Create a team</Link>
                    <Link className='home-secondary-link' to='/pokedex'>Explore the Pokédex</Link>
                </div>
            </section>

            <section className='home-tools' aria-labelledby='home-tools-title'>
                <div className='home-tools-copy'>
                    <p className='team-eyebrow'>Make it yours</p>
                    <h2 id='home-tools-title'>Your preferences</h2>
                    <p>Choose a display theme and save a nickname for your next visit.</p>
                </div>

                <div className='home-settings'>
                    <fieldset className='theme-settings'>
                        <legend>Display theme</legend>
                        <div className='theme-options'>
                            <button
                                type='button'
                                aria-pressed={theme === 'light'}
                                className={theme === 'light' ? 'theme-option is-selected' : 'theme-option'}
                                onClick={() => setTheme('light')}
                            >
                                Light
                            </button>
                            <button
                                type='button'
                                aria-pressed={theme === 'dark'}
                                className={theme === 'dark' ? 'theme-option is-selected' : 'theme-option'}
                                onClick={() => setTheme('dark')}
                            >
                                Dark
                            </button>
                        </div>
                    </fieldset>

                    <form className='nickname-form' onSubmit={saveNickname}>
                        <label htmlFor='nickname'>Your nickname</label>
                        <div className='nickname-form-row'>
                            <input
                                id='nickname'
                                name='nickname'
                                maxLength={24}
                                value={nicknameDraft}
                                onChange={(event) => setNicknameDraft(event.target.value)}
                                placeholder='Enter a nickname'
                            />
                            <button type='submit'>Save nickname</button>
                        </div>
                        {savedNickname && (
                            <button
                                className='nickname-clear'
                                type='button'
                                onClick={() => {
                                    setSavedNickname('');
                                    setNicknameDraft('');
                                }}
                            >
                                Clear saved nickname
                            </button>
                        )}
                    </form>
                </div>
                {(nicknameError || themeError) && (
                    <p className='team-error home-storage-error' role='alert'>
                        {nicknameError || themeError}
                    </p>
                )}
            </section>
        </div>
    );
};

export default Home;
