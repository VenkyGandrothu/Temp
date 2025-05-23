// src/App.js
import React from 'react';
import ModelViewer from './Components/ModelViewer';
import myModelUrl from './Assests/10DOfficeFireEscape.glb';  // now this works!

function App() {
  return (
    <div>
      {/* <h1>My GLTF Model in Three.js + React</h1> */}
      <ModelViewer url={myModelUrl} />
    </div>
  );
}

export default App;
