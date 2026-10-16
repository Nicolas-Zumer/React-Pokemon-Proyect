import { useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import PokemonAdd from './PokemonAdd';
import { createEmptyPokemon, loadTeams, saveTeams } from '../utils/teamStorage';

const createNewTeam = () => ({
    id: uuidv4(),
    name: '',
    members: [createEmptyPokemon()],
});

const PokemonTeamCreator = () => {
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const [initialData] = useState(() => {
        try {
            const teams = loadTeams();
            const teamToEdit = editId ? teams.find((team) => team.id === editId) : null;
            return {
                team: teamToEdit ?? createNewTeam(),
                error: editId && !teamToEdit
                    ? 'That saved team could not be found. You can create a new team instead.'
                    : '',
            };
        } catch (error) {
            return {
                team: createNewTeam(),
                error: error instanceof Error
                    ? `Could not read saved teams: ${error.message}`
                    : 'Could not read saved teams.',
            };
        }
    });
    const methods = useForm({ defaultValues: initialData.team, mode: 'onSubmit' });
    const {
        control,
        formState: { errors, isSubmitting },
        handleSubmit,
        register,
    } = methods;
    const { append, fields, remove } = useFieldArray({
        control,
        name: 'members',
        keyName: 'fieldKey',
    });
    const navigate = useNavigate();
    const [pageError, setPageError] = useState(initialData.error);

    const onSubmit = (values) => {
        try {
            const teams = loadTeams();
            const existingTeam = teams.find((team) => team.id === values.id);
            const savedTeam = {
                ...values,
                name: values.name.trim(),
                createdAt: existingTeam?.createdAt ?? new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const nextTeams = existingTeam
                ? teams.map((team) => team.id === savedTeam.id ? savedTeam : team)
                : [...teams, savedTeam];

            saveTeams(nextTeams);
            navigate('/teamviewer');
        } catch (error) {
            setPageError(
                error instanceof Error
                    ? `Could not save the team: ${error.message}`
                    : 'Could not save the team.',
            );
        }
    };

    return (
        <section className='team-page'>
            <header className='team-page-heading'>
                <p className='team-eyebrow'>Pokémon team builder</p>
                <h1>{editId ? 'Edit your team' : 'Create a team'}</h1>
                <p>Build a Gen 9 team with Pokémon data and learnsets loaded from PokéAPI.</p>
            </header>

            {pageError && <p className='team-error team-page-error' role='alert'>{pageError}</p>}

            <FormProvider {...methods}>
                <form className='team-form' onSubmit={handleSubmit(onSubmit)}>
                    <label className='team-name-field'>
                        Team name
                        <input
                            placeholder='For example, Paldea adventure'
                            {...register('name', {
                                required: 'Give your team a name.',
                                maxLength: { value: 40, message: 'Team names can be up to 40 characters.' },
                            })}
                        />
                        {errors.name && <span className='team-error'>{errors.name.message}</span>}
                    </label>

                    <div className='team-members'>
                        {fields.map((field, index) => (
                            <PokemonAdd
                                key={field.fieldKey}
                                index={index}
                                canRemove={fields.length > 1}
                                onRemove={() => remove(index)}
                            />
                        ))}
                    </div>

                    {fields.length < 6 && (
                        <button
                            className='team-secondary-button'
                            type='button'
                            onClick={() => append(createEmptyPokemon())}
                        >
                            + Add Pokémon ({fields.length}/6)
                        </button>
                    )}

                    <div className='team-form-actions'>
                        <button className='team-save-button' type='submit' disabled={isSubmitting}>
                            {editId ? 'Save changes' : 'Save team'}
                        </button>
                        {editId && (
                            <button
                                className='team-cancel-button'
                                type='button'
                                onClick={() => navigate('/teamviewer')}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </section>
    );
};

export default PokemonTeamCreator;
