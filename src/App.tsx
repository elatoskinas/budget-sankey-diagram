import React, { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";
import './App.css';

interface BudgetEntry {
    category: string
    amount: number
}

interface BudgetData {
    income: Array<BudgetEntry>
    expenses: { [key: string]: Array<BudgetEntry> }
}

function transformBudgetDataToSankeyData(budgetData: BudgetData): Array<Array<any>> {
    const result: Array<Array<any>> = [['From', 'To', 'Weight']];

    for (const entry of budgetData.income) {
        result.push([entry.category, "Income", entry.amount]);
    }

    for (const key of Object.keys(budgetData.expenses)) {
        const groupData = budgetData.expenses[key];
        
        const groupSum = groupData.reduce((prev: number, entry: BudgetEntry) => {
          return (prev + entry.amount);
        }, 0);

        result.push(["Income", key, groupSum]);

        for (const entry of groupData) {
            result.push([key, entry.category, entry.amount]);
        }
    }

    return result;
}

function App() {
  const [sankeyData, setSankeyData] = useState({});

  useEffect(() => {
      fetch("./budget-data.json").then(async (res) => {
          const resJson = await res;
          const budgetData: BudgetData = await resJson.json();
          const newSankeyData = transformBudgetDataToSankeyData(budgetData);

          setSankeyData(newSankeyData);
      })
  }, [])

  return (
    <div className="App">
        <Chart 
          width={1000}
          chartType="Sankey"
          data={sankeyData}
        />
    </div>
  );
}

export default App;
