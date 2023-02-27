import { runFile } from ".";

function main() {
	process.argv.splice(0, 2);
	const file = process.argv[0];
	runFile(file);
}

main();