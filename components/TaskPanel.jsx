import React, { useState } from 'react';

const mockTasks = [
  { id: 1, agentId: 2, title: 'Follow up with John Doe', status: 'Pending', due: '2025-12-28' },
  { id: 2, agentId: 3, title: 'Send proposal to Jane Roe', status: 'In Progress', due: '2025-12-27' },
];

function TaskPanel({ agentId }) {
  const [tasks, setTasks] = useState(mockTasks.filter(t => t.agentId === agentId));
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAddTask = () => {
    if (!newTask || !dueDate) return;
    setTasks([...tasks, { id: Date.now(), agentId, title: newTask, status: 'Pending', due: dueDate }]);
    setNewTask('');
    setDueDate('');
  };

  const handleStatusChange = (id, status) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <div className="task-panel bg-white p-4 rounded shadow mt-4">
      <h3 className="font-bold mb-2">Tasks & Follow-ups</h3>
      <ul className="mb-2">
        {tasks.map(task => (
          <li key={task.id} className="mb-1 flex items-center justify-between">
            <span>{task.title} <span className="text-xs text-gray-500">(Due: {task.due})</span></span>
            <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)} className="ml-2 border rounded px-1">
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mb-2">
        <input type="text" className="border rounded px-2 py-1 flex-1" placeholder="New task..." value={newTask} onChange={e => setNewTask(e.target.value)} />
        <input type="date" className="border rounded px-2 py-1" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleAddTask}>Add</button>
      </div>
    </div>
  );
}

export default TaskPanel;
