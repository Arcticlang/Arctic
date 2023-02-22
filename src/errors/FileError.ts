import ArcticError from "./ArcticError";

export default class FileError extends ArcticError {
    constructor(details: string) {
        super("File Error", details, null!, null!);
    }
}