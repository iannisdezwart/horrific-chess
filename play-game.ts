import { StockfishInstance } from 'node-stockfish'
import { ChessBoard, Colour } from './chess.js'

export interface Run
{
	board: string
	turnNumber: number
	endReason: string
	depth: number
}

export const playGame = async (depth: number): Promise<Run> =>
{
	console.log('playGame()')
	const engine = StockfishInstance.getInstance()
	console.log('engine:', engine.id)

	const board = ChessBoard.generateDefault()
	board.print()

	const findWorstMove = () => new Promise<void>((resolve, reject) =>
	{
		engine.setBoardstateByMoves(board.boardStateUCI())

		// Start analysing the position.

		engine.startAnalysing({
			// Include all lines in the analysis.
			// The number of lines will be way below 100, so this is safe.
			lines: 100
		})

		// Listen for analysis updates.

		engine.onAnalysisData(analysisData =>
		{
			if (analysisData.noLegalMoves)
			{
				console.log(`No legal moves!`)
				engine.terminate()
				reject()
				return
			}

			if (analysisData.depth < depth)
			{
				// Wait until we have enough depth.

				return
			}

			// Stop the analysis.

			engine.stopAnalysing()

			// Find the worst move.

			if (process.env.DEBUG == 'true')
			{
				console.error(analysisData.lines)
			}

			const score = analysisData.lines[analysisData.lines.length - 1].score.toString()
			const worstLines = analysisData.lines.filter(line => line.score.toString() == score)
			const randomIndex = Math.floor(Math.random() * worstLines.length)
			const randomWorstMove = worstLines[randomIndex].moves[0]

			console.log(`Board state: ${ board.boardStateUCI() }`)
			console.log(`Move ${ board.turnNumber }`)
			console.log(`=========================`)
			console.log(analysisData.lines.map(line => `* ${ line.moves[0] }: ${ line.score }`).join('\n'))
			console.log(`Worst move: ${ randomWorstMove }: ${ score }`)
			console.log(`${ board.turn == Colour.Black ? 'Black' : 'White' } moved a piece`)

			// Perform the move.

			board.performUCIMove(randomWorstMove)
			board.print()

			// Handle end of the game.

			if (board.ended())
			{
				console.log(board.endReason())
				engine.terminate()
				reject()
				return
			}

			resolve()
		})
	})

	while (true)
	{
		try
		{
			await findWorstMove()
		}
		catch
		{
			// The game is over.

			break
		}
	}

	return ({
		board: board.boardStateUCI(),
		turnNumber: board.turnNumber,
		endReason: board.endReason(),
		depth
	})
}