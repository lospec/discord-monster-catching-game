import glob from "glob";
import fs from 'fs';
import randomElement from "../utilities/random-element.js";
import { MonsterGameConfig } from "../bot.js";

//constants
const GANGS = fs.readFileSync('_text/gang-names.txt', 'utf8').split(/[\r\n]+/);
const RAN_AWAY_PHRASES = fs.readFileSync('_text/ran-away-phrases.txt', 'utf8').split(/[\r\n]+/);
const RESPONSES = {};

//load all txt files in _text starting with response- 
glob.sync('_text/response-*.txt')
	.forEach(r => {
		RESPONSES[r] = fs.readFileSync(r, 'utf8').split(/[\r\n]+/);
	});


export function getResponseText(responseName, userName, monsterName) {
	return randomElement(RESPONSES['_text/response-'+responseName+'.txt'])
		.replace(/%M/g, monsterName)
		.replace(/%U/g, userName)
		.replace(/%G/g, randomElement(GANGS))
		.replace(/%B/g, MonsterGameConfig.get('ballName') || 'BALL')
		.replace(/%R/g, randomElement(RAN_AWAY_PHRASES) || 'ran')
}