const { MongoClient } = require("mongodb");

const rawPassword = process.env.MONGO_URI_PASS;
const encodedPassword = encodeURIComponent(rawPassword);
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
	const client = new MongoClient(uri);

	try {
		// Connect to the MongoDB client
		await client.connect();
		const db = client.db(dbName);

		// Parse the request body
		const data = JSON.parse(event.body);

		console.log(data.operation);

		if (data.operation === "verifyUser") {
			result = await verifyUser(db, data);
		} else if (data.operation === "verifyAdminUser") {
			result = await verifyAdminUser(db, data);
		} else if (data.operation === "getUserConfig") {
			result = await getUserConfig(db, data);
		} else if (data.operation === "updateLink") {
			result = await updateLink(db, data);
		} else if (data.operation === "createDefaultSettings") {
			await createDefaultSettings(db, data);
			result = { message: "Default settings created", created: true };
		} else if (data.operation === "createCollection") {
			await createCollection(db, data);
			result = { message: "Default collection created" };
		} else if (data.operation === "getSocialLinks") {
			result = await getSocialLinks(db, data);
		} else if (data.operation === "getCollections") {
			result = await getCollections(db, data);
		} else if (data.operation === "getIsFollowing") {
			result = await getIsFollowing(db, data);
		} else if (data.operation === "getData") {
			result = await getData(db, data);
		} else if (data.operation === "getUserVibes") {
			result = await getUserVibes(db, data);
		} else if (data.operation === "getUserProfile") {
			result = await getUserProfile(db, data);
		} else if (data.operation === "createSocialNetworks") {
			result = await createSocialnetworks(db, data);
		} else if (data.operation === "createSocialLink") {
			result = await createSocialLink(db, data);
		} else if (data.operation === "createNewUser") {
			await createNewUser(db, data);
			result = { message: "New user has been created" };
		} else if (data.operation === "createVibe") {
			await createNewVibe(db, data);
			result = { message: "Created a new vibe" };
		} else if (data.operation === "verifyProfile") {
			result = await verifyProfile(db, data);
		} else if (data.operation === "putSocials") {
			result = await putSocials(db, data);
		} else if (data.operation === "verifyUserName") {
			result = await verifyUserName(db, data);
		} else if (data.operation === "getProfileData") {
			result = await getProfileData(db, data);
		} else if (data.operation === "getMediaLibrary") {
			result = await getMediaLibrary(db, data);
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
		// await client.close();
		await client.close();
	}
};

async function createDefaultSettings(db, data) {
	const collection = db.collection("configs");
	await collection.insertOne(data);

	const userName = {
		uid: data.uid,
		username: data.account.username,
	};

	const userCollection = db.collection("alias");
	await userCollection.insertOne(userName);
}

async function createCollection(db, data) {
	const collection = db.collection("collections");
	await collection.insertOne(data);
}

async function createSocialnetworks(db, data) {
	const collection = db.collection("social");
	await collection.insertOne(data);
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

async function verifyAdminUser(db, data) {
	const collection = db.collection("configs");
	const user = await collection.findOne({ uid: data.uid });
	const userExists = user !== null;

	return {
		message: "User verification complete",
		userExists,
	};
}

async function putSocials(db, data) {
	try {
		const filter = {
			uid: data.uid,
			"collections.key": data.networks.key,
		};

		const updateDocument = {
			$set: {
				"collections.$.links": data.networks.links,
			},
		};

		let result = await db
			.collection("collections")
			.updateOne(filter, updateDocument);

		console.log(result);
		return;
	} catch (error) {
		console.error("Error updating social links: ", error);
	}
}

async function updateLink(db, data) {
	const filter = {
		uid: data.uid,
		"collections.key": data.link.collection,
	};
	const updateDocument = {
		$set: {
			"collections.$.links.$[linkElem]": data.link,
		},
	};
	const options = {
		arrayFilters: [{ "linkElem.key": data.link.key }],
	};
	let result = await db
		.collection("collections")
		.updateOne(filter, updateDocument, options);

	console.log(result);
	return;
}

async function createSocialLink(db, data) {
	try {
		const filter = {
			uid: data.uid,
			"collections.key": data.collection,
		};

		const updateDocument = {
			$push: {
				"collections.$.links": data,
			},
		};

		let result = await db
			.collection("collections")
			.updateOne(filter, updateDocument);

		console.log(result);
	} catch (error) {
		console.log("Error creating link:", error);
	}
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

async function getMediaLibrary(db, data) {
	const collection = db.collection("media");
	const mediaLibrary = await collection.findOne({ uid: data.uid });
	const libraryExists = mediaLibrary !== null;

	return {
		message: "Message collection complete",
		libraryExists,
		mediaLibrary,
	};
}

async function getCollections(db, data) {
	console.log(data);
	const collection = db.collection("collections");
	const collectionData = await collection.findOne({ uid: data.uid });
	const collectionExists = collectionData !== null;

	console.log(collectionData);

	return {
		message: "Collections obtained",
		collectionExists,
		collectionData,
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

async function getProfileData(db, data) {
	console.log(data);
}

async function getData(db, data) {
	const usersCollection = db.collection("users");
	const socialCollection = db.collection("social");
	const vibesCollection = db.collection("vibes");
	const configsCollection = db.collection("configs");
	const collectionsCollection = db.collection("collections");

	const filter = {
		uid: data.uid,
	};

	const [userProfile, socialLinks, userVibes, userConfig, collections, links] =
		await Promise.all([
			usersCollection.findOne({ uid: data.uid }),
			socialCollection.findOne({ uid: data.uid }),
			vibesCollection.findOne({ uid: data.uid }),
			configsCollection.findOne({ uid: data.uid }),
			collectionsCollection.findOne({ uid: data.uid }),
		]);

	const combinedData = {
		userData: userProfile || {},
		annoucementData: userVibes || {},
		configData: userConfig || {},
		collectionData: collections || {},
		linksData: links || {},
	};

	return {
		combinedData,
	};
}

async function getUserConfig(db, data) {
	const collection = db.collection("configs");
	const userConfig = await collection.findOne({ uid: data.uid });
	const userExists = userConfig !== null;

	return {
		message: "Retreived user configuration",
		userConfig,
		userExists,
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

async function verifyUserName(db, data) {
	try {
		const collection = db.collection("alias");
		const user = await collection.findOne({ username: data.username });
		const userExists = user !== null;

		return {
			message: "User location complete",
			user,
			userExists,
		};
	} catch (error) {
		console.error("Error verifying username:", error);
	}
}

async function createNewUser(db, data) {
	const collection = db.collection("users");
	await collection.insertOne(data);
}

async function createNewVibe(db, data) {
	const collection = db.collection("vibes");
	await collection.insertOne(data);
}
