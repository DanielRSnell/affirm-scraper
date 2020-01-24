const axios = require("axios");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fastcsv = require("fast-csv");
const fs = require("fs");
const ws = fs.createWriteStream("affirm.csv ");
require("events").EventEmitter.defaultMaxListeners = 15;

// Static Storage
const data = [];

// Build Links
async function CreateLinks() {
	const arr = [];
	const main = "https://www.affirm.com/where-to-shop?page=";
	let total = 80;
	for (var i = 0; i < total; i++) {
		const value = i + 1;
		await arr.push(main + value);
	}
	await arr.forEach(async (item, index) => {
		await setTimeout(async () => {
			console.log(`Fetching: ${item}`);
			await start(item).then(async () => {
				if (index + 1 === total) {
					await fastcsv.write(data, { headers: true }).pipe(ws);
					console.log(`Total Results: ${data.length}. 
          
          Orc Says: Job Done.`);
				}
			});
		}, index * 5000);
	});
}

async function start(link) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(link);

	await page.screenshot({
		path: "yoursite.png",
		fullPage: true
	});

	const body = await page.evaluate(async () => {
		const arr = [];

		const links = await document.querySelectorAll(".StoreCard-mobileShrunk--2YRr3");
		const category = await document.querySelectorAll(".StoreCard-category--jcqe5");
		const company = await document.querySelectorAll(".imports-h4--2ySuR");
		const logo = await document.querySelectorAll("img.FitImage-objectFit--27mC_");

		await links.forEach((v, i) => {
			const schema = {
				link: links[i].getAttribute("href"),
				category: category[i].innerText,
				company: company[i].innerText,
				logo: logo[i].getAttribute("src")
			};
			arr.push(schema);
		});

		return arr;
	});

	await body.forEach((item) => {
		data.push(item);
	});
	await browser.close();
	return Promise.resolve();
}

CreateLinks();
