import { Client, Query, ID, TablesDB } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client();

client
	.setEndpoint(ENDPOINT) // Your API Endpoint
	.setProject(PROJECT_ID); // Your project ID

const tablesDB = new TablesDB(client);

// functions takes in 2 parameters i.e. searchTerm and movie
export const updateSearchCount = async (searchTerm, movie) => {
	// 1. use appwrite endpoint to check if a document/searchTerm already exists in database
	try {
		const result = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: TABLE_ID,
			queries: [Query.equal('searchTerm', searchTerm)],
		});

		// 2. if it does, update the count by 1
		if (result.rows.length > 0) {
			const doc = result.rows[0];

			await tablesDB.updateRow({
				databaseId: DATABASE_ID,
				tableId: TABLE_ID,
				rowId: doc.$id,
				data: {
					count: doc.count + 1,
				},
			});
			// 3. if it doesn't, create a new document with count set to 1
		} else {
			await tablesDB.createRow({
				databaseId: DATABASE_ID,
				tableId: TABLE_ID,
				rowId: ID.unique(),
				data: {
					searchTerm,
					count: 1,
					movie_id: movie.id,
					poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
				},
			});
		}
	} catch (error) {
		console.log(error);
	}
};

export const getTrendingMovies = async () => {
	try {
		const result = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: TABLE_ID,
			queries: [Query.orderDesc('count'), Query.limit(5)],
		});
		return result.rows;
	} catch (error) {
		console.error(error);
	}
};
