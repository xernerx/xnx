import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';

const shell = promisify(exec);

const data = {
	name: (
		await inquirer.prompt({
			name: 'name',
			type: 'input',
			message: 'What is the bot name?',
		})
	).name,
	version: (
		await inquirer.prompt({
			name: 'version',
			type: 'input',
			message: 'What is the bot version?',
		})
	).version,
	description: (
		await inquirer.prompt({
			name: 'description',
			type: 'input',
			message: 'What is this bot about?',
		})
	).description,
	type: (
		await inquirer.prompt({
			name: 'type',
			type: 'list',
			message: 'What module type would you like to use?',
			choices: ['CommonJS', 'ES Modules'],
		})
	).type,
	language: (
		await inquirer.prompt({
			name: 'language',
			type: 'list',
			message: 'What language would you like to use?',
			choices: ['JavaScript', 'TypeScript'],
		})
	).language,
	github: (
		await inquirer.prompt({
			name: 'github',
			type: 'input',
			message: 'Link to the github repository.',
		})
	).github,
	handlers: (
		await inquirer.prompt({
			name: 'handlers',
			type: 'checkbox',
			message: 'Which handlers would you like to use?',
			choices: [
				'MessageCommandHandler',
				'SlashCommandHandler',
				'ContextCommandHandler',
				'EventHandler',
				'InhibitorHandler',
			],
		})
	).handlers,
	token: (
		await inquirer.prompt({
			name: 'token',
			type: 'input',
			message:
				'Insert the bot token here, (There is no server side data sharing, everything is running on your machine!)',
		})
	).token,
	extensions: (
		await inquirer.prompt({
			name: 'extensions',
			type: 'checkbox',
			message: 'Want to install any additional extensions?',
			choices: ['xernerx-commands', 'xernerx-poster', 'xernerx-language', 'xernerx-database'],
		})
	).extensions,
};

const { create } = await inquirer.prompt({
	name: 'create',
	type: 'list',
	message: 'Create a new folder?',
	choices: ['yes', 'no'],
});

if (create === 'yes') {
	try {
		await createDirectories();
	} catch (error) {
		console.error(`An error occurred trying to make a new project! ${error}`);
	}
} else {
	console.log('assign folder');
}
console.info('Done!');
/**
 * name
 * version
 * handlers
 * type
 * language
 * token,
 * extensions
 */

async function createDirectories() {
	console.info('Setting up directories');

	if (data.handlers.includes('MessageCommandHandler')) {
		await shell(`mkdir ${data.name}\\commands\\message`);
		console.info(`Created ${data.name}\\commands\\message`);
	}
	if (data.handlers.includes('SlashCommandHandler')) {
		await shell(`mkdir ${data.name}\\commands\\slash`);
		console.info(`Created ${data.name}\\commands\\slash`);
	}
	if (data.handlers.includes('ContextCommandHandler')) {
		await shell(`mkdir ${data.name}\\commands\\context`);
		console.info(`Created ${data.name}\\commands\\context`);
	}

	if (data.handlers.includes('EventHandler')) {
		await shell(`mkdir ${data.name}\\events`);
		console.info(`Created ${data.name}\\events`);
	}
	if (data.handlers.includes('InhibitorHandler')) {
		await shell(`mkdir ${data.name}\\inhibitors`);
		console.info(`Created ${data.name}\\inhibitors`);
	}

	await shell(`mkdir ${data.name}\\data\\config`);
	await shell(`echo export default {} > ${data.name}\\data\\config\\config.js`);
	console.info(`Created ${data.name}\\data\\config\\config.json`);

	await shell(`echo ${createPackage()} > ${data.name}\\package.json`);
	console.info(`Created ${data.name}\\package.json`);

	console.log(createClient());

	await shell(`echo ${createClient()} > ${data.name}\\main.js`);
	console.info(`Created ${data.name}\\main.js`);
}

function createPackage() {
	const dependencies: Record<string, string> = { xernerx: 'latest' };

	data.extensions.map((e: string) => (dependencies[e] = 'latest'));

	return JSON.stringify({
		name: `${data.name.toLowerCase()}`,
		description: `${data.description}`,
		version: `${data.version}`,
		main: `main.js`,
		type: data.type === 'CommonJS' ? 'commonjs' : 'module',
		language: data.language,
		scripts: {
			start: `npm i && npm fund && node main.js`,
		},
		repository: {
			type: 'git',
			url: data.github ? `git+${data.github}.git` : '',
		},
		keywords: ['xernerx', ...data.extensions],
		bugs: {
			url: data.github ? `${data.github}/issues` : '',
		},
		homepage: data.github ? `${data.github}#readme` : '',
		dependencies,
	});
}

function createClient() {
	let client = '';
	if (data.type === 'CommonJS')
		client = `
    const { XernerxClient, GatewayIntentBits} = require('xernerx');
    const config = require('./data/config/config.json');
    `;

	if (data.type === 'ES Modules')
		client = `
    import { XernerxClient, GatewayIntentBits} from 'xernerx';
    import config from './data/config/config.json';
    `;

	client += `
    class Client extends XernerxClient {
        constructor() {
            super({
                intents: [ /*Insert all needed intents here using \`GatewayIntentBits\`*/ ]
            }, {
                ownerId: [ /* Add all bot owner Discord ID's here */ ],
                log: {
                    ready: true
                }
            }, config);
        
            this.register(config.token);
        }
    }
    `;

	return client;
}
