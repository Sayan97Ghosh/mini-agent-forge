import { evaluate } from "mathjs";

export function evaluateExpression(prompt: string): number {
  try {
    const result = evaluate(prompt);
    if (typeof result !== 'number') throw new Error("Not a valid number result");
    return result;
  } catch {
    throw new Error("Invalid math expression");
  }
}