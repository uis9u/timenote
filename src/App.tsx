import React, { useState, useEffect, useRef } from "react";

import { IconPencil, IconTrash } from "@tabler/icons-react";

interface Note {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
}

function timeToMinutes(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [text, setText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("timenotes_v3");
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("timenotes_v3", JSON.stringify(notes));
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
    }
  }, [notes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime || !text.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    if (startTime >= endTime) {
      alert("Please set the end time later than the start time.");
      return;
    }

    if (editingNoteId !== null) {
      setNotes((prevNotes) =>
        prevNotes
          .map((note) =>
            note.id === editingNoteId
              ? { ...note, startTime, endTime, text }
              : note
          )
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
      );
    } else {
      const newNote: Note = {
        id: Date.now(),
        startTime,
        endTime,
        text,
      };
      setNotes((prevNotes) =>
        [...prevNotes, newNote].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        )
      );
    }

    setStartTime("");
    setEndTime("");
    setText("");
    setEditingNoteId(null);
  };

  const handleEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setStartTime(note.startTime);
    setEndTime(note.endTime);
    setText(note.text);
  };

  const handleDelete = (id: number) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setStartTime("");
    setEndTime("");
    setText("");
  };

  return (
    <div className="container mt-4 mb-4">
      <header className="text-center mb-4">
        <h1 className="display-4">TimeNote</h1>
        <i className="bi bi-trophy-fill"></i>
      </header>

      <main>
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3 align-items-end">
                <div className="col-sm-4 col-md-3">
                  <label htmlFor="start-time-input" className="form-label">
                    0:00 ~
                  </label>
                  <input
                    id="start-time-input"
                    type="time"
                    className="form-control"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                    }}
                  />
                </div>
                <div className="col-sm-4 col-md-3">
                  <label
                    htmlFor="end-time-input"
                    className="text-right form-label"
                  >
                    ~ 23:59
                  </label>
                  <input
                    id="end-time-input"
                    type="time"
                    className="form-control"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                <div className="col-sm-12 col-md-4">
                  <label htmlFor="text-input" className="form-label">
                    activity
                  </label>
                  <input
                    id="text-input"
                    type="text"
                    className="form-control"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="coding"
                  />
                </div>
                <div className="col-sm-12 col-md-2 d-flex gap-2">
                  <button type="submit" className="btn btn-primary w-100">
                    {editingNoteId !== null ? "update" : "save"}
                  </button>
                  {editingNoteId !== null && (
                    <button
                      type="button"
                      className="btn btn-secondary w-100"
                      onClick={handleCancelEdit}
                    >
                      cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {notes.length > 0 ? (
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <h2 className="h5">Your Activities</h2>

            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-secondary">{notes.length}</span>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                  if (window.confirm("Download as .txt file")) {
                    notes.forEach((note) => {
                      const a = document.createElement("a");
                      a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(
                        `${note.startTime} - ${note.endTime} ${parseFloat(
                          (
                            (timeToMinutes(note.endTime) -
                              timeToMinutes(note.startTime)) /
                            60
                          ).toFixed(2)
                        )}h ${note.text}`
                      )}`;
                      a.download = `${new Date()
                        .toISOString()
                        .slice(0, 10)}.txt`;
                      a.click();
                    });
                  }
                }}
                disabled={notes.length === 0}
              >
                Export
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete all notes? This action cannot be undone."
                    )
                  ) {
                    setNotes([]);
                  }
                }}
                disabled={notes.length === 0}
              >
                Delete All
              </button>
            </div>
          </div>
        ) : null}

        <div className="list-group">
          {notes.length > 0 ? (
            notes.map((note) => {
              return (
                <div
                  key={note.id}
                  className={`list-group-item d-flex gap-2 justify-content-between align-items-center flex-wrap ${
                    editingNoteId === note.id ? "list-group-item-info" : ""
                  }`}
                >
                  <div className="me-auto my-1">
                    <strong className="font-monospace me-3">
                      {note.startTime} - {note.endTime}
                    </strong>
                    <span className="text-break me-3">
                      {`${parseFloat(
                        (
                          (timeToMinutes(note.endTime) -
                            timeToMinutes(note.startTime)) /
                          60
                        ).toFixed(2)
                      )}h`}
                    </span>
                    <span>{note.text}</span>
                  </div>
                  <div className="my-1">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleEdit(note)}
                    >
                      <IconPencil />
                    </button>
                  </div>
                  <div className="my-1">
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(note.id)}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted p-4">
              <p>You don't have any recorded activities yet.</p>
              <p>Try recording your first activity using the form above!</p>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center mt-4 text-muted">
        <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
