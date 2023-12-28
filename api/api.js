const { MongoClient } = require("mongodb");

const uri =
	"mongodb+srv://ronaldharsh:h6WT4auMa7LHWrdroXTuWzj9zDwXU3dRUNwJztGj9Yrzb3SV9F53pt9JPYDWHTyu@cluster0.xwtwp.mongodb.net/?retryWrites=true&w=majority";
const dbName = "iconic";

exports.handler = async function (event, context) {
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Allow-Methods": "POST, OPTIONS, GET",
	};

	// Immediately return a response for OPTIONS requests (CORS preflight)
	if (event.httpMethod === "OPTIONS") {
		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({ message: "CORS preflight response" }),
		};
	}

	// Initialize MongoDB client outside of try-catch to ensure it's accessible in finally block
	console.log(uri);
	const client = new MongoClient(uri);

	try {
		// Connect to the MongoDB client
		await client.connect();
		const db = client.db(dbName);

		// Parse the request body
		const data = JSON.parse(event.body);
		console.log("OPERATION: ", data.operation);

		if (data.operation === "verifyUser") {
			result = await verifyUser(db, data);
		} else if (data.operation === "createDefaultSettings") {
			await createDefaultSettings(db, data);
			result = { message: "Default settings created" };
		} else if (data.operation === "getSocialLinks") {
			result = await getSocialLinks(db, data);
		} else if (data.operation === "getIsFollowing") {
			result = await getIsFollowing(db, data);
		} else if (data.operation === "getUserVibes") {
			result = await getUserVibes(db, data);
		} else if (data.operation === "getUserProfile") {
			result = await getUserProfile(db, data);
		} else if (data.operation === "createSocialNetworks") {
			await createSocialnetworks(db, data);
			result = { message: "Social networks created" };
		} else if (data.operation === "createNewUser") {
			await createNewUser(db, data);
			result = { message: "New user has been created" };
		} else if (data.operation === "createVibe") {
			await createNewVibe(db, data);
			result = { message: "Created a new vibe" };
		} else if (data.operation === "verifyProfile") {
			result = await verifyProfile(db, data);
		} else {
			console.log("OPERATION: ", data.operation);
			throw new Error("Unknown operation");
		}

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify(result),
		};
	} catch (error) {
		console.error("Error in database operation:", error);
	} finally {
		// Close the MongoDB client
		await client.close();
	}
};

async function createDefaultSettings(db, data) {
	const collection = db.collection("configs");
	await collection.insertOne(data);
	// Additional actions or result handling
}

async function createSocialnetworks(db, data) {
	const collection = db.collection("social");
	await collection.insertOne(data);
	// Additional actions or result handling
}

async function verifyUser(db, data) {
	const collection = db.collection("users");
	const user = await collection.findOne({ uid: data.uid });
	const userExists = user !== null;

	return {
		message: "User verification complete",
		userExists,
	};
}

async function getSocialLinks(db, data) {
	const collection = db.collection("social");
	const socialLinks = await collection.findOne({ uid: data.uid });
	const linksExists = socialLinks !== null;

	return {
		message: "Collected users social links",
		linksExists,
		socialLinks,
	};
}

async function getIsFollowing(db, data) {
	const collection = db.collection("users");
	const userInformation = await collection.findOne({ uid: data.current });

	if (userInformation && Array.isArray(userInformation.following)) {
		const isFollowing = userInformation.following.some(
			(following) => following.uid === data.target
		);

		if (isFollowing) {
			return {
				message: "User following return",
				following: false,
			};
		} else {
			return {
				message: "User following return",
				following: false,
			};
		}
	} else {
		console.log(
			`User ${data.current} does not have a following list or does not exist`
		);
	}
}

async function getUserVibes(db, data) {
	const collection = db.collection("vibes");
	const userVibes = await collection.findOne({ uid: data.uid });
	const vibesExists = userVibes !== null;

	return {
		message: "User vibes have been returned",
		userVibes,
		vibesExists,
	};
}

async function getUserProfile(db, data) {
	const collection = db.collection("users");
	const profileInfo = await collection.findOne({ uid: data.uid });
	const profileExists = profileInfo !== null;

	return {
		message: "User profile complete",
		profileInfo,
		profileExists,
	};
}

async function verifyProfile(db, data) {
	const collection = db.collection("users");
	const user = await collection.findOne({ customURL: data.customURL });
	const userExists = user !== null;

	return {
		message: "User verification complete",
		user,
		userExists,
	};
}

async function createNewUser(db, data) {
	const collection = db.collection("users");
	await collection.insertOne(data);
}

async function createNewVibe(db, data) {
	const collection = db.collection("vibes");
	await collection.insertOne(data);
}
