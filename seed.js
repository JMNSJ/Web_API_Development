const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const fs = require("fs");
const path = require("path");
require("dotenv").config();

const seedPath = path.join(__dirname, "seed.json");

const seedData = JSON.parse(
    fs.readFileSync(seedPath, "utf8")
);

const uri = process.env.MONGODB_URI;


async function seedDatabase() {

    try {

        if (!uri) {
            console.log("❌ MONGODB_URI is missing in .env");
            process.exit(1);
        }


        console.log("Connecting to MongoDB...");

        await mongoose.connect(uri);


        console.log("✅ MongoDB connected");


        const db = mongoose.connection.db;


        for (const [collectionName, documents] of Object.entries(seedData)) {


            if (!Array.isArray(documents)) {
                continue;
            }


            console.log(`Clearing ${collectionName} collection...`);

            await db
                .collection(collectionName)
                .deleteMany({});


            console.log(`Inserting ${documents.length} documents...`);


            if (documents.length > 0) {

                await db
                    .collection(collectionName)
                    .insertMany(documents);

            }


            console.log(
                `✅ Imported ${documents.length} documents into ${collectionName}`
            );

        }


        console.log("🎉 Database seeding completed");


    } catch(error) {

        console.error(
            "❌ Seeding failed:",
            error.message
        );

    } finally {

        await mongoose.disconnect();

        console.log("MongoDB connection closed");

    }

}


seedDatabase();