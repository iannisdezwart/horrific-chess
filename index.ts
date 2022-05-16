import { StockfishInstance } from 'node-stockfish'
import { ChessBoard } from './chess.js'

const board = ChessBoard.generateDefault()
board.print()

const engine = StockfishInstance.getInstance()

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
		if (analysisData.checkmate)
		{
			console.log(`it's checkmate!`)
			engine.terminate()
			reject()
			return
		}

		if (analysisData.draw)
		{
			console.log(`it's a draw!`)
			engine.terminate()
			reject()
			return
		}

		if (analysisData.depth < 10)
		{
			// Wait until we have enough depth.

			return
		}

		// Stop the analysis.

		engine.stopAnalysing()

		// Find the worst move.

		const worstLine = analysisData.lines[analysisData.lines.length - 1]
		const worstMove = worstLine.moves[0]

		console.log(`Board state: ${ board.boardStateUCI() }`)
		console.log(`Move ${ board.moves.length }`)
		console.log(`=========================`)
		console.log(`Worst move: ${ worstMove }`)
		console.log(`Evaluation: ${ worstLine.score.toString() }`)

		// Perform the move.

		board.performUCIMove(worstMove)
		board.print()

		// Stop the game if there is insufficient material.

		if (board.insufficientMaterial())
		{
			console.log(`Insufficient material!`)
			engine.terminate()
			reject()
			return
		}

		resolve()
	})
})

const main = async () =>
{
	while (true)
	{
		try
		{
			await findWorstMove()
		}
		catch
		{
			// The game is over.
		}
	}
}

main()