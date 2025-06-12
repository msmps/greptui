import { type Element, getAttribute, query, queryAll } from "@parse5/tools";
import chalk from "chalk";
import { type DefaultTreeAdapterTypes, parse } from "parse5";

export type ParsedRow = {
  lineNumber: number;
  code: string;
  hasJump: boolean;
};

type Node = DefaultTreeAdapterTypes.Node;
type TextNode = DefaultTreeAdapterTypes.TextNode;

function isTextNode(node: Node): node is TextNode {
  return node.nodeName === "#text";
}

function isElementNode(node: Node): node is Element {
  return node.nodeName[0] !== "#";
}

function getHighlightedCode(node: Node): string {
  if (isTextNode(node)) {
    return node.value;
  }

  if (isElementNode(node)) {
    const childrenText = node.childNodes.map(getHighlightedCode).join("");
    if (node.tagName === "mark") {
      return chalk.bgHex("#cde7ff").black.bold(childrenText);
    }
    return childrenText;
  }

  return "";
}

export function parseHtml(html: string): ParsedRow[] {
  const document = parse(html);

  const trs = Array.from(
    queryAll<Element>(document, (node) => node.nodeName === "tr"),
  );

  return trs.map((tr) => {
    const lineNumberStr = getAttribute(tr, "data-line");
    const lineNumber = lineNumberStr ? Number.parseInt(lineNumberStr, 10) : 0;

    const hasJump = !!query(
      tr,
      (n) =>
        isElementNode(n) &&
        n.tagName === "div" &&
        getAttribute(n, "class") === "jump",
    );

    const preElement = query(
      tr,
      (n) => isElementNode(n) && n.tagName === "pre",
    );

    const code = preElement ? getHighlightedCode(preElement) : "";

    return {
      lineNumber,
      code,
      hasJump,
    };
  });
}
