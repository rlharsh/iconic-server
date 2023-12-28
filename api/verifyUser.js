const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = "iconic";

exports.handler = async function (event, context) {
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
	};

	if (event.httpMethod === "OPTIONS") {
		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({ message: "CORS preflight response" }),
		};
	}

	if (event.httpMethod !== "POST") {
		return {
			statusCode: 405,
			headers,
			body: JSON.stringify({ message: "Method Not Allowed" }),
		};
	}

	const client = new MongoClient(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		const data = JSON.parse(event.body);
		const uid = data; // Extract uid from the request body

		console.log("PASSED UID: ", data);

		await client.connect();
		const db = client.db(dbName);
		const users = db.collection("users");

		const user = await users.findOne({ uid: uid });
		const userExists = user !== null;

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({
				message: "User verification complete",
				userExists,
			}),
		};
	} catch (error) {
		console.error("Error verifying user:", error);
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ message: "Server error", error: error.message }),
		};
	} finally {
		await client.close(); // Ensure the client is closed in the finally block
	}
};
