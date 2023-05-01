import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function getPartitions() {
  window.electron.ipcRenderer.sendMessage('volume-system:getPartitions', [ document.getElementById('imagePath').value ]);
}

function Hello() {
  return (
    <div>
      <input type="text" id="imagePath" />
      <br />
      <button type="button" onClick={getPartitions}>
        Get Disk Partitions
      </button>
      <br />
      <br />
      <span id="type" />
      <br />
      <span id="sectorSize" />
      <br />
      <span id="partitions" style={{whiteSpace: 'pre'}} />
      <br />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
