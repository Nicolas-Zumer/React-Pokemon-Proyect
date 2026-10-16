import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadTeams, saveTeams } from '../utils/teamStorage';

const formatName = (name = '') => name.replaceAll('-', ' ');

const TeamViewer = () => {
    const [initialData] = useState(() => {
        try {
            return { teams: loadTeams(), error: '' };
        } catch (loadError) {
            return {
                teams: [],
                error: loadError instanceof Error
                    ? `Could not load saved teams: ${loadError.message}`
                    : 'Could not load saved teams.',
            };
        }
    });
    const [teams, setTeams] = useState(initialData.teams);
    const [error, setError] = useState(initialData.error);
    const navigate = useNavigate();

    const deleteTeam = (team) => {
        if (!window.confirm(`Delete the team "${team.name}"? This cannot be undone.`)) return;

        try {
            const nextTeams = teams.filter(({ id }) => id !== team.id);
            saveTeams(nextTeams);
            setTeams(nextTeams);
            setError('');
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? `Could not delete the team: ${saveError.message}`
                    : 'Could not delete the team.',
            );
        }
    };

    return (
        <section className='team-page'>
            <header className='team-page-heading'>
                <p className='team-eyebrow'>Your saved teams</p>
                <h1>Team viewer</h1>
                <p>Select a team preview to expand its Pokémon details.</p>
            </header>

            {error && <p className='team-error team-page-error' role='alert'>{error}</p>}

            <button
                className='team-save-button team-new-button'
                type='button'
                onClick={() => navigate('/teambuilder')}
            >
                + Create a team
            </button>

            {!teams.length && !error && (
                <p className='team-empty-state'>No saved teams yet. Create your first team to see it here.</p>
            )}

            <div className='team-list'>
                {teams.map((team) => (
                    <details className='saved-team' key={team.id}>
                        <summary>
                            <span className='saved-team-title'>
                                <strong>{team.name}</strong>
                                <span>{team.members.length}/6 Pokémon</span>
                            </span>
                            <span className='team-preview'>
                                {team.members.map((member) => (
                                    <span className='team-preview-slot' key={member.id}>
                                        {member.sprite
                                            ? <img src={member.sprite} alt={member.name} />
                                            : <span className='team-preview-empty'>?</span>}
                                    </span>
                                ))}
                            </span>
                            <span className='team-expand-label'>View details</span>
                        </summary>

                        <div className='saved-team-content'>
                            <div className='saved-team-actions'>
                                <button
                                    className='team-secondary-button'
                                    type='button'
                                    onClick={() => navigate(`/teambuilder?edit=${encodeURIComponent(team.id)}`)}
                                >
                                    Edit team
                                </button>
                                <button
                                    className='team-remove-button'
                                    type='button'
                                    onClick={() => deleteTeam(team)}
                                >
                                    Delete team
                                </button>
                            </div>

                            <div className='saved-pokemon-grid'>
                                {team.members.map((member) => (
                                    <article className='saved-pokemon' key={member.id}>
                                        {member.sprite && <img className='saved-pokemon-sprite' src={member.sprite} alt={member.name} />}
                                        <h2>{formatName(member.name)}</h2>
                                        <dl>
                                            <div><dt>Ability</dt><dd>{formatName(member.ability)}</dd></div>
                                            <div><dt>Level</dt><dd>{member.level}</dd></div>
                                            <div><dt>Gender</dt><dd>{member.gender}</dd></div>
                                            <div><dt>Shiny</dt><dd>{member.shiny ? 'Yes' : 'No'}</dd></div>
                                            <div><dt>Tera Type</dt><dd>{formatName(member.teraType)}</dd></div>
                                            <div><dt>Nature</dt><dd>{formatName(member.nature)}</dd></div>
                                        </dl>
                                        <h3>Moves</h3>
                                        <ul className='saved-moves'>
                                            {member.moves.filter(Boolean).map((move, index) => (
                                                <li key={`${move}-${index}`}>{formatName(move)}</li>
                                            ))}
                                            {!member.moves.some(Boolean) && <li>No moves selected</li>}
                                        </ul>
                                        <h3>Stats · Base / IV / EV</h3>
                                        <ul className='saved-stats'>
                                            {[
                                                ['HP', 'hp'],
                                                ['Attack', 'attack'],
                                                ['Defense', 'defense'],
                                                ['Sp. Attack', 'specialAttack'],
                                                ['Sp. Defense', 'specialDefense'],
                                                ['Speed', 'speed'],
                                            ].map(([label, key]) => (
                                                <li key={key}>
                                                    <span>{label}</span>
                                                    <span>
                                                        {member.stats?.[key]?.base ?? 0}
                                                        {' / '}{member.stats?.[key]?.iv ?? 31}
                                                        {' / '}{member.stats?.[key]?.ev ?? 0}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </details>
                ))}
            </div>
        </section>
    );
};

export default TeamViewer;
