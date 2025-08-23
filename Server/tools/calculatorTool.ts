import { DynamicTool } from "@langchain/core/tools";

export const calculatorTool = new DynamicTool({
  name: "calculator",
  description:
    "Perform mathematical calculations, statistical analysis, and numerical computations.",
  func: async (expression: string) => {
    try {
      // Clean and validate the expression
      const cleanExpression = expression.trim();

      // Handle common mathematical functions and operations
      const result = evaluateMathExpression(cleanExpression);

      if (typeof result === "number" && !isNaN(result)) {
        return `Result: ${result}`;
      } else {
        return "Invalid mathematical expression. Please check your input.";
      }
    } catch (error: any) {
      return `Calculation error: ${error.message}`;
    }
  },
});

function evaluateMathExpression(expr: string): number {
  // Remove whitespace
  expr = expr.replace(/\s+/g, "");

  // Handle basic mathematical operations safely
  // This is a simple evaluator - for production, consider using a proper math library

  // Handle common functions
  expr = expr.replace(/sqrt\(([^)]+)\)/g, (match, p1) => {
    const val = evaluateMathExpression(p1);
    return Math.sqrt(val).toString();
  });

  expr = expr.replace(/pow\(([^,]+),([^)]+)\)/g, (match, p1, p2) => {
    const base = evaluateMathExpression(p1.trim());
    const exp = evaluateMathExpression(p2.trim());
    return Math.pow(base, exp).toString();
  });

  expr = expr.replace(/log\(([^)]+)\)/g, (match, p1) => {
    const val = evaluateMathExpression(p1);
    return Math.log10(val).toString();
  });

  expr = expr.replace(/ln\(([^)]+)\)/g, (match, p1) => {
    const val = evaluateMathExpression(p1);
    return Math.log(val).toString();
  });

  expr = expr.replace(/sin\(([^)]+)\)/g, (match, p1) => {
    const val = evaluateMathExpression(p1);
    return Math.sin(val).toString();
  });

  expr = expr.replace(/cos\(([^)]+)\)/g, (match, p1) => {
    const val = evaluateMathExpression(p1);
    return Math.cos(val).toString();
  });

  expr = expr.replace(/tan\(([^)]+)\)/g, (match, p1) => {
    const val = evaluateMathExpression(p1);
    return Math.tan(val).toString();
  });

  // Replace constants
  expr = expr.replace(/pi/gi, Math.PI.toString());
  expr = expr.replace(/e/gi, Math.E.toString());

  // Validate expression contains only allowed characters
  if (!/^[0-9+\-*/.()]+$/.test(expr)) {
    throw new Error("Expression contains invalid characters");
  }

  // Use Function constructor for safe evaluation (better than eval)
  try {
    return Function(`"use strict"; return (${expr})`)();
  } catch (error) {
    throw new Error("Invalid mathematical expression");
  }
}

// Statistical functions helper
export const statisticsTool = new DynamicTool({
  name: "statistics",
  description:
    "Calculate statistical measures like mean, median, mode, standard deviation for datasets.",
  func: async (input: string) => {
    try {
      // Parse input as comma-separated numbers or JSON array
      let numbers: number[] = [];

      if (input.startsWith("[") && input.endsWith("]")) {
        numbers = JSON.parse(input);
      } else {
        numbers = input.split(",").map((n) => parseFloat(n.trim()));
      }

      if (numbers.some(isNaN)) {
        return "Invalid input. Please provide numbers separated by commas or as a JSON array.";
      }

      const stats = calculateStatistics(numbers);
      return formatStatistics(stats);
    } catch (error: any) {
      return `Statistics calculation error: ${error.message}`;
    }
  },
});

function calculateStatistics(numbers: number[]) {
  const n = numbers.length;
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = sum / n;

  const sorted = [...numbers].sort((a, b) => a - b);
  const median =
    n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

  const variance =
    numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  return {
    count: n,
    sum,
    mean,
    median,
    variance,
    standardDeviation: stdDev,
    min,
    max,
    range: max - min,
  };
}

function formatStatistics(stats: any): string {
  return `Statistical Analysis:
Count: ${stats.count}
Sum: ${stats.sum.toFixed(2)}
Mean: ${stats.mean.toFixed(2)}
Median: ${stats.median.toFixed(2)}
Standard Deviation: ${stats.standardDeviation.toFixed(2)}
Variance: ${stats.variance.toFixed(2)}
Min: ${stats.min}
Max: ${stats.max}
Range: ${stats.range.toFixed(2)}`;
}
