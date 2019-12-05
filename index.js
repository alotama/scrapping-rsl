require('dotenv').config()

const puppeteer = require("puppeteer");
const express = require("express");
const mongoose = require('mongoose');
const mongoUrl = process.env.MONGO_DB_URL || 'mongodb://127.0.0.1:27017/raid-shadow-legends';
const PORT = process.env.PORT || 4000

const app = express();

app.listen(PORT, function() {
	console.log(`Example app listening on port ${PORT}!`);
});

mongoose.connect(mongoUrl, { useNewUrlParser: true });
var db = mongoose.connection;

!db ? console.log("Error connecting db") : console.log("Db connected successfully");

app.get("/", function(req, res) {
  res.json({
    status: 'API Its Working',
    message: 'Welcome to RESTHub crafted with love!'
  });
})

app.post("/", function (req, res) {
	const parentRow =
		"body > div.wrapper.default > div.main.main-raised > div > div > article > div.ng-scope > champion-list > div > div:nth-child(2) > div:nth-child(2)";

	let scrape = async () => {
		// Actual Scraping goes Here...
		// const browser = await puppeteer.launch({ headless: false });
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto("https://raid-codex.com/champions/#!?filter=e30%3D", [
			1000,
			"domcontentloaded"
		]);
		await page.waitFor(2000);
		await page.waitForSelector(parentRow, 150000);
		const totalChampions = await page.$eval(parentRow, el => el.childElementCount);

		var championList = [];
		for (var i = 1; i <= totalChampions; i++) {
			console.log(`Process: ${i} of ${totalChampions}` )
			let elementToClick = `body > div.wrapper.default > div.main.main-raised > div > div > article > div.ng-scope > champion-list > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(${i}) > div > div > div:nth-child(1) > a > img`;

			await page.waitForSelector(elementToClick, 150000);
			await page.click(elementToClick);
			await page.waitFor(2000);

			const result = await page.evaluate(() => {
				let name = document.querySelector("#primary > div.container > div > div > h1")
					.innerText;
				let health = document.querySelector(
					"body > div.wrapper.default > div.main.main-raised > div > div > article > div:nth-child(2) > div > div > div:nth-child(3) > div > div.col-xs-12.champion-view-characteristics > div:nth-child(1) > div:nth-child(2)"
				).innerText;
				let attack = document.querySelector(
					"body > div.wrapper.default > div.main.main-raised > div > div > article > div:nth-child(2) > div > div > div:nth-child(3) > div > div.col-xs-12.champion-view-characteristics > div:nth-child(2) > div:nth-child(2)"
				).innerText;
				let defense = document.querySelector(
					"body > div.wrapper.default > div.main.main-raised > div > div > article > div:nth-child(2) > div > div > div:nth-child(3) > div > div.col-xs-12.champion-view-characteristics > div:nth-child(3) > div:nth-child(2)"
				).innerText;
				let criticalRate = document.querySelector(
					"body > div.wrapper.default > div.main.main-raised > div > div > article > div:nth-child(2) > div > div > div:nth-child(3) > div > div.col-xs-12.champion-view-characteristics > div:nth-child(4) > div:nth-child(2)"
				).innerText;
				let criticalDamage = document.querySelector(
					"body > div.wrapper.default > div.main.main-raised > div > div > article > div:nth-child(2) > div > div > div:nth-child(3) > div > div.col-xs-12.champion-view-characteristics > div:nth-child(5) > div:nth-child(2)"
				).innerText;
				let speed = document.querySelector(
					"body > div.wrapper.default > div.main.main-raised > div > div > article > div:nth-child(2) > div > div > div:nth-child(3) > div > div.col-xs-12.champion-view-characteristics > div:nth-child(6) > div:nth-child(2)"
				).innerText;
				let resistance = document.querySelector(
					"body > div.wrapper.default > div.main.main-raised > div > div > article > div:nth-child(2) > div > div > div:nth-child(3) > div > div.col-xs-12.champion-view-characteristics > div:nth-child(7) > div:nth-child(2)"
				).innerText;
				let accuracy = document.querySelector(
					"body > div.wrapper.default > div.main.main-raised > div > div > article > div:nth-child(2) > div > div > div:nth-child(3) > div > div.col-xs-12.champion-view-characteristics > div:nth-child(8) > div:nth-child(2)"
				).innerText;
				let rarity = document.querySelector("body > div.wrapper.default > div.main.main-raised > div > div > article > div:nth-child(2) > div > div > div:nth-child(2) > div > div.col-xs-12.champion-view-info > div:nth-child(1) > div:nth-child(2) > span").innerText
				let faction = document.querySelector("body > div.wrapper.default > div.main.main-raised > div > div > article > div:nth-child(2) > div > div > div:nth-child(2) > div > div.col-xs-12.champion-view-info > div:nth-child(2) > div:nth-child(2) > a").innerText
				let type = document.querySelector("body > div.wrapper.default > div.main.main-raised > div > div > article > div:nth-child(2) > div > div > div:nth-child(2) > div > div.col-xs-12.champion-view-info > div:nth-child(4) > div:nth-child(2)").innerText
				let element = document.querySelector("body > div.wrapper.default > div.main.main-raised > div > div > article > div:nth-child(2) > div > div > div:nth-child(2) > div > div.col-xs-12.champion-view-info > div:nth-child(5) > div:nth-child(2)").innerText

				let championModel = {
					name: name,
					rarity: rarity,
					faction: faction,
					type: type,
					element: element,
					stats: {
						health: health,
						attack: attack,
						defense: defense,
						criticalRate: criticalRate,
						criticalDamage: criticalDamage,
						speed: speed,
						resistance: resistance,
						accuracy: accuracy
					}
				}

				
				return championModel;
			});
			console.log('championModel ->', result)

			championList.push(result);
			page.goBack([5000, "domcontentloaded"]);
		}

		browser.close();
		return championList;
	};

	scrape().then(value => {    
		Champion.create(value, function (err, small) {
			if (err) return handleError(err);
			// saved!
		});
		res.send(value);
		return;
	});
});