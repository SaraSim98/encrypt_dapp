/*import React, { useState } from "react";
import EncryptWithMetaMask from "./components/EncryptWithMetaMask";

function App() {
  const [error, setError] = useState("");
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Cifratura con MetaMask</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <EncryptWithMetaMask setError={setError} />
    </div>
  );
}

export default App;*/
import React, { useState } from "react";
import EncryptAndSignSeparate from "./components/EncryptAndSignSeparate";

function App() {
  return (
    <div className="App">
      <EncryptAndSignSeparate />
    </div>
  );
 
}

export default App;

