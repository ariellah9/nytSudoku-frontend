import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  // State to control which page to show: 'form' or 'leaderboard'
  const [page, setPage] = useState('form');

  const BACKEND_URL = "https://nytsudoku.onrender.com";

  // Form input states
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [level, setLevel] = useState('easy');

  // State to hold leaderboard data fetched from backend
  const [leaderboard, setLeaderboard] = useState([]);

  // State to hold current sorting key for leaderboard
  const [sortBy, setSortBy] = useState('overall_avg');

  // Function to fetch leaderboard data from backend API
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/submit`);
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch leaderboard whenever we switch to leaderboard page
  useEffect(() => {
    if (page === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [page]);

  // Handle submit button click: validate and send data to backend
  const handleSubmit = async () => {
    if (!name || !time) return alert("Enter name and score");
  
    const adjustedTime =
      level === "easy" ? Number(time) * 1.5 :
      level === "medium" ? Number(time) * 1.0 :
      level === "hard" ? Number(time) * 0.5 :
      Number(time);
  
    let rawName = name.trim();
    let normalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
  
    try {
      const res = await fetch(`${BACKEND_URL}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: normalizedName,
          time: Number(time),
          level: level
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setName("");
        setTime("");
        await fetchLeaderboard();
        setPage("leaderboard");
      } else {
        alert(data.error || "Error submitting score");
      }
  
    } catch (err) {
      console.error(err);
      alert("Error submitting score");
    }
  };
  
let entries = Array.isArray(leaderboard)
  ? leaderboard.map(player => ({ ...player }))
  : [];

  if (leaderboard) {
    if (Array.isArray(leaderboard)) {
      if (
        leaderboard.length > 0 &&
        typeof leaderboard[0] === 'object' &&
        !Array.isArray(leaderboard[0])
      ) {
        entries = leaderboard.map((player) => ({ name: player.name, ...player }));
      } else {
        entries = leaderboard.map(([name, time]) => ({ name, time }));
      }
    } else if (typeof leaderboard === 'object') {
      entries = Object.entries(leaderboard).map(([name, stats]) => ({
        name,
        ...stats,
      }));
    }
  }

  // Define the columns in the order you want with readable labels
  const columns = [
    { key: 'overall_avg', label: 'Overall Average' },
    { key: 'overall_games', label: 'Overall Games' },
    { key: 'easy_avg', label: 'Easy Average' },
    { key: 'easy_games', label: 'Easy Games' },
    { key: 'medium_avg', label: 'Medium Average' },
    { key: 'medium_games', label: 'Medium Games' },
    { key: 'hard_avg', label: 'Hard Average' },
    { key: 'hard_games', label: 'Hard Games' },
  ];

  // Sorting entries by selected column descending
  entries.sort((a, b) => {
    const aVal = a[sortBy] != null ? a[sortBy] : Infinity; 
    const bVal = b[sortBy] != null ? b[sortBy] : Infinity;
    return aVal - bVal;
  });

  // If current page is the submission form page:
  if (page === 'form') {
    return (
      <div style={{ maxWidth: 400, margin: '50px auto', textAlign: 'center' }}>
        <h1>Submit Your Sudoku Score</h1>

        {/* Two inputs side-by-side for Name and Score */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}  // Update name state on input
            style={{ flex: 1, padding: '8px' }}
          />
          <input
            type="number"
            placeholder="Score"
            value={time}
            onChange={(e) => setTime(e.target.value)}  // Update time state on input
            style={{ flex: 1, padding: '8px' }}
          />
        </div>

        {/* Dropdown select for difficulty level */}
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}  // Update level state on select
          style={{ padding: '8px', width: '100%', marginBottom: '20px' }}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* Submit and Leaderboard buttons */}
        <div>
          <button
            onClick={handleSubmit}  // Call submit handler
            style={{ padding: '10px 20px', marginRight: '10px' }}
          >
            Submit
          </button>
          <button
            onClick={() => setPage('leaderboard')}  // Switch to leaderboard page without submitting
            style={{ padding: '10px 20px' }}
          >
            Leaderboard
          </button>
        </div>
      </div>
    );
  }

  // If current page is the leaderboard page:
  if (page === 'leaderboard') {
    // Leaderboard page
    return (
      <div style={{ maxWidth: 700, margin: '50px auto', textAlign: 'center' }}>
        <h1>Leaderboard</h1>

        {/* Dropdown select for sorting by */}
        <select
          style={{ padding: '8px', width: '35%', marginBottom: '20px' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="easy_avg">Easy Score</option>
          <option value="medium_avg">Medium Score</option>
          <option value="hard_avg">Hard Score</option>
          <option value="overall_avg">Overall Score</option>
        </select>

        {/* Leaderboard Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ width: '150px', border: '1px solid black', padding: '8px' }}>Name</th>
            {columns.map(col => (
              <th
                key={col.key}
                style={{ width: '120px', border: '1px solid black', padding: '8px' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((player, idx) => (
            <tr key={idx}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{player.name}</td>
              {columns.map(col => (
                <td key={col.key} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>
                  {player[col.key] !== undefined
                    ? typeof player[col.key] === 'number'
                      ? player[col.key].toFixed(2)
                      : player[col.key]
                    : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

        {/* Button to go back to submission form */}
        <button
          onClick={() => setPage('form')}
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          Add Another?
        </button>
      </div>
    );
  }

  // Default fallback
  return null;
}

export default App;