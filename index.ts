import { playGame } from './play-game.js'
import { appendFileSync } from 'fs'

const DEPTH = +process.argv[2] || 2

const main = async () =>
{
	while (true)
	{
		const res = await playGame(DEPTH)
		appendFileSync('log.jsonl', JSON.stringify(res) + '\n')
		console.log(res)
	}
}

main()