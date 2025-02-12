import { useState, useEffect } from "react";
import './App.css';

export default function RoutineTimer() {
  const [routines, setRoutines] = useState(() => {
    const savedRoutines = localStorage.getItem("routines");
    return savedRoutines ? JSON.parse(savedRoutines) : [];
  });
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [editMode, setEditMode] = useState(false); // Global Edit Mode

  useEffect(() => {
    localStorage.setItem("routines", JSON.stringify(routines));
  }, [routines]);

  // Add a new routine
  const addRoutine = () => {
    if (newRoutineName) {
      setRoutines([...routines, { name: newRoutineName, tasks: [] }]);
      setNewRoutineName("");
    }
  };

  // Add a task to a routine (time in minutes)
  const addTaskToRoutine = (routineIndex) => {
    if (newTaskName && newTaskTime) {
      const updatedRoutines = [...routines];
      updatedRoutines[routineIndex].tasks.push({ name: newTaskName, time: parseInt(newTaskTime, 10) * 60 });
      setRoutines(updatedRoutines);
      setNewTaskName("");
      setNewTaskTime("");
    }
  };

  // Edit a routine name
  const editRoutine = (index, newName) => {
    const updatedRoutines = [...routines];
    updatedRoutines[index].name = newName;
    setRoutines(updatedRoutines);
  };

  // Edit a task (time in minutes, converted to seconds)
  const editTask = (routineIndex, taskIndex, newName, newTime) => {
    const updatedRoutines = [...routines];
    updatedRoutines[routineIndex].tasks[taskIndex] = { name: newName, time: parseInt(newTime, 10) * 60 };
    setRoutines(updatedRoutines);
  };

  // Delete a task
  const deleteTask = (routineIndex, taskIndex) => {
    const updatedRoutines = [...routines];
    updatedRoutines[routineIndex].tasks.splice(taskIndex, 1);
    setRoutines(updatedRoutines);
  };

  // Delete a routine
  const deleteRoutine = (routineIndex) => {
    const updatedRoutines = routines.filter((_, index) => index !== routineIndex);
    setRoutines(updatedRoutines);
  };

  // Start or Pause a routine
  const toggleRoutine = () => {
    setIsRunning(!isRunning);
  };

  // Start a routine
  const startRoutine = (routine) => {
    setCurrentRoutine(routine);
    setCurrentTaskIndex(0);
    setTimeLeft(routine.tasks[0]?.time || 0);
    setIsRunning(true);
  };

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (isRunning && timeLeft === 0) {
      moveToNextTask();
    }
  }, [isRunning, timeLeft]);

  // Move to the next task
  const moveToNextTask = () => {
    if (currentRoutine && currentTaskIndex < currentRoutine.tasks.length - 1) {
      const nextIndex = currentTaskIndex + 1;
      setCurrentTaskIndex(nextIndex);
      setTimeLeft(currentRoutine.tasks[nextIndex].time);
    } else {
      setIsRunning(false);
      setCurrentRoutine(null);
    }
  };

  // Convert seconds to minutes for display
  const secondsToMinutes = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Toggle global edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <div className="container">
      <div>
        <input
          type="text"
          placeholder="New Routine Name"
          value={newRoutineName}
          onChange={(e) => setNewRoutineName(e.target.value)}
        />
        <button onClick={addRoutine}>Add Routine</button>
      </div>
      <ul>
        {routines.map((routine, index) => (
          <li key={index}>
            {/* Display the routine name, with input fields in edit mode */}
            {editMode ? (
              <input
                type="text"
                value={routine.name}
                onChange={(e) => editRoutine(index, e.target.value)}
              />
            ) : (
              <h3>{routine.name}</h3>
            )}
            
            {/* Show delete button only in edit mode */}
            {editMode && (
              <button onClick={() => deleteRoutine(index)}>Delete Routine</button>
            )}

            {/* Show Task input and Add Task button */}
            {editMode && (
              <div>
                <input
                  type="text"
                  placeholder="Task Name"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Time (min)"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                />
                <button onClick={() => addTaskToRoutine(index)}>Add Task</button>
              </div>
            )}
            <button onClick={() => startRoutine(routine)}>Start Routine</button>
            <ul>
              {routine.tasks.map((task, taskIndex) => (
                <li key={taskIndex}>
                  {/* Display task name and time, with inputs for editing */}
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => editTask(index, taskIndex, e.target.value, task.time)}
                      />
                      <input
                        type="number"
                        value={Math.floor(task.time / 60)} // Display time in minutes
                        onChange={(e) => editTask(index, taskIndex, task.name, e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <h4>{task.name}</h4>
                      <p>{secondsToMinutes(task.time)}</p>
                    </>
                  )}
                  
                  {/* Show delete button only in edit mode */}
                  {editMode && (
                    <button onClick={() => deleteTask(index, taskIndex)}>Delete Task</button>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* Global Edit Mode button */}
      <div>
        <button onClick={toggleEditMode}>
          {editMode ? "Save" : "Edit Mode"}
        </button>
      </div>

      {/* Display active routine timer */}
      {isRunning && currentRoutine && (
        <div>
          <h2>{currentRoutine.name}</h2>
          <h3>Current Task: {currentRoutine.tasks[currentTaskIndex]?.name || ""}</h3>
          <h3>Time Left: {secondsToMinutes(timeLeft)}</h3>
          <button onClick={toggleRoutine}>{isRunning ? "Pause" : "Resume"}</button>
        </div>
      )}
    </div>
  );
}
