<script lang="ts">
	import { onMount } from 'svelte';
    import type { MovieType } from './types/movie';

	const API_URL = 'http://localhost:8000';

	let movies: MovieType[] = [];
	let newMovie = {
		title: '',
		production: '',
		director: '',
		start_date: ''
	};
	let searchQuery = '';
	let isLoading = true;

	let error: string | null = null;

	// --- Fonctions d'interaction avec l'API ---

	async function fetchMovies() {
		try {
			const response = await fetch(`${API_URL}/movie`);
			if (!response.ok) throw new Error('Erreur réseau lors de la récupération des films.');
			movies = await response.json();
		} catch (e: unknown) {
			if (e instanceof Error) {
				error = e.message;
			} else {
				error = 'Une erreur inconnue est survenue';
			}
		} finally {
			isLoading = false;
		}
	}

	async function searchMovies(event: KeyboardEvent) {
		if (event && event.key !== 'Enter') {
			return;
		}

		if (searchQuery.trim() === '') {
			fetchMovies(); 
			return;
		}
		try {
			isLoading = true;
			const response = await fetch(`${API_URL}/movie/search/${searchQuery}`);
			if (!response.ok) throw new Error('Aucun film trouvé.');
			movies = await response.json();
		} catch (e: unknown) {
			if (e instanceof Error) {
				error = e.message;
			} else {
				error = 'Une erreur inconnue est survenue';
			}
			movies = []; // Vide la liste en cas d'erreur de recherche
		} finally {
			isLoading = false;
		}
	}

	async function createMovie() {
		try {
			const response = await fetch(`${API_URL}/movie`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newMovie)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Erreur lors de la création du film.');
			}
			
			// Réinitialiser le formulaire et rafraîchir la liste
			newMovie = { title: '', production: '', director: '', start_date: '' };
			fetchMovies(); // Rafraîchit la liste complète
		} catch (e: unknown) {
			if (e instanceof Error) {
				error = e.message;
			} else {
				error = 'Une erreur inconnue est survenue';
			}
		}
	}

	async function deleteMovie(id: number) {
		if (!confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) return;

		try {
			const response = await fetch(`${API_URL}/movie/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) throw new Error('Erreur lors de la suppression.');
			movies = movies.filter((movie) => movie.id !== id);
		} catch (e: unknown) {
			if (e instanceof Error) {
				error = e.message;
			} else {
				error = 'Une erreur inconnue est survenue';
			}
		}
	}

	// Charge les films au démarrage du composant
	onMount(fetchMovies);

</script>

<main>
	<h1>🎬 Gestion de Films</h1>

	<section class="card">
		<h2>Ajouter un nouveau film</h2>
		<form on:submit|preventDefault={createMovie}>
			<div class="form-group">
				<input type="text" bind:value={newMovie.title} placeholder="Titre du film" required />
				<input type="text" bind:value={newMovie.production} placeholder="Production" />
				<input type="text" bind:value={newMovie.director} placeholder="Réalisateur" />
				<input type="date" bind:value={newMovie.start_date} placeholder="Date de début"/>
			</div>
			<button type="submit">Ajouter le film</button>
		</form>
	</section>

	<section class="card">
		<h2>Liste des films</h2>
		<div class="search-bar">
			<input type="search" bind:value={searchQuery} on:keypress={searchMovies} placeholder="Rechercher par titre, réal..." />
		</div>
		
		{#if isLoading}
			<p>Chargement...</p>
		{:else if error}
			<p class="error">{error}</p>
		{:else if movies.length === 0}
			<p>Aucun film trouvé.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Titre</th>
						<th>Production</th>
						<th>Réalisateur</th>
						<th>Dates</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each movies as movie (movie.id)}
						<tr>
							<td>{movie.title}</td>
							<td>{movie.production || 'N/A'}</td>
							<td>{movie.director || 'N/A'}</td>
							<td>{movie.start_date?.date || 'N/A'} - {movie.enddate?.date || 'N/A'}</td>
							<td>
								<button class="delete-btn" on:click={() => deleteMovie(movie.id)}>
									Supprimer
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>
</main>

<style>
	:root {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		--primary-color: #3498db;
		--danger-color: #e74c3c;
		--bg-color: #f4f6f8;
		--card-bg: #ffffff;
		--text-color: #333;
		--border-radius: 8px;
	}

	main {
		max-width: 900px;
		margin: 2rem auto;
		padding: 1rem;
		color: var(--text-color);
	}
	
	h1, h2 {
		color: var(--primary-color);
		text-align: center;
	}

	.card {
		background-color: var(--card-bg);
		padding: 1.5rem;
		margin-bottom: 2rem;
		border-radius: var(--border-radius);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.form-group {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}

	input[type='text'], input[type='search'] {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ccc;
		border-radius: var(--border-radius);
		box-sizing: border-box;
	}
	
	button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: var(--border-radius);
		background-color: var(--primary-color);
		color: white;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	button:hover {
		background-color: #2980b9;
	}

	button.delete-btn {
		background-color: var(--danger-color);
	}
	
	button.delete-btn:hover {
		background-color: #c0392b;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
	}

	th, td {
		padding: 0.8rem;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}

	th {
		background-color: #f2f2f2;
	}
	
	.error {
		color: var(--danger-color);
		text-align: center;
		font-weight: bold;
	}
</style>