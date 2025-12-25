// node scripts/print-tree.mjs . 10 > tree.txtで実行して、プロジェクトのディレクトリ構造をtree.txtに保存するスクリプト
// scripts/print-tree.mjs
import fs from "node:fs";
import path from "node:path";

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const maxDepth = Number(process.argv[3] ?? 10);

const ignore = new Set([
    "node_modules", ".git", "dist", "build", "coverage",
    ".next", ".turbo", ".DS_Store"
]);

function walk(dir, depth, prefix = "") {
    if (depth > maxDepth) return "";
    const entries = fs.readdirSync(dir, { withFileTypes: true })
        .filter(e => !ignore.has(e.name))
        .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));

    let out = "";
    entries.forEach((e, i) => {
        const last = i === entries.length - 1;
        const pointer = last ? "└─ " : "├─ ";
        out += `${prefix}${pointer}${e.name}\n`;
        if (e.isDirectory()) {
            const nextPrefix = prefix + (last ? "   " : "│  ");
            out += walk(path.join(dir, e.name), depth + 1, nextPrefix);
        }
    });
    return out;
}

process.stdout.write(`${path.basename(root)}\n` + walk(root, 1));
