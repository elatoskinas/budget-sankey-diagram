import React, { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";
import './App.css';

interface BudgetEntry {
    category: string
    amount: number
}

interface BudgetData {
    currency: string
    income: Array<BudgetEntry>
    expenses: { [key: string]: Array<BudgetEntry> }
}

function formatBudgetNodeLabel(
  category: string,
  amount: number,
  currency: string,
  percentage?: number
): string {
    const formatter = new Intl.NumberFormat(undefined, {
        'style': 'currency',
        'currency': currency,
        maximumFractionDigits: 0
    });
    
    return `${category}: ${formatter.format(amount)}`
            + (percentage ? ` (${percentage}%)` : '');
}

function sumBudgetEntries(entries: BudgetEntry[]) {
    return entries.reduce((prev: number, entry: BudgetEntry) => {
      return (prev + entry.amount);
    }, 0);
}

function calculatePercentage(amount: number, total: number, decimals=1): number {
    if (total === 0) {
        return 0;
    }

    const decimalPow = 10 ** decimals;
    return Math.round((amount / total) * 100 * decimalPow) / decimalPow;
}

function transformBudgetDataToSankeyData(budgetData: BudgetData): Array<Array<any>> {
    const result: Array<Array<any>> = [['From', 'To', 'Weight']];

    const totalIncome = sumBudgetEntries(budgetData.income);
    const incomeLabel = formatBudgetNodeLabel("Income", totalIncome, budgetData.currency, 100);

    for (const entry of budgetData.income) {
        result.push([
          formatBudgetNodeLabel(
            entry.category, entry.amount, budgetData.currency,
            calculatePercentage(entry.amount, totalIncome)
          ),
          incomeLabel,
          entry.amount
        ]);
    }

    for (const key of Object.keys(budgetData.expenses)) {
        const groupData = budgetData.expenses[key];        
        const groupSum = groupData.reduce((prev: number, entry: BudgetEntry) => {
          return (prev + entry.amount);
        }, 0);
        const groupLabel = formatBudgetNodeLabel(
          key, groupSum, budgetData.currency,
          calculatePercentage(groupSum, totalIncome)
        );

        result.push([incomeLabel, groupLabel, groupSum]);

        for (const entry of groupData) {
            result.push([
              groupLabel,
              formatBudgetNodeLabel(
                entry.category, entry.amount, budgetData.currency,
                calculatePercentage(entry.amount, totalIncome)
              ),
              entry.amount
            ]);
        }
    }

    return result;
}

function App() {
  const [sankeyData, setSankeyData] = useState({});

  useEffect(() => {
      fetch("./budget-data-sample.json").then(async (res) => {
          const resJson = await res;
          const budgetData: BudgetData = await resJson.json();
          const newSankeyData = transformBudgetDataToSankeyData(budgetData);

          setSankeyData(newSankeyData);
      })
  }, [])

  return (
    <div className="App">
        <Chart 
          width={1200}
          chartType="Sankey"
          data={sankeyData}
          options={{
            sankey: {
              node: {
                label: {
                  fontSize: 12 
                },
              },
              link: {
                color: { fill: "#a0ebaa" }
              }
            },
          }}
        />
    </div>
  );
}

export default App;
