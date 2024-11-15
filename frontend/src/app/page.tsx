"use client";
import { useEffect, useState } from "react";
import { fetchTasks } from "@/utils/tasks";
import BlockExplorer from "@/components/BlockExplorer/BlockExplorer";

export default function Home() {
  const [blocks, setBlocks] = useState([]);
  const [task, setTask] = useState<any[]>([]);

  useEffect(() => {
    const getTasks = async () => {
      //const tasks = await fetchTasks("layer1r93mdrsuzlzsh70n8mmpzachj6sfpw6r0rvd2fx7skxfdlnclgdsdnryy8");
      const tasks = await fetchTasks("layer1dkewprupg2xcr4nvmztc5ekz5ed3cu5qzchmxq9rv7sz5s5kq3psjc7z9e");
      setBlocks(tasks as any);
      setTask(tasks);
      console.log(tasks);
    };
    // {id: '3', status: 'COMPLETE', addedTime: '2024-11-12T07:27:38.311Z', finishTime: '2024-11-12T07:27:38.311Z', json: '{"y":144}'}

    getTasks();
  }, []);
  
  function calculateFastExitScore(fastExitValue: number): number {
    if (fastExitValue <= 0) {
        return 100;
    }
    const score = 100 - (97 * Math.log10(1 + fastExitValue) / Math.log10(20000));
    return Math.max(1, Math.round(score));
  }

  
  const processedTasks = task.map(t => {
    try {
      const jsonData = JSON.parse(t.json);
      const value = Object.values(jsonData).find(v => typeof v === 'number');
      if (value !== undefined) {
        return {
          ...t,
          json: ((Math.abs(value) % 2.9) + 0.1)
        };
      }
    } catch (e) {
      console.warn('Failed to parse JSON for task:', t.id, e);
    }
    return t;
  });
  const fastExitRate = processedTasks[0]?.json || 0;
  const reliabilityScore = calculateFastExitScore(fastExitRate);
  return (
    <main className="container mx-auto p-6">
      <BlockExplorer 
        blocks={blocks}
        reliabilityScore={reliabilityScore}
        calculateFastExitScore={calculateFastExitScore}
      />
    </main>
  );
}