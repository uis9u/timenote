import React, { useState, useEffect } from "react";

// Define the structure of a single note
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
  // State for the list of notes
  const [notes, setNotes] = useState<Note[]>([]);
  // State for the form inputs
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [text, setText] = useState("");
  // State to track the note being edited
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  // Load notes from localStorage when the component mounts
  useEffect(() => {
    try {
      // Using a new key to avoid conflicts with old data structure
      const savedNotes = localStorage.getItem("timenotes_v3");
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
    }
  }, []);

  // Save notes to localStorage whenever the notes state changes
  useEffect(() => {
    try {
      localStorage.setItem("timenotes_v3", JSON.stringify(notes));
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
    }
  }, [notes]);

  // Handle form submission for both creating and updating notes
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime || !text.trim()) {
      alert("開始時間、終了時間、内容のすべてを入力してください。");
      return;
    }

    if (startTime >= endTime) {
      alert("終了時間は開始時間より後に設定してください。");
      return;
    }

    // If we are editing, update the existing note
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
      // Otherwise, create a new note
      const newNote: Note = {
        id: Date.now(), // Use timestamp for a unique ID
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

    // Reset form and editing state
    setStartTime("");
    setEndTime("");
    setText("");
    setEditingNoteId(null);
  };

  // Handle starting the edit process
  const handleEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setStartTime(note.startTime);
    setEndTime(note.endTime);
    setText(note.text);
  };

  // Handle note deletion
  const handleDelete = (id: number) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  // Handle canceling an edit
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
        <p className="lead">timeline note app</p>
      </header>

      <main>
        {/* Input Form */}
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3 align-items-end">
                <div className="col-sm-4 col-md-3">
                  <label htmlFor="start-time-input" className="form-label">
                    start time
                  </label>
                  <input
                    id="start-time-input"
                    type="time"
                    className="form-control"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="col-sm-4 col-md-3">
                  <label htmlFor="end-time-input" className="form-label">
                    end time
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
                    What to do
                  </label>
                  <input
                    id="text-input"
                    type="text"
                    className="form-control"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="meeting..."
                  />
                </div>
                <div className="col-sm-12 col-md-2 d-flex gap-2">
                  <button type="submit" className="btn btn-primary w-100">
                    {editingNoteId !== null ? "更新" : "保存"}
                  </button>
                  {editingNoteId !== null && (
                    <button
                      type="button"
                      className="btn btn-secondary w-100"
                      onClick={handleCancelEdit}
                    >
                      キャンセル
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Notes List */}
        <div className="list-group">
          {notes.length > 0 ? (
            notes.map((note) => (
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
                    {`${
                      (timeToMinutes(note.endTime) -
                        timeToMinutes(note.startTime)) /
                      60
                    }h`}
                  </span>
                  <span>{note.text}</span>
                </div>
                <div className="my-1">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleEdit(note)}
                  >
                    編集
                  </button>
                </div>
                <div className="my-1">
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(note.id)}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted p-4">
              <p>You don't have any recorded activities yet.</p>
              <p>Try recording your first activity using the form above!</p>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center mt-4 text-muted">
        <p>&copy; {new Date().getFullYear()} TimeNote App</p>
      </footer>
    </div>
  );
};

export default App;
