import { readFileSync } from 'fs'
import { Run } from './play-game.js'

const log = readFileSync('log.jsonl', 'utf-8')
const runs = log
	.split('\n')
	.filter(line => line.length != 0)
	.map(line => JSON.parse(line) as Run)
	// .filter(run => run.depth == 15)

const endReasons = new Map<String, number>()

for (const run of runs)
{
	if (!endReasons.has(run.endReason))
	{
		endReasons.set(run.endReason, 0)
	}

	endReasons.set(run.endReason, endReasons.get(run.endReason) + 1)
}

for (const [ endReason, count ] of endReasons)
{
	console.log(endReason, count)
}