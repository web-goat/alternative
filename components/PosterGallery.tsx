import fs from "fs";
import path from "path";
import { PosterGrid } from "./PosterGrid";

export function PosterGallery() {
    const postersDir = path.join(process.cwd(), "public", "posters");

    const posters = fs
        .readdirSync(postersDir)
        .filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file))
        .map((file) => ({
            src: `/posters/${file}`,
            title: file
                .replace(/\.(png|jpg|jpeg|webp)$/i, "")
                .replace(/ChatGPT Image 3\. Mai 2026, /, "")
                .replaceAll("_", ":"),
        }));

    return <PosterGrid posters={posters} />;
}