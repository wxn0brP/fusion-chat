import hub from "../../../hub";
hub("mess/format/list");

interface ListChild {
    line: string;
    lvl: number;
}

const format_list = {
    calculateLevels(lines: string[]) {
        const result = [];
        let spacePerLvl = null;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine === "") {
                result.push({ line, lvl: 0 });
                return;
            }

            const spaces = line.length - line.trimStart().length;

            if (spacePerLvl === null) {
                if (index > 0 && spaces > 0) {
                    const prevSpaces = lines[index - 1].length - lines[index - 1].trimStart().length;
                    if (spaces > prevSpaces) {
                        spacePerLvl = spaces - prevSpaces;
                    }
                }
            }

            if (spacePerLvl !== null && spaces % spacePerLvl !== 0) {
                const fixedSpaces = Math.round(spaces / spacePerLvl) * spacePerLvl;
                result.push({ line, lvl: fixedSpaces / spacePerLvl });
            } else {
                const lvl = spacePerLvl ? spaces / spacePerLvl : (spaces > 0 ? 1 : 0);
                result.push({ line, lvl });
            }
        });

        return result;
    },

    buildTree(linesWithLevels: ListChild[]) {
        const listItemRegex = /^(?:[-*]|\d+[.)]?|[a-zA-Z][.)])\s/;
        const root = [];
        const stack = [{ children: root, lvl: -1 }];

        function getBulletType(line: string) {
            const trimmed = line.trim();
            if (/^[-*]\s/.test(trimmed)) return "bullet";
            if (/^\d[.)]?\s/.test(trimmed)) return "decimal";
            if (/^[a-z][.)]?\s/.test(trimmed)) return "lower-alpha";
            if (/^[A-Z][.)]?\s/.test(trimmed)) return "upper-alpha";
            return null;
        }

        linesWithLevels.forEach(({ line, lvl }) => {
            const trimmedLine = line.trim();
            const isListItem = listItemRegex.test(trimmedLine);
            const bulletType = isListItem ? getBulletType(trimmedLine) : null;

            const node = { line, children: [], bulletType };

            while (stack.length > 0 && stack[stack.length - 1].lvl >= lvl) {
                stack.pop();
            }

            stack[stack.length - 1].children.push(node);
            stack.push({ ...node, lvl });
        });

        return root;
    },

    treeToHtml(tree: ListChild[], marginValue: number, marginUnits: string) {
        let html = "";
        const listMapOl = ["decimal", "lower-alpha", "upper-alpha", "lower-roman", "upper-roman"];
        let listEnd = true;

        function processNode(node, lvl = 0) {
            if (node.bulletType === null) {
                html += node.line.trim() + "<br />";
                listEnd = true;
            } else {
                const listTag = listMapOl.includes(node.bulletType) ? "ol" : "ul";
                const [, ...content] = node.line.trim().split(/\s+/);
                if (listEnd) html += `<${listTag} style="list-style-type: ${node.bulletType};">`;
                html += `<li style="margin-left: ${marginValue * (lvl + 1)}${marginUnits}; list-style-type: ${node.bulletType};">${content}</li>`;

                if (node.children.length > 0) {
                    listEnd = true;
                    node.children.forEach((child: ListChild) => {
                        processNode(child, lvl + 1);
                    });
                    listEnd = false;
                }

                if (listEnd) html += `</${listTag}>`;
                listEnd = false;
            }
        }

        tree.forEach(node => {
            processNode(node);
        });

        return html;
    },

    cpu(text: string, marginValue: number = 0, marginUnits: string = "") {
        const lines = text.split(/\n|\<br\>|\<br\/\>|\<br \/>/);
        const levels = format_list.calculateLevels(lines);
        const tree = format_list.buildTree(levels);
        const html = format_list.treeToHtml(tree, marginValue, marginUnits);
        return html.replace(/<br\s*\/?>\s*$/i, "");
    }
}

export default format_list;